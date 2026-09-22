import { audioMap } from './audioMap.js';

let isPlaying = false;
let currentAudio = null;

// In-memory cache for dynamically fetched audio blobs (ElevenLabs fallback)
const dynamicAudioCache = new Map();

// Voice settings matching audio_generation_pipeline.md
const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
const MODEL_ID = 'eleven_multilingual_v2';

const voiceSettings = {
  celebration: { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true },
  encouragement: { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true },
  question: { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true },
  emphasis: { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true },
  thinking: { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true },
  statement: { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
  instruction: { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true }
};

/**
 * Format mathematical symbols and special characters for natural speech
 */
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

  // Quotation marks
  s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

  // Emojis / special characters cleanup
  s = s.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  s = s.replace(/[\u{2600}-\u{26FF}]/gu, '');
  s = s.replace(/[\u{2700}-\u{27BF}]/gu, '');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * 1ST PREFERENCE: Resolves local static .mp3 asset URL from audioMap.js
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
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .trim();
  if (audioMap[strippedEmojis]) {
    return audioMap[strippedEmojis];
  }

  return null;
}

/**
 * 2ND PREFERENCE: Fetch dynamic TTS from ElevenLabs API if not in local map
 */
async function fetchDynamicElevenLabsAudio(text, style = 'statement') {
  const apiKey = import.meta.env?.VITE_ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  const cacheKey = `${style}:${text}`;
  if (dynamicAudioCache.has(cacheKey)) {
    return dynamicAudioCache.get(cacheKey);
  }

  try {
    const spokenText = formatSpeechText(text);
    const settings = voiceSettings[style] || voiceSettings.statement;

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: spokenText,
        model_id: MODEL_ID,
        voice_settings: settings
      })
    });

    if (!response.ok) {
      console.warn(`ElevenLabs dynamic API returned ${response.status}`);
      return null;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    dynamicAudioCache.set(cacheKey, objectUrl);
    return objectUrl;
  } catch (err) {
    console.warn('ElevenLabs dynamic fetch error:', err);
    return null;
  }
}

/**
 * Audio playback helper for MP3 URLs or ObjectURLs
 */
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

/**
 * Stops any ongoing audio playback and speech synthesis
 */
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

/**
 * Primary Speak function adhering to priority hierarchy:
 * 1st preference: Local static .mp3 audio file (Zero API calls, instant playback)
 * 2nd preference: Dynamic ElevenLabs TTS API (if local file is missing and API key available)
 * 3rd preference: Browser SpeechSynthesis (Web Speech API)
 */
async function speakText(text, style = 'statement') {
  if (!text) return;
  stopNarration();

  // -------------------------------------------------------------
  // 1ST PREFERENCE: Local pre-generated MP3 file
  // -------------------------------------------------------------
  const localUrl = getAudioUrl(text);
  if (localUrl) {
    isPlaying = true;
    try {
      await playAudio(localUrl);
      return;
    } catch (e) {
      console.warn('Local audio file playback failed, trying secondary preference:', e);
    }
  }

  // -------------------------------------------------------------
  // 2ND PREFERENCE: Dynamic ElevenLabs API
  // -------------------------------------------------------------
  try {
    const dynamicUrl = await fetchDynamicElevenLabsAudio(text, style);
    if (dynamicUrl) {
      isPlaying = true;
      await playAudio(dynamicUrl);
      return;
    }
  } catch (err) {
    console.warn('ElevenLabs dynamic fallback failed, using browser speech:', err);
  }

  // -------------------------------------------------------------
  // 3RD PREFERENCE: Browser SpeechSynthesis (Web Speech API)
  // -------------------------------------------------------------
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
      const preferred = voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Jenny') ||
        v.name.includes('Neural')
      ));

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

/**
 * Sequential narration helper for multi-sentence segments
 */
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

/**
 * Audio unlocking helper for mobile and browser autoplay policies
 */
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
