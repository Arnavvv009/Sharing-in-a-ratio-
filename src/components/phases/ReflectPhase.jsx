import React, { useState } from 'react';
import Mascot from '../shared/Mascot';

const getBadgeIcon = (id) => {
  switch (id) {
    case 'parts_spotter': return '🔍';
    case 'sharing_pro': return '✏️';
    case 'ratio_master': return '👑';
    case 'perfect_world': return '🎯';
    case 'streak_legend': return '🔥';
    case 'real_world_champion': return '🌍';
    case 'ratio_explorer': return '🍬';
    case 'split_champion': return '🎁';
    case 'full_journey': return '🎓';
    default: return '⭐';
  }
};

const getBadgeLabel = (id) => {
  switch (id) {
    case 'parts_spotter': return 'Parts Spotter';
    case 'sharing_pro': return 'Sharing Pro';
    case 'ratio_master': return 'Ratio Master';
    case 'perfect_world': return 'Perfect World';
    case 'streak_legend': return 'Streak Legend';
    case 'real_world_champion': return 'Real World Champion';
    case 'ratio_explorer': return 'Ratio Explorer';
    case 'split_champion': return 'Fair Split Champion';
    case 'full_journey': return 'Full Journey';
    default: return 'Badge Unlocked';
  }
};

const WORLD_DATA = [
  { name: "Reading Ratios", emoji: "🔗" },
  { name: "Finding One Part", emoji: "🧩" },
  { name: "Two-Way Sharing", emoji: "🍬" },
  { name: "Three-Way Sharing", emoji: "👥" },
  { name: "Simplifying Ratios", emoji: "✂️" },
  { name: "Working Backwards", emoji: "🔁" },
  { name: "Difference Problems", emoji: "📐" },
  { name: "Ratio & Fractions", emoji: "🍕" },
  { name: "Real World Sharing", emoji: "🏙️" },
  { name: "Mystery Ratio Detective", emoji: "🕵️" },
];

const CONCEPT_PROMPTS = [
  {
    worldIndices: [0],
    prompt: "What does a ratio like 4 : 5 actually tell you?",
    explanation: "It compares PARTS against each other, not against the whole. Every block is the same size \u2014 one person simply holds 4 of them and the other holds 5. And order matters: 4 : 5 is not the same as 5 : 4."
  },
  {
    worldIndices: [1, 2],
    prompt: "Walk me through the four steps for sharing an amount in a ratio.",
    explanation: "Step 1: ADD the ratio numbers to get the total parts. Step 2: DIVIDE the total amount by that to find one part. Step 3: MULTIPLY one part by each ratio number to get each share. Step 4: ADD the shares to check they match the original total."
  },
  {
    worldIndices: [3, 4],
    prompt: "Does simplifying a ratio change how the amount is shared?",
    explanation: "Not at all. 6 : 9 and 2 : 3 produce exactly the same shares \u2014 simplifying just gives you smaller, friendlier numbers to work with. Divide every ratio number by their highest common factor."
  },
  {
    worldIndices: [5, 6],
    prompt: "If you only know ONE person's share, how do you find the total?",
    explanation: "Work backwards. Divide that known share by ITS number of parts to find one part, then multiply by the total parts. If you are told the DIFFERENCE instead, divide it by the difference in parts first."
  },
  {
    worldIndices: [7],
    prompt: "How do you turn a ratio into a fraction of the whole?",
    explanation: "Add the parts to get the denominator, and use that person's parts as the numerator. In 2 : 3 the total is 5 parts, so the first person gets 2/5 and the second gets 3/5 of the whole."
  },
  {
    worldIndices: [8, 9],
    prompt: "Where would you actually use sharing in a ratio in real life?",
    explanation: "Splitting prize money fairly, mixing paint or concrete to the right recipe, sharing sweets between friends, or dividing a lesson into theory and practical time \u2014 ratios keep every one of them fair and consistent."
  }
];

