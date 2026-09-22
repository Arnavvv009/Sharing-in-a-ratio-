import { useCallback, useRef } from 'react';

export function useAudio(audioEnabled) {
  const audioCtxRef = useRef(null);

  const getAudioContext = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch (e) {
      console.warn("AudioContext creation error:", e);
      return null;
    }
  }, []);

  // Web Audio API Sound Effects Generator
  const playSFX = useCallback((frequencies, durations) => {
    if (!audioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      let timeOffset = 0;
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.frequency.value = freq;
        const dur = durations[i] / 1000;
        const t0 = ctx.currentTime + timeOffset;
        
        gainNode.gain.setValueAtTime(0.15, t0);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t0 + dur - 0.005);
        
        osc.start(t0);
        osc.stop(t0 + dur);
        
        timeOffset += dur;
      });
    } catch (e) {
      console.warn("Web Audio API failed: ", e);
    }
  }, [audioEnabled, getAudioContext]);

  const playSound = useCallback((type) => {
    switch (type) {
      case 'correct':
        playSFX([587, 880, 1174], [100, 100, 200]);
        break;
      case 'wrong':
        playSFX([330, 220], [150, 250]);
        break;
      case 'badge':
        playSFX([523, 659, 784, 1047], [80, 80, 80, 250]);
        break;
      case 'streak':
        playSFX([440, 660, 880], [80, 80, 180]);
        break;
      case 'levelUp':
        playSFX([523, 659, 784, 1047, 1319], [70, 70, 70, 70, 280]);
        break;
      case 'shapeReveal':
        playSFX([400, 600, 800], [90, 90, 150]);
        break;
      case 'explore':
        playSFX([660, 880], [80, 120]);
        break;
      case 'toggleOn':
        playSFX([523, 784, 1047], [70, 70, 140]);
        break;
      case 'toggleOff':
        playSFX([784, 523], [80, 120]);
        break;
      default:
        break;
    }
  }, [playSFX]);

  return {
    playSound,
    getAudioContext
  };
}
