// Canonical registry of every static narrated string used across the Sharing
// in a Ratio module. Components call the shared `speak(text)` function directly
// with these exact strings (see WonderPhase.jsx, StoryPhase.jsx,
// SimulatePhase.jsx and PlayPhase.jsx), so this file is the single source of
// truth that scripts/generate_audio.js reads from to pre-generate matching
// static MP3s. Content Policy: Paragraphs & Questions ONLY.

export function introNarration() { return []; }

export function wonderNarration() {
  return [
    "Robo has 45 sweets to share between Aisha and Ben in the ratio 4 to 5. Robo's friend says you should just cut the 45 in half, because sharing means everyone gets the same. Is that actually right?",
    "Not right at all! Sharing in a ratio means splitting into EQUAL PARTS, not equal shares. 4 plus 5 makes 9 equal parts, each worth 5 sweets — so Aisha gets 20 and Ben gets 25. Let's learn every step in the story!",
    "Notice it! Sharing in a ratio means equal PARTS, not equal shares — the person with more parts gets more sweets."
  ];
}

export function getStoryNarration() {
  return [
    "Robo writes the ratio 4 : 5 and reads it aloud as “four parts to five parts”. A ratio compares PARTS against each other, not against the whole. Every single block is the same size — Aisha simply holds 4 of them and Ben holds 5.",
    "Step 1: ADD the ratio numbers — 4 + 5 = 9, so the jar splits into 9 equal parts. Step 2: divide the total by that number — 45 ÷ 9 = 5. Now Robo knows the magic number: every single part is worth 5 sweets.",
    "Step 3: multiply each ratio number by the value of one part. Aisha has 4 parts, so 4 × 5 = 20 sweets. Ben has 5 parts, so 5 × 5 = 25 sweets. The person with more parts gets more sweets — that is what sharing in a ratio means.",
    "Step 4: add every share together. 20 + 25 = 45, which matches the original total exactly. If your shares ever fail to add back to the starting amount, something went wrong — so this final check catches almost every mistake."
  ];
}

export function simulateStationNarration() {
  return [
    "Welcome to the Ratio Bar Lab! Change the ratio and the total, and watch the bar model rebuild itself block by block. Try every preset!",
    "Station B — Step Builder! Solve one whole problem by unlocking each of the four steps in order. No skipping ahead!",
    "Station C — Reverse Detective! This time you know just ONE share. Work backwards to find the total or the other share.",
    "Station D — Real-World Ratio Lab! Pick a real scenario, then set each person's share correctly to finish the split."
  ];
}

export function simulateFeedbackNarration() {
  return [
    "Not quite — look carefully at the bar model above and try that step again.",
    "Next step! Keep going.",
    "New problem! Start again from step one.",
    "Superb! You've built every solution step by step. Station B is complete!",
    "Not quite — first divide the known share by its number of parts to find ONE part.",
    "Next case! Work backwards from the known share.",
    "Brilliant detective work! Station C is complete!",
    "Outstanding! You've shared every real-world amount correctly. Station D is complete! You can now begin the challenge game!",
    "Station A reset! Change the ratio or tap a preset.",
    "Station B reset! Let's build a solution from step one.",
    "Station C reset! Find the missing totals.",
    "Station D reset! Pick a real-world scenario to share out."
  ];
}

export function praisePhrases() {
  return ["Excellent!", "Well done!", "Brilliant!", "You got it!", "Super smart!"];
}

export function playPhaseNarration() {
  return [
    "That's correct!",
    "Not quite!",
    "Not quite! Oh no, you have run out of hearts. Let's retry this world."
  ];
}

export function reflectQuestionNarration() {
  return [
    "What does a ratio like 4 : 5 actually tell you?",
    "Walk me through the four steps for sharing an amount in a ratio.",
    "Does simplifying a ratio change how the amount is shared?",
    "If you only know ONE person's share, how do you find the total?",
    "How do you turn a ratio into a fraction of the whole?",
    "Where would you actually use sharing in a ratio in real life?"
  ];
}
