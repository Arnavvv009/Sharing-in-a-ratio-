# Intellia Sharing in a Ratio — Grade 7

**Topic:** Ratio — **Title:** Sharing in a Ratio

Built to match **Intellia Comparing & Ordering Numbers** exactly (itself built
on the `Intellia-Types-of-angle-master` template). UI, structure, layout,
architecture and proportions are identical — only the subject content, the
Wonder interaction and the Simulate activities are new.

> Note: your message again mentioned "the title is related to shapes". That
> looks like leftover boilerplate, so this was built for **Sharing in a Ratio**
> as stated. Say the word if you meant otherwise.

## Copied byte-for-byte
`src/App.css` · `src/App.jsx` (only storage key + 3 badge ids changed) ·
`index.html` · `package.json` · `vite.config.js` · `.gitignore` ·
`scripts/generate_audio.js` + `clean_audio.js` (one import path repointed) ·
`useAudio.js` · `audio.js` · `Mascot.jsx`

## New: step-by-step solver at the core
`ratioData.js` exports **`solveSteps(amount, parts, names, unit)`**, which
returns the four explicit steps — *add the parts → find one part → multiply out
each share → check it adds back up* — as structured data. The UI reveals these
one at a time, so every worked answer in the module shows every step rather
than jumping to a result.

## New Wonder interaction (different pattern)
Previous modules used a **single slider**. This one uses **dual +/− steppers**:
you control *both* ratio numbers independently on a **Sweet Jar Splitter**,
watching 45 sweets re-divide live. It warns when a total doesn't divide evenly
("not a whole sweet!"), and an Auto-Split animates 1 : 1 → 4 : 5.

## Simulate — four all-new heavier stations
Same A→D pedagogy (understand → try it → puzzle → real-world), new activities:

| | Station | What you do |
|---|---|---|
| **A** | **Ratio Bar Lab** | Live **bar model** rebuilds block-by-block as you stepper the ratio (and add a 3rd person) or slide the total. Four live readout cards show all 4 steps at once; warns on non-exact division and offers to simplify. 5 presets. |
| **B** | **Step Builder** | Solve one problem by **unlocking each of the 4 steps in order** — each step is its own question with its own options, so nothing can be skipped. A progress rail ticks green per step; the bar model reveals values as you go. 3 problems. |
| **C** | **Reverse Detective** | You know only **ONE share**. Work backwards to find the total, the other share, or the difference. The bar model dims every share except the known one until you solve it. 5 cases. |
| **D** | **Real-World Ratio Lab** | Pick a scenario (sweets, prize money, paint, recipe) then **dial each person's share up/down** until the split is exactly right. Live feedback for "too much" and "right total, wrong split". 4 scenarios. |

## "Begin Challenge Game" button
Station D completes via per-scenario exact-match checks on directly dialled
values — no cyclical toggle that can land back on "unanswered". Finish all four
scenarios and the gate opens reliably.

## Verified before packaging
Syntax check on all 18 JS/JSX files · full esbuild bundle resolve · **all 61
questions validated** (answer present in options, exactly 4 unique options,
hints + explanation on every one) · **ratio math self-tested** — every scenario
divides to whole numbers and its shares sum exactly back to the total ·
`simplifyRatio` verified (6:9→2:3, 12:18:24→2:3:4) · all 4 SVGs parse · every
badge id has a matching icon + label · every `speak()` string registered in
`narration.js`.

## Image generation
No image-generation tool is available here, so the 4 story illustrations are
hand-built cartoon-style SVGs at **20:8** — one per solving step. Swap in PNGs
and update the four `<img src>` paths in `StoryPhase.jsx` for that upgrade.

## Audio (ElevenLabs)
Key is in `.env.local` (gitignored). This sandbox can't reach elevenlabs.io so
`audioMap.js` ships empty — run locally:

```bash
npm install
node scripts/generate_audio.js   # auto-pulls narration.js + SCENARIOS + questionBank
node scripts/clean_audio.js      # optional
npm run dev
```
