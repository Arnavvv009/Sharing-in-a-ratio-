import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';
import RatioBarViewer from '../shared/RatioBarViewer';
import { questionBank } from '../../data/questionBank';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const WORLDS = [
  { id: 0, name: "Reading Ratios", color: "#34D399", focus: "Notation and total parts", difficulty: "Easy" },
  { id: 1, name: "Finding One Part", color: "#A78BFA", focus: "Total amount ÷ total parts", difficulty: "Easy-Med" },
  { id: 2, name: "Two-Way Sharing", color: "#4A90D9", focus: "Splitting between two people", difficulty: "Medium" },
  { id: 3, name: "Three-Way Sharing", color: "#FF8A50", focus: "Splitting between three people", difficulty: "Medium" },
  { id: 4, name: "Simplifying Ratios", color: "#e6a200", focus: "Reducing to simplest form", difficulty: "Med-Hard" },
  { id: 5, name: "Working Backwards", color: "#8b5cf6", focus: "From one share to the total", difficulty: "Medium" },
  { id: 6, name: "Difference Problems", color: "#06b6d4", focus: "Using the gap between shares", difficulty: "Hard" },
  { id: 7, name: "Ratio & Fractions", color: "#ec4899", focus: "Ratios written as fractions", difficulty: "Hard" },
  { id: 8, name: "Real World Sharing", color: "#ef4444", focus: "Sweets, paint, money, classes", difficulty: "Hard" },
  { id: 9, name: "Mystery Ratio Detective", color: "#10b981", focus: "Mixed hard, reverse reasoning", difficulty: "Hardest" }
];

