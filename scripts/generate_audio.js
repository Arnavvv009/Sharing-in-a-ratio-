import { writeFile, mkdir } from 'fs/promises';
import { existsSync, statSync } from 'fs';
import dotenv from 'dotenv';
import slugify from 'slugify';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { questionBank } from '../src/data/questionBank.js';
import { SCENARIOS } from '../src/data/ratioData.js';
import {
  wonderNarration,
  getStoryNarration,
  simulateStationNarration,
  simulateFeedbackNarration,
  praisePhrases,
  playPhaseNarration,
  reflectQuestionNarration
} from '../src/utils/narration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: '.env.local' });

const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice (Clear, Engaging Educator)
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
 * Format mathematical symbols, currencies, units, and emojis into natural spoken English for ElevenLabs.
 */
function mathToSpoken(text) {
  if (!text) return '';
  let s = String(text);

  // Currency
  s = s.replace(/\$(\d+)/g, '$1 dollars');

  // Ratio notation: "4 : 5" -> "4 to 5", "1 : 2 : 3" -> "1 to 2 to 3"
  s = s.replace(/(\d+)\s*:\s*(\d+)\s*:\s*(\d+)/g, '$1 to $2 to $3');
  s = s.replace(/(\d+)\s*:\s*(\d+)/g, '$1 to $2');

  // Common fractions
  s = s.replace(/\b1\/2\b/g, 'one half');
  s = s.replace(/\b1\/3\b/g, 'one third');
  s = s.replace(/\b2\/3\b/g, 'two thirds');
  s = s.replace(/\b1\/4\b/g, 'one fourth');
  s = s.replace(/\b3\/4\b/g, 'three fourths');
  s = s.replace(/\b1\/5\b/g, 'one fifth');
  s = s.replace(/\b2\/5\b/g, 'two fifths');
  s = s.replace(/\b3\/5\b/g, 'three fifths');
  s = s.replace(/\b4\/5\b/g, 'four fifths');
  s = s.replace(/\b1\/6\b/g, 'one sixth');
  s = s.replace(/\b5\/6\b/g, 'five sixths');
  s = s.replace(/\b1\/8\b/g, 'one eighth');
  s = s.replace(/\b3\/8\b/g, 'three eighths');
  s = s.replace(/\b5\/8\b/g, 'five eighths');
  s = s.replace(/\b7\/8\b/g, 'seven eighths');

  // Math operators
  s = s.replace(/ ÷ /g, ' divided by ');
  s = s.replace(/÷/g, ' divided by ');
  s = s.replace(/ × /g, ' times ');
  s = s.replace(/×/g, ' times ');
  s = s.replace(/ = /g, ' equals ');
  s = s.replace(/=/g, ' equals ');
  s = s.replace(/ \+ /g, ' plus ');
  s = s.replace(/ − /g, ' minus ');
  s = s.replace(/ - /g, ' minus ');
  s = s.replace(/➔/g, ' to ');
  s = s.replace(/->/g, ' to ');
  s = s.replace(/✓/g, 'correct');

  // Units
  s = s.replace(/\b(\d+)\s*kg\b/g, '$1 kilograms');
  s = s.replace(/\b(\d+)\s*g\b/g, '$1 grams');
  s = s.replace(/\b(\d+)\s*L\b/g, '$1 litres');
  s = s.replace(/\b(\d+)\s*cm\b/g, '$1 centimetres');
  s = s.replace(/\b(\d+)\s*m\b/g, '$1 metres');

  // Quotation marks and special characters
  s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

  // Remove emojis and non-pronounceable glyphs
  s = s.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  s = s.replace(/[\u{2600}-\u{26FF}]/gu, '');
  s = s.replace(/[\u{2700}-\u{27BF}]/gu, '');

  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Builds the complete list of all pedagogical phrases across the application.
 */
function buildPhrases() {
  const phrases = [];
  const seen = new Set();
  const add = (text, style) => {
    if (!text) return;
    const t = text.trim();
    if (t.length < 2 || seen.has(t)) return;
    seen.add(t);
    phrases.push({ text: t, style });
  };

  // 1. UI & Intro
  add('Sound on!', 'encouragement');
  add('Sound off', 'statement');
  add("Ready to split sweets, money and paint fairly using ratios? Let's go!", 'encouragement');
  add("Ready to split sweets, money and paint fairly using ratios? Let's go! 🍬", 'encouragement');

  // 2. Wonder Phase
  wonderNarration().forEach(t => add(t, 'question'));
  add("Robo shares 45 sweets between Aisha and Ben in the ratio 4 : 5. Robo's friend says just cut the 45 in half, because sharing means everyone gets the same. Is that actually right?", 'question');
  add('Equal PARTS, not equal shares! 🍬', 'celebration');
  add('Hmm... I wonder... 🤔', 'thinking');

  // 3. Story Phase
  getStoryNarration().forEach(t => add(t, 'statement'));

  // 4. Simulate Station Intros & Feedback
  simulateStationNarration().forEach(t => add(t, 'instruction'));
  simulateFeedbackNarration().forEach(t => add(t, 'encouragement'));

  // Station A Presets
  const presets = [
    'Ratio 2 : 3 sharing 40. Total parts 5, one part is 8.',
    'Ratio 1 : 4 sharing 50. Total parts 5, one part is 10.',
    'Ratio 3 : 1 sharing 36. Total parts 4, one part is 9.',
    'Ratio 1 : 2 : 3 sharing 60. Total parts 6, one part is 10.',
    'Ratio 5 : 5 sharing 80. Total parts 10, one part is 8.'
  ];
  presets.forEach(p => add(p, 'statement'));

  // Station B Step Details
  const bDetails = [
    '4 + 5 = 9',
    '45 sweets ÷ 9 = 5 sweets',
    'Aisha: 4 × 5 = 20 sweets   |   Ben: 5 × 5 = 25 sweets',
    '20 + 25 = 45 sweets',
    '1 + 2 + 3 = 6',
    '60 ÷ 6 = 10',
    'Cara: 1 × 10 = 10   |   Dev: 2 × 10 = 20   |   Eli: 3 × 10 = 30',
    '10 + 20 + 30 = 60',
    '3 + 1 = 4',
    '800 g ÷ 4 = 200 g',
    'Flour: 3 × 200 = 600 g   |   Sugar: 1 × 200 = 200 g',
    '600 + 200 = 800 g'
  ];
  bDetails.forEach(d => add(d, 'statement'));

  // Station C Detective Puzzles
  const cPuzzles = [
    "Maya's 2 parts = $14, so 1 part = $7. Total parts = 5, so total = 5 × $7 = $35.",
    "Raj's 4 parts = 24, so 1 part = 6. Priya has 3 parts, so 3 × 6 = 18 sweets.",
    "Sam's 1 part = 9, so 1 part = 9. Total parts = 6, so total = 6 × 9 = 54 stickers.",
    "Vik's 5 parts = 35, so 1 part = 7. Uma has 2 parts = 14. Difference = 35 − 14 = 21.",
    "Wen's 4 parts = 32, so 1 part = 8. Xia has 3 parts, so 3 × 8 = 24.",
    "Maya and Noah share money in the ratio 2 : 3. Maya receives $14. What was the TOTAL amount?",
    "Priya and Raj share sweets in the ratio 3 : 4. Raj gets 24 sweets. How many does PRIYA get?",
    "Sam and Tara share stickers in the ratio 1 : 5. Sam has 9 stickers. What is the TOTAL?",
    "Uma and Vik share in the ratio 2 : 5. Vik gets 35. How many MORE does Vik get than Uma?",
    "Wen and Xia share in the ratio 4 : 3. Wen receives 32. What does XIA receive?"
  ];
  cPuzzles.forEach(p => add(p, p.includes('?') ? 'question' : 'thinking'));

  // Station D Scenarios & Feedback
  SCENARIOS.forEach(sc => add(sc.context, 'statement'));
  const dSplits = [
    'Perfect split! Aisha gets 20, Ben gets 25.',
    'Perfect split! Cara gets 20, Dev gets 40, Eli gets 60.',
    'Perfect split! Blue gets 12, Yellow gets 18.',
    'Perfect split! Flour gets 600, Sugar gets 200.',
    'Great job! Station D is complete! You can explore more scenarios or begin the Challenge Game!'
  ];
  dSplits.forEach(s => add(s, 'celebration'));

  // 5. Praises & Play Phase General
  praisePhrases().forEach(p => add(p, 'celebration'));
  playPhaseNarration().forEach(p => add(p, 'encouragement'));

  const worlds = [
    'Reading Ratios',
    'Finding One Part',
    'Two-Way Sharing',
    'Three-Way Sharing',
    'Simplifying Ratios',
    'Working Backwards',
    'Difference Problems',
    'Ratio & Fractions',
    'Real World Sharing',
    'Mystery Ratio Detective'
  ];
  worlds.forEach((w, idx) => {
    add(`Welcome to World ${idx + 1}: ${w}. Let's answer some questions!`, 'statement');
  });

  for (let stars = 1; stars <= 3; stars++) {
    for (let score = 5; score <= 10; score++) {
      add(`Fabulous! You completed the world with ${stars} stars and a score of ${score} out of 10.`, 'celebration');
    }
  }

  // 6. Question Bank (all questions and hints)
  questionBank.forEach(q => {
    add(q.questionText, 'question');
    add(q.hint1, 'thinking');
    add(q.hint2, 'thinking');
  });

  // 7. Reflect Phase Prompts & Explanations
  add("Amazing work! Let's reflect a little! 📋", 'celebration');
  const reflectPairs = [
    {
      prompt: 'What does a ratio like 4 : 5 actually tell you?',
      exp: 'It compares PARTS against each other, not against the whole. Every block is the same size — one person simply holds 4 of them and the other holds 5. And order matters: 4 : 5 is not the same as 5 : 4.'
    },
    {
      prompt: 'Walk me through the four steps for sharing an amount in a ratio.',
      exp: 'Step 1: ADD the ratio numbers to get the total parts. Step 2: DIVIDE the total amount by that to find one part. Step 3: MULTIPLY one part by each ratio number to get each share. Step 4: ADD the shares to check they match the original total.'
    },
    {
      prompt: 'Does simplifying a ratio change how the amount is shared?',
      exp: 'Not at all. 6 : 9 and 2 : 3 produce exactly the same shares — simplifying just gives you smaller, friendlier numbers to work with. Divide every ratio number by their highest common factor.'
    },
    {
      prompt: 'If you only know ONE person\'s share, how do you find the total?',
      exp: 'Work backwards. Divide that known share by ITS number of parts to find one part, then multiply by the total parts. If you are told the DIFFERENCE instead, divide it by the difference in parts first.'
    },
    {
      prompt: 'How do you turn a ratio into a fraction of the whole?',
      exp: 'Add the parts to get the denominator, and use that person\'s parts as the numerator. In 2 : 3 the total is 5 parts, so the first person gets 2/5 and the second gets 3/5 of the whole.'
    },
    {
      prompt: 'Where would you actually use sharing in a ratio in real life?',
      exp: 'Splitting prize money fairly, mixing paint or concrete to the right recipe, sharing sweets between friends, or dividing a lesson into theory and practical time — ratios keep every one of them fair and consistent.'
    }
  ];
  reflectPairs.forEach(rp => {
    add(rp.prompt, 'question');
    add(rp.exp, 'statement');
  });

  return phrases;
}

const phrases = buildPhrases();

const API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
const AUDIO_DIR = join(__dirname, '..', 'public', 'assets', 'audio');
const AUDIO_MAP_PATH = join(__dirname, '..', 'src', 'utils', 'audioMap.js');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      const errText = await response.text();
      console.warn(`Attempt ${attempt} failed (${response.status}): ${errText}`);
      if (response.status === 429) {
        // Rate limited - wait longer
        await sleep(2000 * attempt);
      } else if (attempt < maxRetries) {
        await sleep(1000 * attempt);
      } else {
        throw new Error(`API request failed with status ${response.status}: ${errText}`);
      }
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await sleep(1000 * attempt);
    }
  }
}

