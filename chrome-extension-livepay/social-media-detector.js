function isAnyMediaPlaying() {
  const media = document.querySelectorAll('video, audio');
  for (const el of media) {
    try {
      if (!el.paused && !el.ended && el.readyState >= 2) return true;
    } catch {
      // ignore
    }
  }
  return false;
}

let lastStatus = null;

function reportIfChanged() {
  const playing = isAnyMediaPlaying();
  if (playing === lastStatus) return;
  lastStatus = playing;
  try {
    chrome.runtime.sendMessage({ type: 'livepay_media_status', mediaPlaying: playing });
  } catch {
    // ignore
  }
}

document.addEventListener(
  'play',
  () => {
    reportIfChanged();
  },
  true,
);

document.addEventListener(
  'pause',
  () => {
    reportIfChanged();
  },
  true,
);

document.addEventListener(
  'ended',
  () => {
    reportIfChanged();
  },
  true,
);

setInterval(reportIfChanged, 1000);
reportIfChanged();
