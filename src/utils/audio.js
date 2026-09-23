import { audioMap } from './audioMap.js';

export const AUDIO_MODULE_ACTIVE = true;

let isPlaying = false;
let currentAudio = null;
let isAudioUnlocked = false;
let pendingPlayUrl = null;

/**
 * Normalizes text to match keys in audioMap.js
 */
function getAudioUrl(text) {
  if (!text) return null;

  // 1. Direct exact match
  if (audioMap[text]) {
    return audioMap[text];
  }

  // 2. Trimmed match
  const trimmed = text.trim();
  if (audioMap[trimmed]) {
    return audioMap[trimmed];
  }

  // 3. Normalized quotes match
  const normalizedQuotes = trimmed.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  if (audioMap[normalizedQuotes]) {
    return audioMap[normalizedQuotes];
  }

  // 4. Stripped emojis match
  const strippedEmojis = trimmed
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();
  if (audioMap[strippedEmojis]) {
    return audioMap[strippedEmojis];
  }

  // 5. Normalized whitespace match
  const normalizedSpaces = trimmed.replace(/\s+/g, ' ');
  if (audioMap[normalizedSpaces]) {
    return audioMap[normalizedSpaces];
  }

  return null;
}

/**
 * Unlocks browser audio playback on the first user interaction
 */
function unlockAudio() {
  if (isAudioUnlocked) return;
  isAudioUnlocked = true;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    }
  } catch (e) {}

  try {
    const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    silent.play().catch(() => {});
  } catch (e) {}

  // If there was an audio waiting for the first click, play it now
  if (pendingPlayUrl) {
    const url = pendingPlayUrl;
    pendingPlayUrl = null;
    playAudio(url).catch(() => {});
  }
}

// Automatically install unlock listeners on window
if (typeof window !== 'undefined') {
  const autoUnlock = () => {
    unlockAudio();
    window.removeEventListener('click', autoUnlock);
    window.removeEventListener('pointerdown', autoUnlock);
    window.removeEventListener('touchstart', autoUnlock);
    window.removeEventListener('keydown', autoUnlock);
  };

  window.addEventListener('click', autoUnlock, { passive: true, once: true });
  window.addEventListener('pointerdown', autoUnlock, { passive: true, once: true });
  window.addEventListener('touchstart', autoUnlock, { passive: true, once: true });
  window.addEventListener('keydown', autoUnlock, { passive: true, once: true });
}

/**
 * Plays a local .mp3 audio file
 */
async function playAudio(url) {
  if (!AUDIO_MODULE_ACTIVE || !url) return Promise.resolve();

  return new Promise((resolve) => {
    try {
      stopNarration();

      const audio = new Audio(url);
      currentAudio = audio;
      isPlaying = true;

      audio.onended = () => {
        if (currentAudio === audio) {
          currentAudio = null;
          isPlaying = false;
        }
        resolve();
      };

      audio.onerror = (e) => {
        if (currentAudio === audio) {
          currentAudio = null;
          isPlaying = false;
        }
        resolve();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isAudioUnlocked = true;
          })
          .catch((err) => {
            // Autoplay policy prevented playback before interaction
            if (err.name === 'NotAllowedError') {
              pendingPlayUrl = url;
            }
            if (currentAudio === audio) {
              currentAudio = null;
              isPlaying = false;
            }
            resolve();
          });
      }
    } catch (err) {
      isPlaying = false;
      resolve();
    }
  });
}

/**
 * Stops any active audio playback
 */
function stopNarration() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  isPlaying = false;
}

/**
 * Primary Speak function: plays the exact pre-generated local .mp3 file
 */
async function speakText(text) {
  if (!AUDIO_MODULE_ACTIVE || !text) return;

  const localUrl = getAudioUrl(text);
  if (localUrl) {
    await playAudio(localUrl);
  }
}

/**
 * Sequential narration helper for multi-sentence segments
 */
async function narrate(segments) {
  if (!AUDIO_MODULE_ACTIVE || !segments || segments.length === 0) return;
  stopNarration();
  isPlaying = true;
  for (let i = 0; i < segments.length; i++) {
    if (!isPlaying) break;
    const item = segments[i];
    const text = typeof item === 'string' ? item : item?.text;
    if (text) {
      await speakText(text);
    }
  }
  isPlaying = false;
}

const segmentHelpers = {
  say: (text) => ({ text, style: 'statement' }),
  ask: (text) => ({ text, style: 'question' }),
  cheer: (text) => ({ text, style: 'encouragement' }),
  emphasize: (text) => ({ text, style: 'emphasis' }),
  think: (text) => ({ text, style: 'thinking' }),
  celebrate: (text) => ({ text, style: 'celebration' }),
  instruct: (text) => ({ text, style: 'instruction' })
};

const { say, ask, cheer, emphasize, think, celebrate, instruct } = segmentHelpers;

export {
  say,
  ask,
  cheer,
  emphasize,
  think,
  celebrate,
  instruct,
  narrate,
  stopNarration,
  getAudioUrl,
  speakText,
  unlockAudio
};
