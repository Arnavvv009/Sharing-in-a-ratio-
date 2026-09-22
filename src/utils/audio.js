import { audioMap } from './audioMap.js';

let isPlaying = false;
let currentAudio = null;

// Helpers to format math symbols for Web Speech API fallback
function formatSpeechText(text) {
  if (!text) return '';
  let s = String(text);
  // Currency
  s = s.replace(/\$(\d+)/g, '$1 dollars');
  // Ratios
  s = s.replace(/(\d+)\s*:\s*(\d+)\s*:\s*(\d+)/g, '$1 to $2 to $3');
  s = s.replace(/(\d+)\s*:\s*(\d+)/g, '$1 to $2');
  // Fractions
  s = s.replace(/\b1\/2\b/g, 'one half');
  s = s.replace(/\b1\/3\b/g, 'one third');
  s = s.replace(/\b2\/3\b/g, 'two thirds');
  s = s.replace(/\b1\/4\b/g, 'one fourth');
  s = s.replace(/\b3\/4\b/g, 'three fourths');
  s = s.replace(/\b1\/5\b/g, 'one fifth');
  s = s.replace(/\b2\/5\b/g, 'two fifths');
  s = s.replace(/\b3\/5\b/g, 'three fifths');
  s = s.replace(/\b4\/5\b/g, 'four fifths');
  // Operators
  s = s.replace(/÷/g, ' divided by ');
  s = s.replace(/×/g, ' times ');
  s = s.replace(/=/g, ' equals ');
  s = s.replace(/−/g, ' minus ');
  s = s.replace(/➔/g, ' to ');
  s = s.replace(/✓/g, ' matches ');
  // Emojis / special characters cleanup
  s = s.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  s = s.replace(/[\u{2600}-\u{26FF}]/gu, '');
  s = s.replace(/[\u{2700}-\u{27BF}]/gu, '');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function getAudioUrl(text) {
  if (!text) return null;
  if (audioMap[text]) {
    return audioMap[text];
  }
  const trimmed = text.trim();
  if (audioMap[trimmed]) {
    return audioMap[trimmed];
  }
  // Try normalized quotes
  const normalized = trimmed.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  if (audioMap[normalized]) {
    return audioMap[normalized];
  }
  return null;
}

async function playAudio(url) {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        isPlaying = false;
        resolve();
      };
      audio.onerror = (e) => {
        if (currentAudio === audio) currentAudio = null;
        isPlaying = false;
        reject(e);
      };
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (currentAudio === audio) currentAudio = null;
          isPlaying = false;
          reject(err);
        });
      }
    } catch (err) {
      isPlaying = false;
      reject(err);
    }
  });
}

function stopNarration() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
  isPlaying = false;
}

async function speakText(text, style = 'statement') {
  if (!text) return;
  stopNarration();

  const url = getAudioUrl(text);
  if (url) {
    isPlaying = true;
    try {
      await playAudio(url);
      return;
    } catch (e) {
      console.warn('Audio file playback failed, falling back to Web Speech:', e);
    }
  }

  // Fallback to browser SpeechSynthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const spoken = formatSpeechText(text);
      const utterance = new SpeechSynthesisUtterance(spoken);
      utterance.rate = 0.92;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Neural')));
      if (preferred) {
        utterance.voice = preferred;
      } else {
        const enVoice = voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis fallback error:', err);
    }
  }
}

async function narrate(segments) {
  if (!segments || segments.length === 0) return;
  stopNarration();
  isPlaying = true;
  for (let i = 0; i < segments.length; i++) {
    if (!isPlaying) break;
    const { text, style } = segments[i];
    await speakText(text, style);
  }
  isPlaying = false;
}

function unlockAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}
  }

  try {
    const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    silent.play().catch(() => {});
  } catch (e) {}
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
