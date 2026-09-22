import React from 'react';
import Mascot from './shared/Mascot';
import { stopNarration, unlockAudio } from '../utils/audio';

export default function IntroScreen({ onBegin, audioEnabled = true, setAudioEnabled, playSound, speak }) {
  const introNudge = "Ready to split sweets, money and paint fairly using ratios? Let's go! 🍬";

  const handleAudioToggle = () => {
    if (audioEnabled) {
      stopNarration();
      if (playSound) playSound('toggleOff');
      if (setAudioEnabled) setAudioEnabled(false);
    } else {
      unlockAudio();
      if (setAudioEnabled) setAudioEnabled(true);
      setTimeout(() => {
        if (playSound) playSound('toggleOn');
        if (speak) speak("Sound on!");
      }, 50);
    }
  };

  const handleReplayIntro = () => {
    if (speak) {
      speak(introNudge);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1', padding: '16px 18px', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', animation: 'slideInUp 0.4s ease-out' }}>
      {/* Audio Mute/Unmute Button (Top Right) */}
      <button
        className="audio-fab-intro"
        onClick={handleAudioToggle}
        title={audioEnabled ? "Mute sound & speech narration" : "Enable sound & speech narration"}
        aria-label="Toggle Sound"
      >
        {audioEnabled ? '🔊' : '🔇'}
      </button>

      {/* Subtle Faded Background Ratio Symbols */}
      <div style={{ position: 'absolute', top: '15px', left: '20px', fontSize: '72px', fontWeight: '900', color: 'rgba(255, 255, 255, 0.03)', fontFamily: "'Fredoka', sans-serif", pointerEvents: 'none', userSelect: 'none', transform: 'rotate(-15deg)' }}>2:3</div>
      <div style={{ position: 'absolute', top: '120px', right: '30px', fontSize: '64px', fontWeight: '900', color: 'rgba(255, 255, 255, 0.03)', fontFamily: "'Fredoka', sans-serif", pointerEvents: 'none', userSelect: 'none', transform: 'rotate(20deg)' }}>4:5</div>
      <div style={{ position: 'absolute', bottom: '180px', left: '25px', fontSize: '64px', fontWeight: '900', color: 'rgba(255, 255, 255, 0.03)', fontFamily: "'Fredoka', sans-serif", pointerEvents: 'none', userSelect: 'none', transform: 'rotate(10deg)' }}>1:2:3</div>
      <div style={{ position: 'absolute', bottom: '80px', right: '40px', fontSize: '72px', fontWeight: '900', color: 'rgba(255, 255, 255, 0.03)', fontFamily: "'Fredoka', sans-serif", pointerEvents: 'none', userSelect: 'none', transform: 'rotate(-25deg)' }}>:</div>
      <div style={{ position: 'absolute', top: '240px', left: '10px', fontSize: '56px', color: 'rgba(255, 255, 255, 0.02)', pointerEvents: 'none', userSelect: 'none' }}>🍬</div>

      {/* MOE Badge */}
      <div style={{
        alignSelf: 'center',
        background: 'rgba(27, 16, 60, 0.8)',
        border: '1.5px solid rgba(255, 190, 26, 0.3)',
        borderRadius: '999px',
        padding: '8px 20px',
        fontSize: '13px',
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '0.5px',
        zIndex: 2
      }}>
        <span>✨</span>
        <span>MOE Curriculum <span style={{ color: 'var(--accent-gold)', fontWeight: '800' }}>• Grade 7 • Ratio</span></span>
      </div>

      {/* Main Title */}
      <h1 style={{
        fontFamily: "'Fredoka', sans-serif",
        fontSize: '46px',
        lineHeight: '1.1',
        marginBottom: '20px',
        fontWeight: '700',
        letterSpacing: '-0.5px',
        zIndex: 2
      }}>
        <span className="title-white" style={{ display: 'block', marginBottom: '6px' }}>Sharing in a</span>
        <span className="title-gold" style={{ display: 'block' }}>Ratio!</span>
      </h1>

      {/* Mascot speaking pill */}
      <div style={{ zIndex: 2, width: '100%', maxWidth: '680px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Mascot mood="curious" bubble={
          <span style={{ fontSize: '16px', fontWeight: '800', lineHeight: '1.5' }}>
            {introNudge}
          </span>
        } />
      </div>

      {/* Subtitle */}
      <p style={{
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        fontSize: '17px',
        fontWeight: '600',
        lineHeight: '1.6',
        maxWidth: '680px',
        marginBottom: '24px',
        opacity: 0.9,
        zIndex: 2
      }}>
        Join Robo and master sharing any amount in a given ratio — add the parts, find the value of one part, multiply out every share, and check it all adds back up!
      </p>

      {/* Learning Journey Roadmap Box */}
      <div style={{
        backgroundColor: 'rgba(20, 10, 45, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '24px 28px',
        width: '100%',
        maxWidth: '740px',
        textAlign: 'center',
        marginBottom: '28px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: 2
      }}>
        <div style={{
          fontSize: '14.5px',
          fontWeight: '800',
          color: 'var(--accent-gold)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          marginBottom: '24px',
          fontFamily: "'Inter', sans-serif"
        }}>
          YOUR LEARNING JOURNEY
        </div>
        
        {/* Row 1: Wonder -> Story -> Simulate */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '18px'
        }}>
          {/* Wonder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '3px solid #3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1b103c',
              fontSize: '25px'
            }}>
              🔍
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', fontFamily: "'Inter', sans-serif" }}>Wonder</div>
              <div style={{ color: 'var(--text-muted-lavender)', fontSize: '12px', fontWeight: '600' }}>Spark curiosity</div>
            </div>
          </div>
          
          <span style={{ color: 'var(--text-muted-lavender)', fontSize: '18px', fontWeight: 'bold' }}>→</span>
          
          {/* Story */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '3px solid #ffbe1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1b103c',
              fontSize: '25px'
            }}>
              📖
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', fontFamily: "'Inter', sans-serif" }}>Story</div>
              <div style={{ color: 'var(--text-muted-lavender)', fontSize: '12px', fontWeight: '600' }}>Hear the tale</div>
            </div>
          </div>
          
          <span style={{ color: 'var(--text-muted-lavender)', fontSize: '18px', fontWeight: 'bold' }}>→</span>
          
          {/* Simulate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '3px solid #34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1b103c',
              fontSize: '25px'
            }}>
              ✏️
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', fontFamily: "'Inter', sans-serif" }}>Simulate</div>
              <div style={{ color: 'var(--text-muted-lavender)', fontSize: '12px', fontWeight: '600' }}>Explore & discover</div>
            </div>
          </div>
        </div>
        
        {/* Row 2: Practice -> Reflect */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          {/* Practice (Play) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '3px solid #a78bfa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1b103c',
              fontSize: '25px'
            }}>
              🎮
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', fontFamily: "'Inter', sans-serif" }}>Practice</div>
              <div style={{ color: 'var(--text-muted-lavender)', fontSize: '12px', fontWeight: '600' }}>Test your skills</div>
            </div>
          </div>
          
          <span style={{ color: 'var(--text-muted-lavender)', fontSize: '18px', fontWeight: 'bold' }}>→</span>
          
          {/* Reflect */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '3px solid #ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1b103c',
              fontSize: '25px'
            }}>
              🏆
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', fontFamily: "'Inter', sans-serif" }}>Reflect</div>
              <div style={{ color: 'var(--text-muted-lavender)', fontSize: '12px', fontWeight: '600' }}>What did you learn?</div>
            </div>
          </div>
        </div>
      </div>

      {/* Glowing CTA Button */}
      <button className="btn-gold" onClick={() => { unlockAudio(); if (playSound) playSound('explore'); onBegin(); }} style={{
        marginBottom: '28px',
        padding: '16px 48px',
        fontSize: '20px',
        fontWeight: '800',
        fontFamily: "'Fredoka', sans-serif",
        boxShadow: '0 0 25px rgba(255, 190, 26, 0.8), 0 8px 24px rgba(0, 0, 0, 0.4)',
        borderRadius: '999px',
        border: '2px solid #ffffff',
        zIndex: 2
      }}>
        🚀 Begin Your Journey!
      </button>

      {/* Feature Grid (3 equal columns layout) */}
      <div style={{
        display: 'flex',
        gap: '16px',
        width: '100%',
        maxWidth: '740px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        zIndex: 2,
        marginTop: '-4px'
      }}>
        {/* Card 1 */}
        <div style={{
          flex: '1 1 200px',
          backgroundColor: 'rgba(27, 16, 60, 0.4)',
          border: '1.5px solid rgba(74, 52, 133, 0.6)',
          borderRadius: '16px',
          padding: '22px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{ fontSize: '38px', marginBottom: '4px' }}>🍬</span>
          <span style={{
            fontSize: '16.5px',
            fontWeight: '700',
            color: '#ffffff',
            fontFamily: "'Fredoka', sans-serif"
          }}>
            4 Key Steps
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-muted-lavender)',
            fontFamily: "'Inter', sans-serif"
          }}>
            Parts to shares
          </span>
        </div>

        {/* Card 2 */}
        <div style={{
          flex: '1 1 200px',
          backgroundColor: 'rgba(27, 16, 60, 0.4)',
          border: '1.5px solid rgba(74, 52, 133, 0.6)',
          borderRadius: '16px',
          padding: '22px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{ fontSize: '38px', marginBottom: '4px' }}>🧩</span>
          <span style={{
            fontSize: '16.5px',
            fontWeight: '700',
            color: '#ffffff',
            fontFamily: "'Fredoka', sans-serif"
          }}>
            4 Simulations
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-muted-lavender)',
            fontFamily: "'Inter', sans-serif"
          }}>
            Interactive labs
          </span>
        </div>

        {/* Card 3 */}
        <div style={{
          flex: '1 1 200px',
          backgroundColor: 'rgba(27, 16, 60, 0.4)',
          border: '1.5px solid rgba(74, 52, 133, 0.6)',
          borderRadius: '16px',
          padding: '22px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{ fontSize: '38px', marginBottom: '4px' }}>🏆</span>
          <span style={{
            fontSize: '16.5px',
            fontWeight: '700',
            color: '#ffffff',
            fontFamily: "'Fredoka', sans-serif"
          }}>
            10 Game Worlds
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-muted-lavender)',
            fontFamily: "'Inter', sans-serif"
          }}>
            Quizzes & rewards
          </span>
        </div>
      </div>
    </div>
  );
}
