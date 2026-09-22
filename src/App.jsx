import React, { useState, useEffect } from 'react';
import IntroScreen from './components/IntroScreen';
import WonderPhase from './components/phases/WonderPhase';
import StoryPhase from './components/phases/StoryPhase';
import SimulatePhase from './components/phases/SimulatePhase';
import PlayPhase from './components/phases/PlayPhase';
import ReflectPhase from './components/phases/ReflectPhase';
import { useAudio } from './hooks/useAudio';
import { speakText, stopNarration, unlockAudio } from './utils/audio';

const STORAGE_KEY = 'intellia_sharing_ratio_session_v1';

export default function App() {
  // Navigation Phase State Machine
  // 'intro' | 'wonder' | 'story' | 'simulate' | 'play' | 'reflect'
  const [phase, setPhase] = useState('intro');
  const [phaseComplete, setPhaseComplete] = useState({
    wonder: false,
    story: false,
    simulate: false,
    play: false,
    reflect: false
  });

  // Gamification & Session State
  const [xp, setXp] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [worldScores, setWorldScores] = useState(Array(10).fill(null));
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState({}); // { 0: ['Q1_001, ...]
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  // Settings
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Hook for Web Audio SFX
  const { playSound } = useAudio(audioEnabled);

  // Custom speak function using our audio system
  const speak = (text, options = {}) => {
    if (!audioEnabled) return;
    const style = options.style || 'statement';
    speakText(text, style);
  };

  // 1. Restore session from localStorage on load (but NOT the phase!)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verify session is less than 24h old
        if (Date.now() - parsed.timestamp < 86400000) {
          // Don't restore phase - always start at intro
          if (parsed.phaseComplete) setPhaseComplete(parsed.phaseComplete);
          if (parsed.xp) setXp(parsed.xp);
          if (parsed.totalStars) setTotalStars(parsed.totalStars);
          if (parsed.streak) setStreak(parsed.streak);
          if (parsed.maxStreak) setMaxStreak(parsed.maxStreak);
          if (parsed.worldScores) setWorldScores(parsed.worldScores);
          if (parsed.unlockedBadges) setUnlockedBadges(parsed.unlockedBadges);
          if (parsed.usedQuestionIds) setUsedQuestionIds(parsed.usedQuestionIds);
          if (parsed.correctAnswers) setCorrectAnswers(parsed.correctAnswers);
          if (parsed.audioEnabled !== undefined) setAudioEnabled(parsed.audioEnabled);
        }
      }
    } catch (e) {
      console.warn("Restoring local session failed: ", e);
    }
  }, []);

  // 2. Persist session state to localStorage on state modifications
  useEffect(() => {
    if (phase === 'intro') return; // don't write clean state
    try {
      const stateObj = {
        phase,
        phaseComplete,
        xp,
        totalStars,
        streak,
        maxStreak,
        worldScores,
        unlockedBadges,
        usedQuestionIds,
        correctAnswers,
        audioEnabled,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj));
    } catch (e) {
      console.warn("Saving local session failed: ", e);
    }
  }, [phase, phaseComplete, xp, totalStars, streak, maxStreak, worldScores, unlockedBadges, usedQuestionIds, correctAnswers, audioEnabled]);

  // Helper to unlock badges dynamically
  const unlockBadge = (badgeId) => {
    setUnlockedBadges(prev => {
      if (prev.includes(badgeId)) return prev;
      playSound('badge');
      return [...prev, badgeId];
    });
  };

  // Reset entire lesson
  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPhase('intro');
    setPhaseComplete({
      wonder: false,
      story: false,
      simulate: false,
      play: false,
      reflect: false
    });
    setXp(0);
    setTotalStars(0);
    setStreak(0);
    setMaxStreak(0);
    setWorldScores(Array(10).fill(null));
    setUnlockedBadges([]);
    setUsedQuestionIds({});
    setCorrectAnswers(0);
    playSound('shapeReveal');
  };

  // Advance Phase Progressively
  const handlePhaseComplete = (currentPhase, nextPhase) => {
    setPhaseComplete(prev => ({ ...prev, [currentPhase]: true }));
    setPhase(nextPhase);
    
    // Unlock basic progress badges
    if (currentPhase === 'wonder') {
      unlockBadge('ratio_explorer');
    } else if (currentPhase === 'story') {
      unlockBadge('parts_spotter');
    } else if (currentPhase === 'simulate') {
      unlockBadge('sharing_pro');
    }
  };

  // Stop narration when phase changes
  useEffect(() => {
    stopNarration();
  }, [phase]);

  // Navigation Click Handler
  const handleNavClick = (targetPhase) => {
    if (targetPhase !== phase) {
      stopNarration();
      setPhase(targetPhase);
      playSound('explore');
    }
  };

  // -------------------------------------------------------------
  // RENDER SELECTION LAYOUT
  // -------------------------------------------------------------
  const renderPhaseComponent = () => {
    switch (phase) {
      case 'wonder':
        return (
          <WonderPhase 
            onNext={() => handlePhaseComplete('wonder', 'story')} 
            playSound={playSound}
            speak={speak}
          />
        );
      case 'story':
        return (
          <StoryPhase 
            onNext={() => handlePhaseComplete('story', 'simulate')} 
            speak={speak}
          />
        );
      case 'simulate':
        return (
          <SimulatePhase 
            onNext={() => handlePhaseComplete('simulate', 'play')} 
            playSound={playSound}
            speak={speak}
          />
        );
      case 'play':
        return (
          <PlayPhase 
            onNext={() => handlePhaseComplete('play', 'reflect')} 
            playSound={playSound}
            speak={speak}
            xp={xp}
            setXp={setXp}
            totalStars={totalStars}
            setTotalStars={setTotalStars}
            streak={streak}
            setStreak={setStreak}
            maxStreak={maxStreak}
            setMaxStreak={setMaxStreak}
            worldScores={worldScores}
            setWorldScores={setWorldScores}
            unlockedBadges={unlockedBadges}
            unlockBadge={unlockBadge}
            usedQuestionIds={usedQuestionIds}
            setUsedQuestionIds={setUsedQuestionIds}
            onResetWorlds={() => {
              setWorldScores(Array(10).fill(null));
              setUsedQuestionIds({});
              playSound('explore');
            }}
            setCorrectAnswers={setCorrectAnswers}
          />
        );
      case 'reflect':
        return (
          <ReflectPhase 
            xp={xp}
            totalStars={totalStars}
            unlockedBadges={unlockedBadges}
            worldScores={worldScores}
            correctAnswers={correctAnswers}
            onReset={handleReset}
            playSound={playSound}
            speak={speak}
            unlockBadge={unlockBadge}
          />
        );
      case 'intro':
      default:
        return (
          <IntroScreen 
            onBegin={() => { unlockAudio(); setPhase('wonder'); }} 
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
            playSound={playSound}
            speak={speak}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Header bar with Home button, Nav Bar, and Mute Button beside nav bar (except intro) */}
      {phase !== 'intro' && (
        <div className="top-header-row">
          <button className="home-btn" onClick={() => setPhase('intro')}>
            🏠 Home
          </button>

          <div className="top-nav">
            {[
              { id: 'wonder', num: '01', emoji: '🔍', label: 'Wonder' },
              { id: 'story', num: '02', emoji: '📖', label: 'Story' },
              { id: 'simulate', num: '03', emoji: '✏️', label: 'Simulate' },
              { id: 'play', num: '04', emoji: '🎮', label: 'Practice' },
              { id: 'reflect', num: '05', emoji: '📋', label: 'Reflect' }
            ].map((item) => {
              const isActive = phase === item.id;
              const isCompleted = phaseComplete[item.id];
              
              let segmentClass = "nav-segment";
              if (isActive) segmentClass += " nav-segment--active";
              if (isCompleted) segmentClass += " nav-segment--completed";

              return (
                <div 
                  key={item.id} 
                  className={segmentClass}
                  onClick={() => handleNavClick(item.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>{item.num}</span>
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                  {isCompleted && <span>✓</span>}
                </div>
              );
            })}
          </div>

          <button 
            className="audio-fab-inline" 
            onClick={() => {
              if (audioEnabled) {
                stopNarration();
                playSound('toggleOff');
                setAudioEnabled(false);
              } else {
                unlockAudio();
                setAudioEnabled(true);
                setTimeout(() => {
                  playSound('toggleOn');
                  speak("Sound on!");
                }, 50);
              }
            }}
            title={audioEnabled ? "Mute sound & speech narration" : "Enable sound & speech narration"}
            aria-label="Toggle Sound"
          >
            {audioEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      )}

      {/* Main active view */}
      {renderPhaseComponent()}
    </div>
  );
}