export default function PlayPhase({
  onNext,
  playSound,
  speak,
  xp,
  setXp,
  totalStars,
  setTotalStars,
  streak,
  setStreak,
  maxStreak,
  setMaxStreak,
  worldScores,
  setWorldScores,
  unlockedBadges,
  unlockBadge,
  usedQuestionIds,
  setUsedQuestionIds,
  onResetWorlds,
  setCorrectAnswers
}) {
  const [activeWorld, setActiveWorld] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currQIdx, setCurrQIdx] = useState(0);

  const [lives, setLives] = useState(3);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [answeredState, setAnsweredState] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [floatScore, setFloatScore] = useState(null);

  const startWorld = (worldId) => {
    const worldQuestions = questionBank.filter(q => q.world === worldId);
    const usedForThisWorld = usedQuestionIds[worldId] || [];
    const availableQuestions = worldQuestions.filter(q => !usedForThisWorld.includes(q.id));
    const questionsToUse = availableQuestions.length > 0 ? availableQuestions : worldQuestions;
    const preparedQuestions = shuffle(questionsToUse).slice(0, 10).map(q => ({
      ...q,
      options: shuffle(q.options)
    }));

    setQuestions(preparedQuestions);
    setCurrQIdx(0);
    setLives(3);
    setAttempts(0);
    setHintsUsed(0);
    setAnsweredState(null);
    setSelectedOption(null);
    setShowExplanation(false);
    setActiveWorld(worldId);
    playSound('levelUp');
    speak(`Welcome to World ${worldId + 1}: ${WORLDS[worldId].name}. Let's answer some questions!`);
  };

  const currentQ = questions[currQIdx];

  useEffect(() => {
    if (activeWorld !== null && currentQ) {
      speak(currentQ.questionText);
    }
  }, [currQIdx, activeWorld, currentQ, speak]);

  const handleAnswerSubmit = (option, e) => {
    if (!currentQ || answeredState === 'correct') return;

    setSelectedOption(option);
    const isCorrect = option === currentQ.correctAnswer;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    setUsedQuestionIds(prev => {
      const world = { ...prev };
      if (!world[activeWorld]) world[activeWorld] = [];
      if (!world[activeWorld].includes(currentQ.id)) world[activeWorld].push(currentQ.id);
      return world;
    });

    if (isCorrect) {
      playSound('correct');
      setAnsweredState('correct');
      if (typeof setCorrectAnswers === 'function') {
        setCorrectAnswers(prev => prev + 1);
      }
      setStreak(prev => {
        const nextStreak = prev + 1;
        if (nextStreak > maxStreak) setMaxStreak(nextStreak);
        return nextStreak;
      });

      let earnedXP = 10;
      if (nextAttempts === 2) earnedXP = 7;
      if (hintsUsed > 0) earnedXP = 5;

      let bonusXP = 0;
      if (streak >= 4) {
        bonusXP = 5;
        playSound('streak');
      }

      const totalEarned = earnedXP + bonusXP;
      setXp(prev => prev + totalEarned);

      if (e) {
        const rect = e.target.getBoundingClientRect();
        setFloatScore({ x: rect.left + rect.width / 2, y: rect.top, val: `+${totalEarned} XP` });
        setTimeout(() => setFloatScore(null), 1000);
      }

      speak("That's correct!");

      if (streak + 1 >= 10) unlockBadge('streak_legend');

    } else {
      playSound('wrong');
      setStreak(0);
      setShowExplanation(true);
      setAnsweredState('incorrect');

      if (lives > 1) {
        setLives(prev => prev - 1);
        speak("Not quite!");
      } else {
        setLives(0);
        speak("Not quite! Oh no, you have run out of hearts. Let's retry this world.");
      }
    }
  };

  const speakPraisePhrase = () => {
    const praises = ["Excellent!", "Well done!", "Brilliant!", "You got it!", "Super smart!"];
    speak(praises[Math.floor(Math.random() * praises.length)]);
  };

  const handleNextQuestion = () => {
    if (currQIdx < questions.length - 1) {
      setCurrQIdx(prev => prev + 1);
      setAttempts(0);
      setHintsUsed(0);
      setAnsweredState(null);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      const finalWorldScore = Math.max(0, lives + 7);

      setWorldScores(prev => {
        const nextScores = [...prev];
        nextScores[activeWorld] = finalWorldScore;
        return nextScores;
      });

      let stars = 0;
      if (finalWorldScore >= 9) stars = 3;
      else if (finalWorldScore >= 7) stars = 2;
      else if (finalWorldScore >= 5) stars = 1;

      setTotalStars(prev => prev + stars);
      playSound('badge');

      if (activeWorld === 6 && finalWorldScore >= 9) unlockBadge('split_champion');
      if (activeWorld === 8 && finalWorldScore >= 9) unlockBadge('real_world_champion');
      if (activeWorld === 9 && finalWorldScore >= 9) unlockBadge('perfect_world');

      speak(`Fabulous! You completed the world with ${stars} stars and a score of ${finalWorldScore} out of 10.`);
      setActiveWorld(null);
    }
  };

  const handleRetryWorld = () => startWorld(activeWorld);

  const handleUseHint = () => {
    if (hintsUsed < 2) {
      setHintsUsed(prev => prev + 1);
      playSound('explore');
      const hintText = hintsUsed === 0 ? currentQ.hint1 : currentQ.hint2;
      speak(hintText);
    }
  };

  const isWorldUnlocked = (idx) => {
    if (idx === 0) return true;
    const priorScore = worldScores[idx - 1];
    return priorScore !== null && priorScore >= 5;
  };

  // -------------------------------------------------------------
  // RENDER GRAPHICS CANVAS
  // -------------------------------------------------------------
  const renderVisual = () => {
    if (!currentQ || !currentQ.visual) return null;
    const { visual, ratioParts, ratioAmount, badgeEmoji, badgeText } = currentQ;

    if (visual === 'ratio_bar') {
      return (
        <RatioBarViewer
          parts={ratioParts || [2, 3]}
          amount={ratioAmount !== undefined ? ratioAmount : null}
          width={580}
          showOnePart={ratioAmount !== undefined}
        />
      );
    }

    if (visual === 'concept_badge') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '72px', animation: 'floatActor 2s ease-in-out infinite alternate' }}>
            {badgeEmoji || '🍬'}
          </div>
          {badgeText && (
            <div style={{
              fontFamily: "'Fredoka', 'Inter', monospace", fontSize: '22px', fontWeight: '900', color: 'var(--accent-success-green)',
              backgroundColor: '#0e0724', border: '2.5px solid var(--accent-success-green)', borderRadius: '12px', padding: '6px 18px',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)'
            }}>
              {badgeText}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // -------------------------------------------------------------
  // VIEWPORT: WORLD SELECT SCREEN
  // -------------------------------------------------------------
  if (activeWorld === null) {
    const allCompleted = worldScores.every(score => score !== null);
    if (allCompleted) unlockBadge('ratio_master');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1', padding: '12px 14px 20px 14px', position: 'relative', overflow: 'hidden', animation: 'slideInUp 0.4s ease-out' }}>
        <div className="simulate-header" style={{ marginBottom: '12px', textAlign: 'center' }}>
          <h2 className="simulate-heading" style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '4px' }}>🎮 Choose Your World!</h2>
          <p className="simulate-sub" style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>Beat each world to unlock the next. Earn stars and XP!</p>
        </div>

        <div className="world-select-list">
          {WORLDS.map((w, idx) => {
            const unlocked = isWorldUnlocked(idx);
            const score = worldScores[idx];
            let starRating = 0;
            if (score >= 9) starRating = 3;
            else if (score >= 7) starRating = 2;
            else if (score >= 5) starRating = 1;

            return (
              <div key={w.id} className={`world-card ${unlocked ? '' : 'world-card--locked'}`}>
                <div className="world-card-left">
                  {unlocked ? (
                    <div className="world-dot-icon" style={{ backgroundColor: `${w.color}20`, border: `2.5px solid ${w.color}` }}>
                      <span style={{ fontSize: '14px' }}>🍬</span>
                    </div>
                  ) : (
                    <div className="world-lock-icon">🔒</div>
                  )}
                  <div className="world-info">
                    <span className="world-name" style={{ fontSize: '19px', fontWeight: '800', color: '#ffffff' }}>World {w.id + 1}: {w.name}</span>
                    <span className="world-difficulty" style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-muted-lavender)' }}>Focus: {w.focus} ({w.difficulty})</span>
                  </div>
                </div>

                <div className="world-card-right">
                  {unlocked && score !== null && (
                    <div className="world-stars">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} style={{ opacity: i < starRating ? 1 : 0.2 }}>⭐</span>
                      ))}
                    </div>
                  )}
                  {unlocked ? (
                    <button className="btn-play-world" onClick={() => startWorld(w.id)} style={{ fontSize: '16px', fontWeight: '800', padding: '8px 20px' }}>
                      {score !== null ? 'REPLAY' : 'PLAY'}
                    </button>
                  ) : (
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-locked-gray)' }}>LOCKED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn-nav-outline" onClick={onResetWorlds} style={{ marginTop: '20px', padding: '12px 28px', fontSize: '17px', fontWeight: '800', alignSelf: 'center' }}>
          🔄 Reset Worlds
        </button>

        {worldScores[0] !== null && (
          <button className="btn-gold" onClick={onNext} style={{ marginTop: '12px', padding: '14px 36px', fontSize: '18px', fontWeight: '900', alignSelf: 'center' }}>
            Go to Reflection ➔
          </button>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEWPORT: QUIZ HUD & GAME SCREEN
  // -------------------------------------------------------------
  if (!currentQ && activeWorld !== null) return null;

  const totalQ = questions.length || 6;
  const pct = Math.round(((currQIdx + 1) / totalQ) * 100);

  return (
    <div style={{ width: '100%' }}>
      <div className="quiz-header">
        <div className="world-pill-badge">
          <div className="world-badge-dot" style={{ backgroundColor: WORLDS[activeWorld].color }} />
          <span>{WORLDS[activeWorld].name}</span>
        </div>

        <div className="stats-hud">
          <span className="hud-item hud-item--xp">⭐ {xp} XP</span>
          <span className="hud-item hud-item--lives">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>❤️</span>
            ))}
          </span>
          <span className="hud-item hud-item--streak">🔥 {streak}x Streak</span>
        </div>

        <div className="progress-row">
          <span>Question {currQIdx + 1}/{totalQ}</span>
          <span>{pct}%</span>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1', padding: '12px 14px 20px 14px', position: 'relative', overflow: 'hidden', animation: 'slideInUp 0.4s ease-out' }}>
        {lives === 0 ? (
          <div className="results-box" style={{ justifyContent: 'center', height: '100%', marginTop: '40px' }}>
            <span style={{ fontSize: '64px' }}>😢</span>
            <h3 className="results-title" style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-alert-coral)', margin: '10px 0' }}>Out of Hearts!</h3>
            <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-muted-lavender)' }}>
              Robo says: "No worries! Let's practice some more. Try again to master this world!"
            </p>
            <div className="results-actions" style={{ gap: '10px', marginTop: '16px' }}>
              <button className="btn-gold" onClick={handleRetryWorld} style={{ fontSize: '15px', fontWeight: '800', padding: '10px 24px' }}>🔄 Retry World</button>
              <button className="btn-nav-outline" onClick={() => setActiveWorld(null)} style={{ fontSize: '15px', fontWeight: '800', padding: '10px 24px' }}>🚪 Quit World</button>
            </div>
          </div>
        ) : (
          <div className="quiz-question-box">
            <h2 className="quiz-question-text" style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', lineHeight: '1.35', margin: '0 0 16px 0', textAlign: 'center' }}>{currentQ.questionText}</h2>

            <div className="quiz-visual-area" style={{ margin: '14px 0' }}>
              {renderVisual()}
            </div>

            <div className="answer-grid" style={{ gap: '10px' }}>
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrectAns = opt === currentQ.correctAnswer;
                let btnClass = "answer-btn";
                if (answeredState) {
                  if (isCorrectAns) btnClass += " answer-btn--correct";
                  else if (isSelected) btnClass += " answer-btn--incorrect";
                }
                return (
                  <button
                    key={i}
                    className={btnClass}
                    onClick={(e) => handleAnswerSubmit(opt, e)}
                    disabled={answeredState !== null}
                    style={{ fontSize: '21px', fontWeight: '900', padding: '16px 24px' }}
                  >
                    {opt.toString()}
                  </button>
                );
              })}
            </div>

            {answeredState !== null && (
              <div style={{
                textAlign: 'center',
                fontSize: '22px',
                fontWeight: '900',
                margin: '14px 0 6px 0',
                padding: '12px 20px',
                borderRadius: '12px',
                background: answeredState === 'correct' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `2px solid ${answeredState === 'correct' ? 'var(--accent-success-green)' : 'var(--accent-alert-coral)'}`,
                color: answeredState === 'correct' ? 'var(--accent-success-green)' : 'var(--accent-alert-coral)',
                animation: answeredState === 'correct' ? 'bounceIn 0.5s ease' : 'shake 0.4s ease'
              }}>
                {answeredState === 'correct' ? "✅ That's correct!" : "❌ Not quite!"}
              </div>
            )}

            {floatScore && (
              <div className="float-up-score" style={{ left: `${floatScore.x}px`, top: `${floatScore.y}px` }}>
                {floatScore.val}
              </div>
            )}

            {hintsUsed > 0 && (
              <div className="hint-drawer" style={{ padding: '12px 16px', fontSize: '16px', fontWeight: '700' }}>
                <span className="hint-drawer-icon">💡</span>
                <span className="hint-drawer-text">{hintsUsed === 1 ? currentQ.hint1 : currentQ.hint2}</span>
              </div>
            )}

            {showExplanation && (
              <div className="explanation-panel" style={{ padding: '12px 16px', marginTop: '16px' }}>
                <div className="explanation-heading" style={{ fontSize: '17px', fontWeight: '900' }}>💡 Correct Answer Explanation:</div>
                <div className="explanation-text" style={{ fontSize: '15px', fontWeight: '700', marginTop: '6px' }}>{currentQ.explanation}</div>
              </div>
            )}

            <div className="quiz-actions" style={{ marginTop: '18px' }}>
              <button
                className="btn-hint"
                onClick={handleUseHint}
                disabled={hintsUsed >= 2 || answeredState === 'correct'}
                style={{ opacity: answeredState === 'correct' ? 0.3 : 1, fontSize: '17px', fontWeight: '800', padding: '12px 24px' }}
              >
                💡 {hintsUsed === 0 ? 'Use Hint' : hintsUsed === 1 ? 'Show Another Hint' : 'No More Hints'}
              </button>

              {answeredState !== null && (
                <button className="btn-gold" onClick={handleNextQuestion} style={{ padding: '12px 32px', fontSize: '17px', fontWeight: '800' }}>
                  {currQIdx < questions.length - 1 ? 'Next Question ➔' : 'Complete World ➔'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
