const DEFAULT_ENDPOINT = 'http://localhost:4317/ingest';

function setStatus(text) {
  const el = document.getElementById('status');
  if (el) el.textContent = text || '';
}

function getInput() {
  return document.getElementById('endpoint');
}

function getTokenInput() {
  return document.getElementById('token');
}

function normalizeEndpoint(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  return v;
}

function load() {
  chrome.storage.sync.get(['livepayEndpoint', 'livepayPairingToken'], (res) => {
    const input = getInput();
    const tokenInput = getTokenInput();
    if (!input) return;
    const endpoint = res && typeof res.livepayEndpoint === 'string' ? res.livepayEndpoint : '';
    input.value = endpoint || DEFAULT_ENDPOINT;

    if (tokenInput) {
      const token = res && typeof res.livepayPairingToken === 'string' ? res.livepayPairingToken : '';
      tokenInput.value = token || '';
    }
    setStatus('');
  });
}

function save() {
  const input = getInput();
  if (!input) return;

  const tokenInput = getTokenInput();

  const endpoint = normalizeEndpoint(input.value);
  if (!endpoint) {
    setStatus('Please enter a valid URL.');
    return;
  }

  const token = tokenInput ? String(tokenInput.value || '').trim() : '';
  if (!token) {
    setStatus('Please paste your pairing token.');
    return;
  }

  chrome.storage.sync.set({ livepayEndpoint: endpoint, livepayPairingToken: token }, () => {
    setStatus('Saved.');
  });
}

function reset() {
  const input = getInput();
  const tokenInput = getTokenInput();
  if (input) input.value = DEFAULT_ENDPOINT;
  if (tokenInput) tokenInput.value = '';
  chrome.storage.sync.set({ livepayEndpoint: DEFAULT_ENDPOINT, livepayPairingToken: '' }, () => {
    setStatus('Reset to default.');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save');
  const resetBtn = document.getElementById('reset');
  if (saveBtn) saveBtn.addEventListener('click', save);
  if (resetBtn) resetBtn.addEventListener('click', reset);
  load();
});