export default function ReflectPhase({
  xp,
  totalStars,
  unlockedBadges,
  worldScores,
  correctAnswers,
  onReset,
  playSound,
  speak,
  unlockBadge
}) {
  const getStarRating = (score) => {
    if (score === null) return 0;
    if (score >= 9) return 3;
    if (score >= 7) return 2;
    if (score >= 5) return 1;
    return 0;
  };

  const totalStarsEarned = worldScores.reduce((acc, score) => acc + getStarRating(score), 0);
  const worldsCompleted = worldScores.filter(score => score !== null).length;

  // Find which concepts are unlocked
  const unlockedConcepts = CONCEPT_PROMPTS.map((cp, cIdx) => {
    const isUnlocked = cp.worldIndices.some(wIdx => worldScores[wIdx] !== null);
    return { ...cp, index: cIdx, isUnlocked };
  });

  // Automatically determine the recommended/default concept index based on user interactions
  const getAutoConceptIndex = () => {
    const completedWorldIndices = [];
    worldScores.forEach((score, idx) => {
      if (score !== null) completedWorldIndices.push(idx);
    });

    if (completedWorldIndices.length === 0) return 0; // default to first

    // Find the world index with the lowest score (to target reflection on their hardest concept)
    let lowestScoreIdx = completedWorldIndices[0];
    let lowestScore = worldScores[lowestScoreIdx];
    completedWorldIndices.forEach(idx => {
      if (worldScores[idx] < lowestScore) {
        lowestScore = worldScores[idx];
        lowestScoreIdx = idx;
      }
    });

    if (lowestScore < 10) {
      const targetConcept = CONCEPT_PROMPTS.findIndex(cp => cp.worldIndices.includes(lowestScoreIdx));
      if (targetConcept !== -1) return targetConcept;
    }

    // Otherwise target the latest completed world concept
    const latestWorldIdx = completedWorldIndices[completedWorldIndices.length - 1];
    const targetConcept = CONCEPT_PROMPTS.findIndex(cp => cp.worldIndices.includes(latestWorldIdx));
    return targetConcept !== -1 ? targetConcept : 0;
  };

  const autoIndex = getAutoConceptIndex();

  const [selectedConceptIdx, setSelectedConceptIdx] = useState(null);
  const activeConceptIdx = selectedConceptIdx !== null ? selectedConceptIdx : autoIndex;
  const activeConcept = CONCEPT_PROMPTS[activeConceptIdx];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      gap: '36px',
      padding: '22px 26px',
      alignItems: 'stretch',
      position: 'relative',
      overflow: 'hidden',
      animation: 'slideInUp 0.4s ease-out',
      marginTop: '-20px'
    }}>
      {/* Left Column: Title, Performance Stats, Badges, Mascot, Button */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1.2',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
          <h2 style={{ color: 'var(--accent-gold)', fontSize: '42px', fontWeight: '900', textAlign: 'center', margin: 0, fontFamily: "'Fredoka', sans-serif" }}>
            Your Performance!
          </h2>

          <div className="results-stats-row" style={{ width: '100%', gap: '16px', display: 'flex' }}>
            <div className="results-stat-card stat-card-gold" style={{ flex: 1, padding: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '4px' }}>⭐</div>
              <div className="results-stat-val" style={{ fontSize: '38px', fontWeight: '900', color: 'var(--accent-gold)' }}>{totalStarsEarned}</div>
              <div className="results-stat-label" style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Total Stars</div>
            </div>
            <div className="results-stat-card stat-card-green" style={{ flex: 1, padding: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '4px' }}>✅</div>
              <div className="results-stat-val" style={{ fontSize: '38px', fontWeight: '900', color: 'var(--accent-gold)' }}>{correctAnswers}</div>
              <div className="results-stat-label" style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Correct Answers</div>
            </div>
            <div className="results-stat-card stat-card-blue" style={{ flex: 1, padding: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '4px' }}>🌍</div>
              <div className="results-stat-val" style={{ fontSize: '38px', fontWeight: '900', color: 'var(--accent-gold)' }}>{worldsCompleted}/10</div>
              <div className="results-stat-label" style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Worlds Done</div>
            </div>
          </div>

          {unlockedBadges.length > 0 && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '28px', fontWeight: '900', fontFamily: "'Fredoka', sans-serif" }}>Badges Earned</h3>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {unlockedBadges.map((badgeId) => (
                  <div key={badgeId} className="badge-card-premium" style={{
                    background: 'var(--surface-card-nested)', borderRadius: '16px', padding: '14px 18px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '110px'
                  }}>
                    <span style={{ fontSize: '34px' }}>{getBadgeIcon(badgeId)}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted-lavender)', textAlign: 'center' }}>
                      {getBadgeLabel(badgeId)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Mascot mood="excited" bubble={<span style={{ fontSize: '21px', fontWeight: '800' }}>Amazing work! Let's reflect a little! 📋</span>} />

        <button className="btn-gold btn-shimmer" onClick={onReset} style={{ padding: '18px 44px', fontSize: '25px', fontWeight: '800', alignSelf: 'center', width: '90%', margin: 0 }}>
          Begin New Journey
        </button>
      </div>

      {/* Right Column: World Progress & Time to Reflect */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1.5',
        gap: '20px',
        justifyContent: 'space-between'
      }}>
        <div style={{ width: '100%', border: '1.5px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '28px', fontWeight: '900', textAlign: 'center', fontFamily: "'Fredoka', sans-serif" }}>
            World Progress
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', justifyContent: 'center' }}>
            {WORLD_DATA.map((world, idx) => {
              const stars = getStarRating(worldScores[idx]);
              const completed = worldScores[idx] !== null;
              return (
                <div key={idx} className={completed ? "world-grid-cell world-grid-cell-completed" : "world-grid-cell"} style={{
                  background: completed ? 'rgba(255, 190, 26, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                }}>
                  <span style={{ fontSize: '30px' }}>{world.emoji}</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ fontSize: '13px', opacity: i < stars ? 1 : 0.2 }}>☆</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="reflect-panel-glow" style={{ textAlign: 'center', width: '100%', border: '1.5px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '22px 28px', background: 'var(--surface-pill-darkest)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: 'var(--accent-gold)', fontSize: '30px', fontWeight: '900', marginBottom: '16px', fontFamily: "'Fredoka', sans-serif" }}>
            Time to Reflect!
          </h3>
          
          {/* Concept selector tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
            {unlockedConcepts.map((c, idx) => {
              const isActive = idx === activeConceptIdx;
              const isRecommended = idx === autoIndex && selectedConceptIdx === null;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedConceptIdx(idx);
                    if (playSound) playSound('explore');
                    if (speak) speak(c.prompt);
                  }}
                  style={{
                    fontSize: '16.5px',
                    fontWeight: '800',
                    padding: '10px 18px',
                    borderRadius: '24px',
                    border: `2px solid ${isActive ? 'var(--accent-gold)' : isRecommended ? 'rgba(255, 190, 26, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: isActive ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#130a2a' : isRecommended ? 'var(--accent-gold)' : 'var(--text-muted-lavender)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Topic {idx + 1} {isRecommended ? '💡' : ''}
                </button>
              );
            })}
          </div>

          <div key={activeConceptIdx} className="reflect-content-fade" style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
            <p style={{ color: '#ffffff', fontSize: '23px', fontWeight: '800', margin: '0 0 16px 0', lineHeight: '1.35', textAlign: 'center' }}>
              {activeConcept.prompt}
            </p>
            <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1.5px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', padding: '20px', color: 'var(--text-muted-lavender)', fontSize: '21px', fontWeight: '700', lineHeight: '1.45', textAlign: 'left', width: '100%' }}>
              {activeConcept.explanation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
