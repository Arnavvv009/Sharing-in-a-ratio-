import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Mascot from '../shared/Mascot';
import RatioBarViewer from '../shared/RatioBarViewer';
import {
  RATIO_CONCEPTS, SCENARIOS, getScenario,
  totalParts, onePartValue, shares, solveSteps, fmt, ratioLabel, simplifyRatio
} from '../../data/ratioData';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

// Station A — Ratio Bar Lab: presets that walk through every core idea.
const LAB_PRESETS = [
  { id: 'p1', label: '🍬 2 : 3', parts: [2, 3], amount: 40 },
  { id: 'p2', label: '💰 1 : 4', parts: [1, 4], amount: 50 },
  { id: 'p3', label: '🎨 3 : 1', parts: [3, 1], amount: 36 },
  { id: 'p4', label: '👥 1 : 2 : 3', parts: [1, 2, 3], amount: 60 },
  { id: 'p5', label: '⚖️ 5 : 5', parts: [5, 5], amount: 80 },
];

// Station B — Step Builder: solve one problem by unlocking each of the 4 steps
// in order. Every step asks its own question, so no step can be skipped.
const BUILDER_ROUNDS = [
  {
    id: 'sb1', amount: 45, parts: [4, 5], names: ['Aisha', 'Ben'], unit: ' sweets',
    prompt: 'Aisha and Ben share 45 sweets in the ratio 4 : 5.',
    q1: { text: 'Step 1 — How many EQUAL PARTS in total?', options: [9, 20, 45, 5], answer: 9 },
    q2: { text: 'Step 2 — What is ONE part worth?', options: [5, 9, 4, 11], answer: 5 },
    q3: { text: "Step 3 — What is Aisha's share (4 parts)?", options: [20, 25, 16, 9], answer: 20 },
    q4: { text: "Step 4 — Do the shares add back to 45?", options: ['Yes, 20 + 25 = 45', 'No, they make 40', 'No, they make 50', 'Cannot tell'], answer: 'Yes, 20 + 25 = 45' },
  },
  {
    id: 'sb2', amount: 60, parts: [1, 2, 3], names: ['Cara', 'Dev', 'Eli'], unit: '',
    prompt: 'Cara, Dev and Eli share $60 in the ratio 1 : 2 : 3.',
    q1: { text: 'Step 1 — How many EQUAL PARTS in total?', options: [6, 60, 3, 10], answer: 6 },
    q2: { text: 'Step 2 — What is ONE part worth?', options: [10, 6, 20, 15], answer: 10 },
    q3: { text: "Step 3 — What is Eli's share (3 parts)?", options: [30, 20, 10, 36], answer: 30 },
    q4: { text: 'Step 4 — Do the shares add back to $60?', options: ['Yes, 10 + 20 + 30 = 60', 'No, they make 50', 'No, they make 70', 'Cannot tell'], answer: 'Yes, 10 + 20 + 30 = 60' },
  },
  {
    id: 'sb3', amount: 800, parts: [3, 1], names: ['Flour', 'Sugar'], unit: ' g',
    prompt: 'A cake uses 800 g of dry mix with flour : sugar = 3 : 1.',
    q1: { text: 'Step 1 — How many EQUAL PARTS in total?', options: [4, 3, 800, 200], answer: 4 },
    q2: { text: 'Step 2 — What is ONE part worth?', options: [200, 400, 100, 266], answer: 200 },
    q3: { text: 'Step 3 — How much FLOUR (3 parts)?', options: [600, 200, 400, 300], answer: 600 },
    q4: { text: 'Step 4 — Do the shares add back to 800 g?', options: ['Yes, 600 + 200 = 800', 'No, they make 700', 'No, they make 900', 'Cannot tell'], answer: 'Yes, 600 + 200 = 800' },
  },
];

// Station C — Reverse Detective: work BACKWARDS from one known share.
const REVERSE_PUZZLES = [
  { id: 'rp1', parts: [2, 3], names: ['Maya', 'Noah'], knownIdx: 0, knownVal: 14, unit: '',
    ask: 'total', question: "Maya and Noah share money in the ratio 2 : 3. Maya receives $14. What was the TOTAL amount?",
    options: [35, 28, 42, 21], answer: 35,
    working: "Maya's 2 parts = $14, so 1 part = $7. Total parts = 5, so total = 5 × $7 = $35." },
  { id: 'rp2', parts: [3, 4], names: ['Priya', 'Raj'], knownIdx: 1, knownVal: 24, unit: '',
    ask: 'other', question: "Priya and Raj share sweets in the ratio 3 : 4. Raj gets 24 sweets. How many does PRIYA get?",
    options: [18, 24, 32, 12], answer: 18,
    working: "Raj's 4 parts = 24, so 1 part = 6. Priya has 3 parts, so 3 × 6 = 18 sweets." },
  { id: 'rp3', parts: [1, 5], names: ['Sam', 'Tara'], knownIdx: 0, knownVal: 9, unit: '',
    ask: 'total', question: "Sam and Tara share stickers in the ratio 1 : 5. Sam has 9 stickers. What is the TOTAL?",
    options: [54, 45, 50, 14], answer: 54,
    working: "Sam's 1 part = 9, so 1 part = 9. Total parts = 6, so total = 6 × 9 = 54 stickers." },
  { id: 'rp4', parts: [2, 5], names: ['Uma', 'Vik'], knownIdx: 1, knownVal: 35, unit: '',
    ask: 'difference', question: "Uma and Vik share in the ratio 2 : 5. Vik gets 35. How many MORE does Vik get than Uma?",
    options: [21, 14, 35, 7], answer: 21,
    working: "Vik's 5 parts = 35, so 1 part = 7. Uma has 2 parts = 14. Difference = 35 − 14 = 21." },
  { id: 'rp5', parts: [4, 3], names: ['Wen', 'Xia'], knownIdx: 0, knownVal: 32, unit: '',
    ask: 'other', question: "Wen and Xia share in the ratio 4 : 3. Wen receives 32. What does XIA receive?",
    options: [24, 32, 28, 21], answer: 24,
    working: "Wen's 4 parts = 32, so 1 part = 8. Xia has 3 parts, so 3 × 8 = 24." },
];

