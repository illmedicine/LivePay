const http = require('http');
const https = require('https');
const crypto = require('crypto');

const PORT = process.env.LIVEPAY_EVENT_PORT ? Number(process.env.LIVEPAY_EVENT_PORT) : 4317;

const LIVEPAY_PAIRING_SECRET = process.env.LIVEPAY_PAIRING_SECRET || '';

const clientsByUserId = new Map();
const backlogByUserId = new Map();
const MAX_BACKLOG = 200;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/oauth/google/callback`;
const YT_HANDLES = (process.env.LIVEPAY_YT_HANDLES || '@illmedicine,@illmedicineai')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

let oauthState = null;
let googleTokens = null;
let lastYouTubeSnapshot = new Map();
let googleUserId = null;

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecodeToString(b64url) {
  const normalized = String(b64url).replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64').toString('utf8');
}

function decodeJwtPayload(token) {
  const parts = String(token || '').split('.');
  if (parts.length < 2) return null;
  try {
    return JSON.parse(base64UrlDecodeToString(parts[1]));
  } catch {
    return null;
  }
}

function signPairingToken(claims) {
  if (!LIVEPAY_PAIRING_SECRET) return null;
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    ...claims,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const sig = crypto.createHmac('sha256', LIVEPAY_PAIRING_SECRET).update(signingInput).digest();
  const encodedSig = base64UrlEncode(sig);
  return `${signingInput}.${encodedSig}`;
}

function verifyPairingToken(token) {
  if (!LIVEPAY_PAIRING_SECRET) return null;
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const signingInput = `${h}.${p}`;
  const expected = crypto.createHmac('sha256', LIVEPAY_PAIRING_SECRET).update(signingInput).digest();
  const expectedEncoded = base64UrlEncode(expected);
  try {
    const a = Buffer.from(s);
    const b = Buffer.from(expectedEncoded);
    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  if (typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp) return null;
  if (!payload.sub) return null;
  return payload;
}

function getAuthToken(req) {
  const raw = req.headers.authorization;
  if (!raw || typeof raw !== 'string') return null;
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type,authorization',
  });
  res.end(data);
}

function sseWrite(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function broadcastToUser(userId, event) {
  if (!userId) return;
  const backlog = backlogByUserId.get(userId) || [];
  backlog.push(event);
  if (backlog.length > MAX_BACKLOG) backlog.splice(0, backlog.length - MAX_BACKLOG);
  backlogByUserId.set(userId, backlog);

  const clients = clientsByUserId.get(userId) || new Set();
  for (const res of clients) {
    try {
      sseWrite(res, event);
    } catch {
      clients.delete(res);
    }
  }
}

function redirect(res, location) {
  res.writeHead(302, {
    Location: location,
    'Access-Control-Allow-Origin': '*',
  });
  res.end();
}

function html(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function exchangeGoogleCodeForTokens(code) {
  const payload = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  }).toString();

  const res = await httpsRequest(
    {
      method: 'POST',
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': Buffer.byteLength(payload),
      },
    },
    payload,
  );

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`token exchange failed: ${res.status} ${res.body}`);
  }

  const json = JSON.parse(res.body);
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    id_token: json.id_token,
    expires_in: json.expires_in,
    token_type: json.token_type,
    scope: json.scope,
    obtained_at: Date.now(),
  };
}

async function refreshGoogleAccessToken(refreshToken) {
  const payload = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  }).toString();

  const res = await httpsRequest(
    {
      method: 'POST',
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': Buffer.byteLength(payload),
      },
    },
    payload,
  );

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`token refresh failed: ${res.status} ${res.body}`);
  }

  const json = JSON.parse(res.body);
  return {
    access_token: json.access_token,
    expires_in: json.expires_in,
    token_type: json.token_type,
    scope: json.scope,
    obtained_at: Date.now(),
  };
}

function tokenExpired(tokens) {
  if (!tokens || !tokens.access_token || !tokens.obtained_at || !tokens.expires_in) return true;
  const expiresAt = tokens.obtained_at + tokens.expires_in * 1000;
  return Date.now() > expiresAt - 30_000;
}

async function ensureGoogleAccessToken() {
  if (!googleTokens || !googleTokens.access_token) return null;
  if (!tokenExpired(googleTokens)) return googleTokens.access_token;

  if (googleTokens.refresh_token) {
    const refreshed = await refreshGoogleAccessToken(googleTokens.refresh_token);
    googleTokens = { ...googleTokens, ...refreshed };
    return googleTokens.access_token;
  }

  return null;
}

async function fetchYouTubeChannelStatsByHandle(accessToken, handle) {
  const forHandle = handle.startsWith('@') ? handle.slice(1) : handle;
  const path = `/youtube/v3/channels?part=statistics&forHandle=${encodeURIComponent(forHandle)}`;

  const res = await httpsRequest({
    method: 'GET',
    hostname: 'youtube.googleapis.com',
    path,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`youtube fetch failed: ${res.status} ${res.body}`);
  }

  const json = JSON.parse(res.body);
  const item = json.items && json.items[0];
  const stats = item && item.statistics;

  const subscriberCount = stats && stats.subscriberCount ? Number(stats.subscriberCount) : undefined;
  const viewCount = stats && stats.viewCount ? Number(stats.viewCount) : undefined;

  return { subscriberCount, viewCount };
}

function estimateViewHoursFromViews(viewCount) {
  if (typeof viewCount !== 'number' || Number.isNaN(viewCount)) return undefined;
  return Math.round(viewCount * 0.00005 * 100) / 100;
}

async function pollYouTube() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return;
  if (!googleUserId) return;

  const accessToken = await ensureGoogleAccessToken();
  if (!accessToken) return;

  for (const handle of YT_HANDLES) {
    try {
      const stats = await fetchYouTubeChannelStatsByHandle(accessToken, handle);
      const prev = lastYouTubeSnapshot.get(handle) || {};

      if (typeof stats.subscriberCount === 'number' || typeof stats.viewCount === 'number') {
        lastYouTubeSnapshot.set(handle, stats);
        broadcastToUser(googleUserId, {
          source: 'google_oauth',
          type: 'youtube_oauth_stats',
          handle,
          subscriberCount: typeof stats.subscriberCount === 'number' ? stats.subscriberCount : prev.subscriberCount,
          viewHours: estimateViewHoursFromViews(typeof stats.viewCount === 'number' ? stats.viewCount : prev.viewCount),
        });
      }
    } catch {
      // ignore
    }
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'content-type,authorization',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/oauth/google/start') {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      html(res, 400, '<h3>Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET env vars.</h3>');
      return;
    }

    oauthState = crypto.randomBytes(16).toString('hex');
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', oauthState);
    authUrl.searchParams.set('scope', 'openid email https://www.googleapis.com/auth/youtube.readonly');

    redirect(res, authUrl.toString());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/oauth/google/callback') {
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');

    if (!code) {
      html(res, 400, '<h3>Missing code</h3>');
      return;
    }

    if (!oauthState || state !== oauthState) {
      html(res, 400, '<h3>Invalid state</h3>');
      return;
    }

    try {
      googleTokens = await exchangeGoogleCodeForTokens(code);

      const claims = googleTokens && googleTokens.id_token ? decodeJwtPayload(googleTokens.id_token) : null;
      googleUserId = claims && claims.sub ? String(claims.sub) : null;

      html(res, 200, '<h3>Google OAuth connected. You can close this tab.</h3>');
      pollYouTube().catch(() => {});
    } catch (e) {
      html(res, 400, `<h3>OAuth failed</h3><pre>${String(e && e.message ? e.message : e)}</pre>`);
    }

    return;
  }

  if (req.method === 'GET' && url.pathname === '/oauth/google/status') {
    json(res, 200, {
      ok: true,
      configured: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
      connected: Boolean(googleTokens && googleTokens.access_token),
      handles: YT_HANDLES,
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/oauth/google/pairing-token') {
    if (!LIVEPAY_PAIRING_SECRET) {
      json(res, 400, { ok: false, error: 'Missing LIVEPAY_PAIRING_SECRET env var.' });
      return;
    }
    if (!googleTokens || !googleTokens.id_token) {
      json(res, 400, { ok: false, error: 'Google OAuth not connected (missing id_token). Reconnect OAuth.' });
      return;
    }
    const googleClaims = decodeJwtPayload(googleTokens.id_token);
    if (!googleClaims || !googleClaims.sub) {
      json(res, 400, { ok: false, error: 'Unable to derive user identity from id_token.' });
      return;
    }

    const token = signPairingToken({ sub: String(googleClaims.sub), email: googleClaims.email });
    if (!token) {
      json(res, 400, { ok: false, error: 'Unable to sign pairing token.' });
      return;
    }

    json(res, 200, { ok: true, token });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/events') {
    const rawToken = getAuthToken(req) || url.searchParams.get('token');
    const claims = verifyPairingToken(rawToken);
    if (!claims) {
      json(res, 401, { ok: false, error: 'Unauthorized' });
      return;
    }
    const userId = String(claims.sub);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('\n');

    const clients = clientsByUserId.get(userId) || new Set();
    clients.add(res);
    clientsByUserId.set(userId, clients);

    const backlog = backlogByUserId.get(userId) || [];
    for (const e of backlog) sseWrite(res, e);

    req.on('close', () => {
      const set = clientsByUserId.get(userId);
      if (set) set.delete(res);
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/ingest') {
    const rawToken = getAuthToken(req);
    const claims = verifyPairingToken(rawToken);
    if (!claims) {
      json(res, 401, { ok: false, error: 'Unauthorized' });
      return;
    }
    const userId = String(claims.sub);

    try {
      const raw = await readBody(req);
      const data = raw ? JSON.parse(raw) : {};

      const event = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ts: Date.now(),
        userId,
        ...data,
      };

      broadcastToUser(userId, event);
      json(res, 200, { ok: true });
    } catch (e) {
      json(res, 400, { ok: false, error: e && e.message ? e.message : 'invalid payload' });
    }
    return;
  }

  json(res, 404, { ok: false, error: 'not found' });
});

server.listen(PORT, () => {
  process.stdout.write(`LivePay event server listening on http://localhost:${PORT}\n`);
});

setInterval(() => {
  pollYouTube().catch(() => {});
}, 60_000);
