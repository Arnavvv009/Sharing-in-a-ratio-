import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';
import { totalParts, fmt } from '../../data/ratioData';

const AMOUNT = 45; // sweets in the jar

export default function WonderPhase({ onNext, playSound, speak }) {
  // The learner controls BOTH ratio numbers — a different interaction pattern
  // from the single slider used in earlier modules.
  const [aParts, setAParts] = useState(1);
  const [bParts, setBParts] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [isSolving, setIsSolving] = useState(false);

  useEffect(() => {
    speak("Robo has 45 sweets to share between Aisha and Ben in the ratio 4 to 5. Robo's friend says you should just cut the 45 in half, because sharing means everyone gets the same. Is that actually right?");
  }, [speak]);

  const tp = totalParts([aParts, bParts]);
  const unitVal = AMOUNT / tp;
  const shareA = aParts * unitVal;
  const shareB = bParts * unitVal;
  const isWhole = Number.isInteger(unitVal);
  const isTarget = aParts === 4 && bParts === 5;

  const autoSolve = () => {
    if (isSolving) return;
    setIsSolving(true);
    playSound('explore');

    // Animate from the current ratio up to the true 4 : 5 split
    let a = 1, b = 1;
    setAParts(1); setBParts(1);
    const interval = setInterval(() => {
      if (a < 4) a += 1;
      else if (b < 5) b += 1;
      setAParts(a); setBParts(b);
      if (a === 4 && b === 5) {
        clearInterval(interval);
        setIsSolving(false);
        playSound('shapeReveal');
        setRevealed(true);
        speak("Not right at all! Sharing in a ratio means splitting into EQUAL PARTS, not equal shares. 4 plus 5 makes 9 equal parts, each worth 5 sweets — so Aisha gets 20 and Ben gets 25. Let's learn every step in the story!");
      }
    }, 260);
  };

  const handleReveal = () => {
    if (revealed) { onNext(); return; }
    setAParts(4); setBParts(5);
    setRevealed(true);
    playSound('shapeReveal');
    speak("Not right at all! Sharing in a ratio means splitting into EQUAL PARTS, not equal shares. 4 plus 5 makes 9 equal parts, each worth 5 sweets — so Aisha gets 20 and Ben gets 25. Let's learn every step in the story!");
  };

  const nudge = (setter, val, delta, min, max) => {
    const next = Math.max(min, Math.min(max, val + delta));
    setter(next);
    playSound('explore');
    if (next >= 4 && !revealed && !isSolving) {
      setRevealed(true);
      playSound('shapeReveal');
      speak("Notice it! Sharing in a ratio means equal PARTS, not equal shares — the person with more parts gets more sweets.");
    }
  };

  // Jar geometry
  const W = 340, H = 180;
  const jarX = 22, jarY = 30, jarW = 296, jarH = 66;
  const aW = (aParts / tp) * jarW;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1', padding: '16px 18px', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', animation: 'slideInUp 0.4s ease-out', justifyContent: 'space-between', height: '100%' }}>
      <Mascot
        mood={revealed ? "celebrating" : "thinking"}
        bubble={revealed
          ? <span style={{ fontSize: '18px', fontWeight: '800' }}>Equal PARTS, not equal shares! 🍬</span>
          : <span style={{ fontSize: '18px', fontWeight: '800' }}>Hmm... I wonder... 🤔</span>}
      />

      {/* Sweet Jar Splitter */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '-12px 0 6px 0', width: '100%', zIndex: 2 }}>
        <div style={{
          position: 'relative', width: '340px', height: '180px',
          backgroundColor: 'rgba(27, 16, 60, 0.6)', border: '1.5px solid rgba(74, 52, 133, 0.6)',
          borderRadius: '16px', padding: '8px', boxShadow: '0 6px 20px rgba(0,0,0,0.25)', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '8px', left: '12px', fontSize: '11px', fontWeight: '900',
            color: 'var(--accent-gold)', letterSpacing: '1px', textTransform: 'uppercase'
          }}>
            🍬 Sweet Jar Splitter ({AMOUNT} sweets)
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', margin: '0 auto' }}>
            {/* Jar outline */}
            <rect x={jarX - 4} y={jarY - 6} width={jarW + 8} height={jarH + 12} rx="12" fill="rgba(255,255,255,0.04)" stroke="#4a3485" strokeWidth="2.5" />

            {/* Equal-part division blocks */}
            {Array.from({ length: tp }).map((_, i) => {
              const bw = jarW / tp;
              const bx = jarX + i * bw;
              const isA = i < aParts;
              return (
                <rect key={i} x={bx + 1.5} y={jarY} width={Math.max(1, bw - 3)} height={jarH} rx="4"
                  fill={isA ? '#4A90D9' : '#FF8A50'} fillOpacity="0.4"
                  stroke={isA ? '#4A90D9' : '#FF8A50'} strokeWidth="2" />
              );
            })}

            {/* Divider between the two people */}
            <line x1={jarX + aW} y1={jarY - 10} x2={jarX + aW} y2={jarY + jarH + 10} stroke="#ffbe1a" strokeWidth="3" strokeDasharray="4,3" />

            {/* Share labels */}
            <text x={jarX + aW / 2} y={jarY + jarH + 30} textAnchor="middle" fill="#4A90D9" fontSize="14" fontWeight="900" fontFamily="Nunito, sans-serif">
              Aisha: {isWhole ? fmt(shareA) : shareA.toFixed(1)}
            </text>
            <text x={jarX + aW + (jarW - aW) / 2} y={jarY + jarH + 30} textAnchor="middle" fill="#FF8A50" fontSize="14" fontWeight="900" fontFamily="Nunito, sans-serif">
              Ben: {isWhole ? fmt(shareB) : shareB.toFixed(1)}
            </text>

            {/* Total parts readout */}
            <text x={W / 2} y={jarY + jarH + 58} textAnchor="middle" fill={isWhole ? '#34d399' : '#ef4444'} fontSize="13" fontWeight="900" fontFamily="Nunito, sans-serif">
              {aParts} + {bParts} = {tp} parts → 1 part = {isWhole ? fmt(unitVal) : unitVal.toFixed(2)} sweets {isWhole ? '✓' : '(not a whole sweet!)'}
            </text>
          </svg>
        </div>

        {/* Ratio readout */}
        <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: '800', margin: '4px 0', fontFamily: "'Inter', sans-serif" }}>
          Ratio: <span style={{ color: isTarget ? 'var(--accent-gold)' : '#bca8f2', fontWeight: '900' }}>{aParts} : {bParts}</span>
          {isTarget ? ' (the real split! 🎯)' : ''}
        </div>

        {/* Dual +/- steppers — a different control pattern from a single slider */}
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Aisha', val: aParts, setter: setAParts, color: '#4A90D9' },
            { label: 'Ben', val: bParts, setter: setBParts, color: '#FF8A50' },
          ].map(ctrl => (
            <div key={ctrl.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '900', color: ctrl.color, minWidth: '42px' }}>{ctrl.label}</span>
              <button onClick={() => nudge(ctrl.setter, ctrl.val, -1, 1, 9)} disabled={isSolving}
                style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${ctrl.color}`, background: 'transparent', color: ctrl.color, fontWeight: 900, fontSize: 16, cursor: isSolving ? 'not-allowed' : 'pointer' }}>−</button>
              <span style={{ minWidth: 22, fontSize: 18, fontWeight: 900, color: '#ffffff' }}>{ctrl.val}</span>
              <button onClick={() => nudge(ctrl.setter, ctrl.val, 1, 1, 9)} disabled={isSolving}
                style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${ctrl.color}`, background: 'transparent', color: ctrl.color, fontWeight: 900, fontSize: 16, cursor: isSolving ? 'not-allowed' : 'pointer' }}>+</button>
            </div>
          ))}
        </div>

        <button className="btn-gold" onClick={autoSolve} disabled={isSolving}
          style={{
            marginTop: '6px', padding: '6px 16px', fontSize: '13px', fontWeight: '800', borderRadius: '999px',
            border: '1.5px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            opacity: isSolving ? 0.6 : 1, cursor: isSolving ? 'not-allowed' : 'pointer'
          }}>
          🍬 Auto-Split (1 : 1 ➔ 4 : 5)
        </button>
      </div>

      <h2 className="wonder-heading" style={{ fontSize: '26px', fontWeight: '900', lineHeight: '1.35', margin: '4px 0', zIndex: 2, textAlign: 'center' }}>
        Robo shares 45 sweets between Aisha and Ben in the ratio 4 : 5. Robo's friend says just cut the 45 in half, because sharing means everyone gets the same. Is that actually right?
      </h2>

      <p className="wonder-subtitle" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px', zIndex: 2, opacity: 0.9 }}>
        What if "sharing in a ratio" means equal PARTS, rather than equal shares?
      </p>

      <div className="hint-fact-pill" style={{ marginBottom: '8px', zIndex: 2, padding: '8px 16px', fontSize: '16px', fontWeight: '900' }}>
        ✨ Add the parts first: 4 + 5 = 9 equal parts, each worth 45 ÷ 9 = 5 sweets! ✨
      </div>

      {revealed && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const size = Math.random() * 6 + 6;
            const color = ['#ffbe1a', '#22c55e', '#a78bfa', '#ff8a50'][i % 4];
            return (
              <div key={i} style={{
                position: 'absolute', left: `${left}%`, top: '60%',
                width: `${size}px`, height: `${size}px`, backgroundColor: color,
                borderRadius: i % 2 === 0 ? '50%' : '0', opacity: 0.8,
                animation: `floatUp 1.2s ease-out forwards`, animationDelay: `${delay}s`
              }} />
            );
          })}
        </div>
      )}

      <button className="btn-gold" onClick={handleReveal} style={{ alignSelf: 'center', zIndex: 2, padding: '12px 40px', fontSize: '21px', fontWeight: '900' }}>
        {revealed ? "Let's Read the Story! ➔" : "I have a guess! 🔍 Let's Find Out!"}
      </button>
    </div>
  );
}