const SANDBOX_IDS = SCENARIOS.map(s => s.id);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SimulatePhase({ onNext, playSound, speak }) {
  const [station, setStation] = useState(0);
  const [completedStations, setCompletedStations] = useState([false, false, false, false]);

  const markDone = useCallback((idx) => {
    setCompletedStations(prev => { const next = [...prev]; next[idx] = true; return next; });
  }, []);

  useEffect(() => {
    const msgs = [
      "Welcome to the Ratio Bar Lab! Change the ratio and the total, and watch the bar model rebuild itself block by block. Try every preset!",
      "Station B — Step Builder! Solve one whole problem by unlocking each of the four steps in order. No skipping ahead!",
      "Station C — Reverse Detective! This time you know just ONE share. Work backwards to find the total or the other share.",
      "Station D — Real-World Ratio Lab! Pick a real scenario, then set each person's share correctly to finish the split."
    ];
    speak(msgs[station]);
  }, [station, speak]);

  // ──────────────────────────────────────────────────────────────────────────
  // STATION A — Ratio Bar Lab (live bar model + step readout)
  // ──────────────────────────────────────────────────────────────────────────
  const [labParts, setLabParts] = useState([2, 3]);
  const [labAmount, setLabAmount] = useState(40);
  const [labPresetsSeen, setLabPresetsSeen] = useState(new Set());

  const labTp = totalParts(labParts);
  const labUnit = onePartValue(labAmount, labParts);
  const labShares = shares(labAmount, labParts);
  const labExact = Number.isInteger(labUnit);
  const labSimplified = simplifyRatio(labParts);
  const labIsSimplified = labSimplified.join(':') === labParts.join(':');

  const setPartAt = (i, delta) => {
    setLabParts(prev => {
      const next = [...prev];
      next[i] = Math.max(1, Math.min(9, next[i] + delta));
      return next;
    });
    playSound('explore');
  };

  const handleLabPreset = (preset) => {
    setLabParts(preset.parts);
    setLabAmount(preset.amount);
    playSound('explore');
    speak(`Ratio ${ratioLabel(preset.parts)} sharing ${preset.amount}. Total parts ${totalParts(preset.parts)}, one part is ${fmt(onePartValue(preset.amount, preset.parts))}.`);
    setLabPresetsSeen(prev => {
      const next = new Set(prev);
      next.add(preset.id);
      if (next.size >= 1) markDone(0);
      return next;
    });
  };

  const handleResetA = () => {
    setLabParts([2, 3]); setLabAmount(40); setLabPresetsSeen(new Set());
    setCompletedStations(prev => { const n = [...prev]; n[0] = false; return n; });
    speak("Station A reset! Change the ratio or tap a preset.");
  };

  // ──────────────────────────────────────────────────────────────────────────
  // STATION B — Step Builder (four gated sub-steps)
  // ──────────────────────────────────────────────────────────────────────────
  const [buildIdx, setBuildIdx] = useState(0);
  const [stepNum, setStepNum] = useState(1);          // which step is active (1-4)
  const [stepGuess, setStepGuess] = useState(null);
  const [stepFb, setStepFb] = useState(null);
  const [buildSolvedCount, setBuildSolvedCount] = useState(0);

  const bRound = BUILDER_ROUNDS[buildIdx];
  const bStep = bRound[`q${stepNum}`];
  const bSteps = useMemo(() => solveSteps(bRound.amount, bRound.parts, bRound.names, bRound.unit), [buildIdx]);
  const shuffledStepOptions = useMemo(() => shuffle(bStep.options), [buildIdx, stepNum]);

  const handleStepGuess = (opt) => {
    if (stepFb === 'correct') return;
    const correct = opt === bStep.answer;
    setStepGuess(opt);
    setStepFb(correct ? 'correct' : 'wrong');
    if (correct) {
      playSound('correct');
      speak(bSteps[stepNum - 1].detail);
      if (stepNum === 4) {
        const newCount = buildSolvedCount + 1;
        setBuildSolvedCount(newCount);
        markDone(1);
        if (newCount >= BUILDER_ROUNDS.length) {
          setTimeout(() => speak("Superb! You've built every solution step by step. Station B is complete!"), 1200);
        }
      }
    } else {
      playSound('wrong');
      speak("Not quite — look carefully at the bar model above and try that step again.");
    }
  };

  const handleStepNext = () => {
    if (stepNum < 4) {
      setStepNum(n => n + 1); setStepGuess(null); setStepFb(null);
      speak("Next step! Keep going.");
    } else if (buildIdx < BUILDER_ROUNDS.length - 1) {
      setBuildIdx(i => i + 1); setStepNum(1); setStepGuess(null); setStepFb(null);
      speak("New problem! Start again from step one.");
    }
  };

  const handleResetB = () => {
    setBuildIdx(0); setStepNum(1); setStepGuess(null); setStepFb(null); setBuildSolvedCount(0);
    setCompletedStations(prev => { const n = [...prev]; n[1] = false; return n; });
    speak("Station B reset! Let's build a solution from step one.");
  };

  // ──────────────────────────────────────────────────────────────────────────
  // STATION C — Reverse Detective
  // ──────────────────────────────────────────────────────────────────────────
  const [revIdx, setRevIdx] = useState(0);
  const [revGuess, setRevGuess] = useState(null);
  const [revFb, setRevFb] = useState(null);
  const [revSolvedCount, setRevSolvedCount] = useState(0);

  const rPuz = REVERSE_PUZZLES[revIdx];
  const shuffledRevOptions = useMemo(() => shuffle(rPuz.options), [revIdx]);
  const rUnit = rPuz.knownVal / rPuz.parts[rPuz.knownIdx];

  const handleRevGuess = (opt) => {
    if (revFb === 'correct') return;
    const correct = opt === rPuz.answer;
    setRevGuess(opt);
    setRevFb(correct ? 'correct' : 'wrong');
    if (correct) {
      playSound('correct');
      speak(rPuz.working);
      const newCount = revSolvedCount + 1;
      setRevSolvedCount(newCount);
      markDone(2);
      if (newCount >= REVERSE_PUZZLES.length) {
        setTimeout(() => speak("Brilliant detective work! Station C is complete!"), 1200);
      }
    } else {
      playSound('wrong');
      speak("Not quite — first divide the known share by its number of parts to find ONE part.");
    }
  };

  const handleRevNext = () => {
    if (revIdx < REVERSE_PUZZLES.length - 1) {
      setRevIdx(i => i + 1); setRevGuess(null); setRevFb(null);
      speak("Next case! Work backwards from the known share.");
    }
  };

  const handleResetC = () => {
    setRevIdx(0); setRevGuess(null); setRevFb(null); setRevSolvedCount(0);
    setCompletedStations(prev => { const n = [...prev]; n[2] = false; return n; });
    speak("Station C reset! Find the missing totals.");
  };

  // ──────────────────────────────────────────────────────────────────────────
  // STATION D — Real-World Ratio Lab (set every share with steppers)
  // ──────────────────────────────────────────────────────────────────────────
  const [sandboxId, setSandboxId] = useState(SANDBOX_IDS[0]);
  const sc = getScenario(sandboxId);
  const [dialled, setDialled] = useState({});
  const [sandboxDoneIds, setSandboxDoneIds] = useState(new Set());
  const [sandboxSolvedCount, setSandboxSolvedCount] = useState(0);

  const correctShares = shares(sc.amount, sc.parts);
  const stepSize = Math.max(1, Math.round(onePartValue(sc.amount, sc.parts) / 2));
  const current = dialled[sandboxId] || sc.parts.map(() => 0);
  const dialledTotal = current.reduce((a, b) => a + b, 0);
  const allMatch = current.every((v, i) => v === correctShares[i]);

  const adjustShare = (i, delta) => {
    if (sandboxDoneIds.has(sandboxId)) return;
    setDialled(prev => {
      const base = prev[sandboxId] || sc.parts.map(() => 0);
      const next = [...base];
      next[i] = Math.max(0, next[i] + delta * stepSize);
      const updated = { ...prev, [sandboxId]: next };

      if (next.every((v, k) => v === correctShares[k]) && !sandboxDoneIds.has(sandboxId)) {
        playSound('correct');
        const newDone = new Set(sandboxDoneIds); newDone.add(sandboxId);
        setSandboxDoneIds(newDone);
        const newCount = sandboxSolvedCount + 1;
        setSandboxSolvedCount(newCount);
        speak(`Perfect split! ${sc.names.map((n, k) => `${n} gets ${fmt(correctShares[k])}`).join(', ')}.`);
        markDone(3);
        if (newCount >= SANDBOX_IDS.length) {
          setTimeout(() => speak("Outstanding! You've shared every real-world amount correctly. Station D is complete! You can now begin the challenge game!"), 1200);
        } else {
          setTimeout(() => speak("Great job! Station D is complete! You can explore more scenarios or begin the Challenge Game!"), 1200);
        }
      } else {
        playSound('explore');
      }
      return updated;
    });
  };

  const switchSandbox = (id) => {
    setSandboxId(id); playSound('explore'); speak(getScenario(id).context);
  };

  const handleResetD = () => {
    setSandboxId(SANDBOX_IDS[0]); setDialled({}); setSandboxDoneIds(new Set()); setSandboxSolvedCount(0);
    setCompletedStations(prev => { const n = [...prev]; n[3] = false; return n; });
    speak("Station D reset! Pick a real-world scenario to share out.");
  };

  // -------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1', height: '100%', minHeight: 0, justifyContent: 'space-between', overflow: 'hidden' }}>
      <div className="simulate-header" style={{ flexShrink: 0, marginBottom: '2px', textAlign: 'center' }}>
        <h2 className="simulate-heading" style={{ fontSize: '30px', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '1px' }}>✏️ Simulate</h2>
        <p className="simulate-sub" style={{ fontSize: '19px', fontWeight: '900', color: '#ffffff', margin: 0 }}>Explore and discover — no wrong answers!</p>
      </div>

      <div className="simulate-tabs" style={{ flexShrink: 0, marginBottom: '4px', padding: '4px 8px' }}>
        {[
          { id: 0, label: "Ratio Bar Lab", badge: "A", color: "#a78bfa" },
          { id: 1, label: "Step Builder", badge: "B", color: "#34d399" },
          { id: 2, label: "Reverse Detective", badge: "C", color: "#ffbe1a" },
          { id: 3, label: "Real-World Ratio Lab", badge: "D", color: "#ff8a50" }
        ].map((tab) => (
          <div key={tab.id} className={`sim-tab ${station === tab.id ? 'sim-tab--active' : ''}`} onClick={() => setStation(tab.id)} style={{ padding: '6px 12px' }}>
            <div className="sim-tab-badge" style={{ backgroundColor: tab.color }}>{tab.badge}</div>
            <span style={{ fontSize: '15px', fontWeight: '900' }}>{tab.label}</span>
            {completedStations[tab.id] && <span style={{ color: 'var(--accent-success-green)', fontSize: '16px', fontWeight: '900' }}>✓</span>}
          </div>
        ))}
      </div>

      <div className="sim-scroll-area">

        {/* ================= STATION A: RATIO BAR LAB ================= */}
        {station === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
              <h3 className="sim-station-title" style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔬</span> Ratio Bar Lab
              </h3>
            </div>
            <p className="sim-station-instruction" style={{ fontSize: '18px', fontWeight: '900', color: '#ded5fb', margin: 0, lineHeight: '1.25', textAlign: 'center' }}>
              Change the ratio and the total — the bar model rebuilds block by block, live!
            </p>

            <RatioBarViewer parts={labParts} amount={labAmount} unit="" width={640} showOnePart />

            {/* Live 4-step readout (Extra Large & Ultra Bold in compact grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(138px, 1fr))', gap: '6px', width: '100%' }}>
              {[
                { k: 'Total parts', v: `${labParts.join(' + ')} = ${labTp}`, c: '#a78bfa' },
                { k: 'One part', v: `${fmt(labAmount)} ÷ ${labTp} = ${labExact ? fmt(labUnit) : labUnit.toFixed(2)}`, c: '#ff8a50' },
                { k: 'Shares', v: labShares.map(s => (labExact ? fmt(s) : s.toFixed(1))).join(' : '), c: '#4a90d9' },
                { k: 'Check', v: `${labShares.map(s => (labExact ? fmt(s) : s.toFixed(1))).join(' + ')} = ${fmt(labAmount)}`, c: '#34d399' },
              ].map(box => (
                <div key={box.k} style={{
                  padding: '5px 8px', borderRadius: '10px', background: `${box.c}22`, border: `2px solid ${box.c}`,
                  color: box.c, fontWeight: 900, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', opacity: 0.95, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{box.k}</div>
                  <div style={{ fontFamily: "'Fredoka', 'Inter', monospace", fontSize: '19px', fontWeight: '900', marginTop: '1px', color: '#ffffff' }}>{box.v}</div>
                </div>
              ))}
            </div>

            {/* Fixed-height Status & Hint Bar (Zero Layout Shift on Slider Drag) */}
            <div style={{
              minHeight: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '15.5px',
              fontWeight: '900',
              textAlign: 'center',
              transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
              background: !labExact 
                ? 'rgba(239, 68, 68, 0.14)' 
                : !labIsSimplified 
                  ? 'rgba(255, 190, 26, 0.14)' 
                  : 'rgba(52, 211, 153, 0.12)',
              border: !labExact 
                ? '1.5px solid var(--accent-alert-coral)' 
                : !labIsSimplified 
                  ? '1.5px solid rgba(255, 190, 26, 0.45)' 
                  : '1.5px solid rgba(52, 211, 153, 0.35)',
              color: !labExact 
                ? 'var(--accent-alert-coral)' 
                : !labIsSimplified 
                  ? 'var(--accent-gold)' 
                  : 'var(--accent-success-green)',
            }}>
              {!labExact ? (
                <span>⚠️ {labAmount} doesn't divide evenly by {labTp} ({labUnit.toFixed(2)} / part) — try {Math.round(labAmount / labTp) * labTp}!</span>
              ) : !labIsSimplified ? (
                <span>💡 {ratioLabel(labParts)} simplifies to {ratioLabel(labSimplified)} — same split, smaller numbers!</span>
              ) : (
                <span>✨ Clean split! Each 1 part = {fmt(labUnit)}  •  Total {fmt(labAmount)}</span>
              )}
            </div>

            {/* Combined Compact Controls: Steppers & Slider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap',
              background: 'rgba(27, 16, 60, 0.75)',
              border: '2px solid rgba(74, 52, 133, 0.75)',
              borderRadius: '14px',
              padding: '7px 14px',
              width: '100%',
              boxShadow: '0 3px 12px rgba(0,0,0,0.25)'
            }}>
              {/* Ratio Steppers */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {labParts.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '15.5px', fontWeight: '900', color: ['#4A90D9', '#FF8A50', '#A78BFA'][i % 3] }}>
                      Part {String.fromCharCode(65 + i)}
                    </span>
                    <button onClick={() => setPartAt(i, -1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '2px solid #4a3485', background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontWeight: '900', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ minWidth: '24px', fontSize: '22px', fontWeight: '900', color: '#ffffff', textAlign: 'center' }}>{p}</span>
                    <button onClick={() => setPartAt(i, 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '2px solid #4a3485', background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontWeight: '900', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                ))}
                <button
                  onClick={() => { setLabParts(p => p.length < 3 ? [...p, 1] : p.slice(0, 2)); playSound('explore'); }}
                  className="btn-nav-outline" style={{ fontSize: '14px', fontWeight: '900', padding: '5px 10px', borderRadius: '8px' }}>
                  {labParts.length < 3 ? '+ 3rd person' : '− 2 people'}
                </button>
              </div>

              {/* Slider */}
              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '900', color: '#ffffff' }}>
                  <span>Total amount:</span>
                  <span style={{ color: 'var(--accent-gold)', fontSize: '22px', fontWeight: '900' }}>{labAmount}</span>
                </div>
                <input type="range" min="10" max="120" step="1" value={labAmount} onChange={(e) => setLabAmount(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-gold)', height: '6px', margin: '4px 0' }} />
              </div>
            </div>

            {/* Presets buttons (Larger fonts, compact buttons) */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {LAB_PRESETS.map((preset) => (
                <button key={preset.id}
                  className={`shape-selector-btn ${labPresetsSeen.has(preset.id) ? 'shape-selector-btn--active' : ''}`}
                  onClick={() => handleLabPreset(preset)}
                  style={{ fontSize: '17px', fontWeight: '900', padding: '6px 14px', borderRadius: '10px' }}>
                  {labPresetsSeen.has(preset.id) ? '✓ ' : ''}{preset.label}
                </button>
              ))}
              <button className="btn-nav-outline" style={{ fontSize: '15px', fontWeight: '900', padding: '5px 14px', borderRadius: '10px' }} onClick={handleResetA}>
                🔄 Reset
              </button>
            </div>

            {labPresetsSeen.size >= LAB_PRESETS.length && (
              <div style={{ textAlign: 'center', color: 'var(--accent-success-green)', fontWeight: '900', fontSize: '17px' }}>
                🎉 You've explored every ratio preset! Station A complete!
              </div>
            )}

            <div style={{ margin: '0' }} className="sim-mascot-wrap">
              <Mascot mood={labPresetsSeen.size >= LAB_PRESETS.length ? 'celebrating' : 'curious'}
                bubble={<span style={{ fontSize: '17px', fontWeight: '900' }}>{RATIO_CONCEPTS.totalparts.funFact}</span>} />
            </div>
          </div>
        )}

        {/* ================= STATION B: STEP BUILDER ================= */}
        {station === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
              <h3 className="sim-station-title" style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🧱</span> Station B — Step Builder
              </h3>
            </div>
            <p className="sim-station-instruction" style={{ fontSize: '18px', fontWeight: '900', color: '#ded5fb', margin: 0, lineHeight: '1.25', textAlign: 'center' }}>
              Problem {buildIdx + 1} of {BUILDER_ROUNDS.length} — unlock all four steps in order. No skipping!
            </p>

            {/* Problem prompt card */}
            <div style={{
              textAlign: 'center', padding: '8px 16px', borderRadius: '12px', background: 'rgba(27, 16, 60, 0.85)',
              border: '2px solid rgba(74, 52, 133, 0.85)', fontSize: '20px', fontWeight: '900', color: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)', lineHeight: '1.3'
            }}>
              {bRound.prompt}
            </div>

            <RatioBarViewer
              parts={bRound.parts} names={bRound.names}
              amount={stepNum >= 2 && stepFb === 'correct' || stepNum > 2 ? bRound.amount : null}
              unit={bRound.unit} width={640}
              showOnePart={stepNum >= 2}
            />

            {/* Step progress rail */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', margin: '1px 0' }}>
              {[1, 2, 3, 4].map(n => {
                const done = n < stepNum || (n === stepNum && stepFb === 'correct');
                const active = n === stepNum;
                return (
                  <div key={n} style={{
                    padding: '4px 14px', borderRadius: 999, fontSize: '15px', fontWeight: '900', fontFamily: "'Fredoka', 'Inter', sans-serif",
                    background: done ? 'rgba(34,197,94,0.2)' : active ? 'rgba(255,190,26,0.22)' : 'var(--surface-pill-darkest)',
                    border: `2.5px solid ${done ? 'var(--accent-success-green)' : active ? 'var(--accent-gold)' : 'rgba(255,255,255,0.15)'}`,
                    color: done ? 'var(--accent-success-green)' : active ? 'var(--accent-gold)' : 'var(--text-muted-lavender)',
                    boxShadow: active ? '0 0 10px rgba(255,190,26,0.35)' : 'none'
                  }}>
                    {done ? '✓' : n} Step {n}
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', fontSize: '22px', fontWeight: '900', color: 'var(--accent-gold)', textShadow: '0 1px 4px rgba(0,0,0,0.4)', lineHeight: '1.25' }}>
              {bStep.text}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {shuffledStepOptions.map((opt) => {
                const isSelected = stepGuess === opt;
                const isCorrectOpt = stepFb === 'correct' && opt === bStep.answer;
                return (
                  <button key={String(opt)} onClick={() => handleStepGuess(opt)} disabled={stepFb === 'correct'}
                    style={{
                      padding: '8px 20px', borderRadius: '10px', fontWeight: '900', fontSize: '21px', fontFamily: "'Fredoka', 'Inter', monospace",
                      cursor: stepFb === 'correct' ? 'default' : 'pointer',
                      border: `2.5px solid ${isCorrectOpt ? 'var(--accent-success-green)' : isSelected ? 'var(--accent-alert-coral)' : 'rgba(255,255,255,0.25)'}`,
                      background: isCorrectOpt ? 'rgba(34,197,94,0.25)' : isSelected ? 'rgba(239,68,68,0.25)' : 'rgba(27, 16, 60, 0.75)',
                      color: isCorrectOpt ? 'var(--accent-success-green)' : isSelected ? 'var(--accent-alert-coral)' : '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      transition: 'all 0.15s ease'
                    }}>
                    {String(opt)}
                  </button>
                );
              })}
            </div>

            {stepFb === 'correct' && (
              <div style={{
                textAlign: 'center', padding: '6px 16px', borderRadius: '10px', alignSelf: 'center',
                background: 'rgba(34,197,94,0.18)', border: '2px solid var(--accent-success-green)',
                color: 'var(--accent-success-green)', fontWeight: '900', fontSize: '18.5px', fontFamily: "'Fredoka', 'Inter', monospace",
                boxShadow: '0 2px 8px rgba(34,197,94,0.15)'
              }}>
                ✅ {bSteps[stepNum - 1].detail}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {stepFb === 'correct' && !(stepNum === 4 && buildIdx === BUILDER_ROUNDS.length - 1) && (
                <button className="btn-gold" style={{ fontSize: '16.5px', fontWeight: '900', padding: '6px 20px', borderRadius: '10px' }} onClick={handleStepNext}>
                  {stepNum < 4 ? 'Next Step ➔' : 'Next Problem ➔'}
                </button>
              )}
              <button className="btn-nav-outline" style={{ fontSize: '15px', fontWeight: '900', padding: '5px 16px', borderRadius: '10px' }} onClick={handleResetB}>
                🔄 Reset Station B
              </button>
            </div>

            {buildSolvedCount >= BUILDER_ROUNDS.length && (
              <div style={{ textAlign: 'center', color: 'var(--accent-success-green)', fontWeight: '900', fontSize: '18px' }}>
                🏆 Step-by-step master! Station B complete!
              </div>
            )}

            <div style={{ margin: '0' }} className="sim-mascot-wrap">
              <Mascot mood={stepFb === 'correct' ? 'happy' : 'thinking'}
                bubble={<span style={{ fontSize: '17.5px', fontWeight: '900', lineHeight: '1.25' }}>
                  {stepNum === 1 ? 'Add the ratio numbers to find the total parts.'
                    : stepNum === 2 ? 'Divide the total amount by the total parts.'
                    : stepNum === 3 ? 'Multiply that one-part value by the ratio number.'
                    : 'Add all the shares — they must match the original total.'}
                </span>} />
            </div>
          </div>
        )}

        {/* ================= STATION C: REVERSE DETECTIVE ================= */}
        {station === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
              <h3 className="sim-station-title" style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🕵️</span> Station C — Reverse Detective
              </h3>
            </div>
            <p className="sim-station-instruction" style={{ fontSize: '18px', fontWeight: '900', color: '#ded5fb', margin: 0, lineHeight: '1.25', textAlign: 'center' }}>
              Case {revIdx + 1} of {REVERSE_PUZZLES.length} — you know just ONE share, work backwards!
            </p>

            {/* Question card */}
            <div style={{
              textAlign: 'center', padding: '8px 16px', borderRadius: '12px', background: 'rgba(27, 16, 60, 0.85)',
              border: '2px solid rgba(74, 52, 133, 0.85)', fontSize: '20px', fontWeight: '900', color: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)', lineHeight: '1.3'
            }}>
              {rPuz.question}
            </div>

            <RatioBarViewer
              parts={rPuz.parts} names={rPuz.names}
              amount={revFb === 'correct' ? rUnit * totalParts(rPuz.parts) : null}
              unit={rPuz.unit} width={640}
              highlightIndex={revFb === 'correct' ? null : rPuz.knownIdx}
              showOnePart={revFb === 'correct'}
            />

            {/* Clue pill */}
            <div style={{
              textAlign: 'center', padding: '6px 14px', borderRadius: '10px', alignSelf: 'center',
              background: 'rgba(139, 92, 246, 0.16)', border: '2px solid rgba(167, 139, 250, 0.55)',
              color: '#f0eaff', fontWeight: '900', fontSize: '17.5px', fontFamily: "'Fredoka', 'Inter', monospace",
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              💡 {rPuz.names[rPuz.knownIdx]} has {rPuz.parts[rPuz.knownIdx]} parts worth {rPuz.knownVal} — so ONE part = {rPuz.knownVal} ÷ {rPuz.parts[rPuz.knownIdx]}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {shuffledRevOptions.map((opt) => {
                const isSelected = revGuess === opt;
                const isCorrectOpt = revFb === 'correct' && opt === rPuz.answer;
                return (
                  <button key={opt} onClick={() => handleRevGuess(opt)} disabled={revFb === 'correct'}
                    style={{
                      padding: '8px 24px', borderRadius: '10px', fontWeight: '900', fontSize: '23px', fontFamily: "'Fredoka', 'Inter', monospace",
                      cursor: revFb === 'correct' ? 'default' : 'pointer',
                      border: `2.5px solid ${isCorrectOpt ? 'var(--accent-success-green)' : isSelected ? 'var(--accent-alert-coral)' : 'rgba(255,255,255,0.25)'}`,
                      background: isCorrectOpt ? 'rgba(34,197,94,0.25)' : isSelected ? 'rgba(239,68,68,0.25)' : 'rgba(27, 16, 60, 0.75)',
                      color: isCorrectOpt ? 'var(--accent-success-green)' : isSelected ? 'var(--accent-alert-coral)' : '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      transition: 'all 0.15s ease'
                    }}>
                    {opt}
                  </button>
                );
              })}
            </div>

            {revFb === 'correct' && (
              <div style={{
                textAlign: 'center', padding: '6px 16px', borderRadius: '10px', alignSelf: 'center',
                background: 'rgba(34,197,94,0.18)', border: '2px solid var(--accent-success-green)',
                color: 'var(--accent-success-green)', fontWeight: '900', fontSize: '18.5px', fontFamily: "'Fredoka', 'Inter', monospace",
                boxShadow: '0 2px 8px rgba(34,197,94,0.15)'
              }}>
                ✅ {rPuz.working}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {revFb === 'correct' && revIdx < REVERSE_PUZZLES.length - 1 && (
                <button className="btn-gold" style={{ fontSize: '16.5px', fontWeight: '900', padding: '6px 20px', borderRadius: '10px' }} onClick={handleRevNext}>
                  Next Case ➔
                </button>
              )}
              <button className="btn-nav-outline" style={{ fontSize: '15px', fontWeight: '900', padding: '5px 16px', borderRadius: '10px' }} onClick={handleResetC}>
                🔄 Reset Station C
              </button>
            </div>

            {revSolvedCount >= REVERSE_PUZZLES.length && (
              <div style={{ textAlign: 'center', color: 'var(--accent-success-green)', fontWeight: '900', fontSize: '18px' }}>
                🎉 Case closed on every puzzle! Station C complete!
              </div>
            )}

            <div style={{ margin: '0' }} className="sim-mascot-wrap">
              <Mascot mood={revFb === 'correct' ? 'happy' : 'thinking'}
                bubble={<span style={{ fontSize: '17.5px', fontWeight: '900', lineHeight: '1.25' }}>Always find ONE part first — divide the known share by its number of parts!</span>} />
            </div>
          </div>
        )}

        {/* ================= STATION D: REAL-WORLD RATIO LAB ================= */}
        {station === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
              <h3 className="sim-station-title" style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌍</span> Station D — Real-World Ratio Lab
              </h3>
            </div>
            <p className="sim-station-instruction" style={{ fontSize: '18px', fontWeight: '900', color: '#ded5fb', margin: 0, lineHeight: '1.25', textAlign: 'center' }}>
              Pick a scenario, then dial each share up or down until the split is exactly right.
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
              {SANDBOX_IDS.map((id) => {
                const s = getScenario(id);
                return (
                  <button key={id}
                    className={`shape-selector-btn ${sandboxId === id ? 'shape-selector-btn--active' : ''}`}
                    onClick={() => switchSandbox(id)} style={{ fontSize: '16px', fontWeight: '900', padding: '6px 14px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                    {sandboxDoneIds.has(id) ? '✓ ' : ''}{s.icon} {s.title}
                  </button>
                );
              })}
            </div>

            <div style={{
              textAlign: 'center', padding: '7px 16px', borderRadius: '12px', background: 'rgba(27, 16, 60, 0.85)',
              border: '2px solid rgba(74, 52, 133, 0.85)', fontSize: '19.5px', fontWeight: '900', color: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)', lineHeight: '1.3'
            }}>
              {sc.icon} {sc.context}
            </div>

            <RatioBarViewer
              parts={sc.parts} names={sc.names}
              amount={sandboxDoneIds.has(sandboxId) ? sc.amount : null}
              unit={sc.unit} width={640}
              showOnePart={sandboxDoneIds.has(sandboxId)}
            />

            {/* Share dials */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {sc.parts.map((p, i) => {
                const val = current[i];
                const right = val === correctShares[i];
                const color = ['#4A90D9', '#FF8A50', '#A78BFA'][i % 3];
                return (
                  <div key={i} style={{
                    padding: '6px 14px', borderRadius: '12px', minWidth: '145px',
                    background: right ? 'rgba(34,197,94,0.18)' : `${color}18`,
                    border: `2.5px solid ${right ? 'var(--accent-success-green)' : color}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ fontSize: '16.5px', fontWeight: '900', color: right ? 'var(--accent-success-green)' : color, textAlign: 'center' }}>
                      {sc.names[i]} <span style={{ opacity: 0.9 }}>({p} parts)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '2px' }}>
                      <button onClick={() => adjustShare(i, -1)} disabled={sandboxDoneIds.has(sandboxId)}
                        style={{ width: '30px', height: '30px', borderRadius: '8px', border: `2px solid ${color}`, background: 'rgba(255,255,255,0.08)', color, fontWeight: '900', fontSize: '20px', cursor: sandboxDoneIds.has(sandboxId) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ minWidth: '60px', textAlign: 'center', fontFamily: "'Fredoka', 'Inter', monospace", fontSize: '23px', fontWeight: '900', color: '#ffffff' }}>
                        {fmt(val)}{sc.unit}
                      </span>
                      <button onClick={() => adjustShare(i, 1)} disabled={sandboxDoneIds.has(sandboxId)}
                        style={{ width: '30px', height: '30px', borderRadius: '8px', border: `2px solid ${color}`, background: 'rgba(255,255,255,0.08)', color, fontWeight: '900', fontSize: '20px', cursor: sandboxDoneIds.has(sandboxId) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    {right && <div style={{ textAlign: 'center', fontSize: '13.5px', fontWeight: '900', color: 'var(--accent-success-green)', marginTop: '1px' }}>✓ correct</div>}
                  </div>
                );
              })}
            </div>

            {/* Dialled total & Reset Station D on the same row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{
                textAlign: 'center', fontSize: '18px', fontWeight: '900',
                color: dialledTotal === sc.amount ? 'var(--accent-success-green)' : dialledTotal > sc.amount ? 'var(--accent-alert-coral)' : '#ded5fb'
              }}>
                Dialled total: <span style={{ color: dialledTotal === sc.amount ? 'var(--accent-success-green)' : '#ffbe1a', fontFamily: "'Fredoka', 'Inter', monospace", fontSize: '20px' }}>{fmt(dialledTotal)}{sc.unit}</span> / {fmt(sc.amount)}{sc.unit}
                {dialledTotal > sc.amount ? ' — too much!' : dialledTotal === sc.amount && !allMatch ? ' — right total, wrong split!' : ''}
              </div>
              <button className="btn-nav-outline" style={{ fontSize: '15px', fontWeight: '900', padding: '4px 14px', borderRadius: '10px' }} onClick={handleResetD}>
                🔄 Reset Station D
              </button>
            </div>

            {sandboxDoneIds.has(sandboxId) && (
              <div style={{
                textAlign: 'center', padding: '5px 16px', borderRadius: '10px', alignSelf: 'center',
                background: 'rgba(34,197,94,0.18)', border: '2px solid var(--accent-success-green)',
                color: 'var(--accent-success-green)', fontWeight: '900', fontSize: '17.5px', fontFamily: "'Fredoka', 'Inter', monospace",
                boxShadow: '0 2px 8px rgba(34,197,94,0.15)'
              }}>
                ✅ {solveSteps(sc.amount, sc.parts, sc.names, sc.unit)[1].detail} → {sc.names.map((n, k) => `${n} ${fmt(correctShares[k])}${sc.unit}`).join(', ')}
              </div>
            )}

            {sandboxSolvedCount >= SANDBOX_IDS.length && (
              <div style={{ textAlign: 'center', color: 'var(--accent-success-green)', fontWeight: '900', fontSize: '18px' }}>
                🏆 Real-world sharing master! Station D complete!
              </div>
            )}

            <div style={{ margin: '0' }} className="sim-mascot-wrap">
              <Mascot mood={sandboxDoneIds.has(sandboxId) ? 'happy' : 'curious'}
                bubble={<span style={{ fontSize: '17.5px', fontWeight: '900', lineHeight: '1.25' }}>
                  {sandboxDoneIds.has(sandboxId) ? 'Perfect split! Try another scenario. 🎁'
                    : `Work out one part first: ${fmt(sc.amount)} ÷ ${totalParts(sc.parts)} — then dial each share.`}
                </span>} />
            </div>
          </div>
        )}

      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', flexShrink: 0, width: '100%' }}>
        <button className="btn-nav-outline" onClick={() => { if (station > 0) setStation(p => p - 1); }} disabled={station === 0} style={{ fontSize: '15.5px', fontWeight: '900', padding: '8px 20px' }}>
          🠔 Previous Station
        </button>

        {station < 3 ? (
          <button className="btn-nav-outline" onClick={() => setStation(p => p + 1)} style={{ fontSize: '15.5px', fontWeight: '900', padding: '8px 20px' }}>
            Next Station ➔
          </button>
        ) : (
          <button className="btn-gold" onClick={onNext} disabled={!(completedStations[3] || sandboxDoneIds.size > 0)}
            style={{ padding: '12px 30px', fontSize: '18px', fontWeight: '900', opacity: (completedStations[3] || sandboxDoneIds.size > 0) ? 1 : 0.5, cursor: (completedStations[3] || sandboxDoneIds.size > 0) ? 'pointer' : 'not-allowed', boxShadow: (completedStations[3] || sandboxDoneIds.size > 0) ? '0 4px 18px rgba(255, 190, 26, 0.4)' : 'none' }}>
            Begin Challenge Game! ➔
          </button>
        )}
      </div>
    </div>
  );
}