async function generateAudio() {
  if (!API_KEY) {
    console.error('Error: VITE_ELEVENLABS_API_KEY not found in .env.local');
    process.exit(1);
  }

  if (!existsSync(AUDIO_DIR)) {
    await mkdir(AUDIO_DIR, { recursive: true });
  }

  const audioMap = {};
  console.log(`Starting audio generation for ${phrases.length} phrases using Voice ID: ${VOICE_ID} (Alice)...`);

  for (let i = 0; i < phrases.length; i++) {
    const { text, style } = phrases[i];
    const settings = voiceSettings[style] || voiceSettings.statement;
    const spokenText = mathToSpoken(text);
    const slug = slugify(spokenText.toLowerCase(), { replacement: '_', lower: true, strict: true }).slice(0, 60);
    const filename = `${slug || 'audio'}_${i}.mp3`;
    const filePath = join(AUDIO_DIR, filename);

    audioMap[text] = `/assets/audio/${filename}`;

    // Check if valid audio already exists
    if (existsSync(filePath)) {
      const stat = statSync(filePath);
      if (stat.size > 1000) {
        console.log(`[${i + 1}/${phrases.length}] Cached: "${text.slice(0, 45)}..." -> ${filename}`);
        continue;
      }
    }

    try {
      console.log(`[${i + 1}/${phrases.length}] Generating: "${text.slice(0, 45)}..." (${style}) -> ${spokenText.slice(0, 45)}...`);

      const response = await fetchWithRetry(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': API_KEY
          },
          body: JSON.stringify({
            text: spokenText,
            model_id: MODEL_ID,
            voice_settings: settings
          })
        }
      );

      const buffer = await response.arrayBuffer();
      await writeFile(filePath, Buffer.from(buffer));
      console.log(`Saved (${buffer.byteLength} bytes) -> ${filename}`);

      // Rate limit delay between ElevenLabs calls
      await sleep(350);
    } catch (err) {
      console.error(`Error generating audio for "${text}":`, err.message);
    }
  }

  const audioMapContent = `// Auto-generated by scripts/generate_audio.js — DO NOT edit by hand.\nexport const audioMap = ${JSON.stringify(audioMap, null, 2)};\n`;
  await writeFile(AUDIO_MAP_PATH, audioMapContent);
  console.log('\nSUCCESS: audioMap.js updated successfully!');
  console.log(`Finished processing ${Object.keys(audioMap).length} audio entries.`);
}

generateAudio().catch(console.error);
