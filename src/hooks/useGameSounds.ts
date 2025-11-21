import { useCallback, useRef, useEffect } from 'react';

// Sound synthesis using Web Audio API to avoid CORS and asset dependency issues
export const useGameSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on mount (lazy init usually happens on first user interaction)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }
  }, []);

  const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  };

  const playSound = useCallback((type: 'click' | 'complete' | 'win' | 'join' | 'start') => {
    if (!audioContextRef.current) {
      // Try to init again if missing (e.g. if created before user interaction allowed)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }

    // Resume context if suspended (browser policy)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    switch (type) {
      case 'click':
        // Short high tick
        playTone(800, 'sine', 0.1, 0, 0.1);
        break;
      
      case 'complete':
        // "Ding" - High pleasant sine
        playTone(1200, 'sine', 0.4, 0, 0.2);
        playTone(1800, 'sine', 0.4, 0.05, 0.1); // Harmonic
        break;
      
      case 'join':
        // "Bloop" - Sweep up
        if (audioContextRef.current) {
          const ctx = audioContextRef.current;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(400, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        }
        break;

      case 'win':
        // Major Arpeggio (C-E-G-C)
        playTone(523.25, 'triangle', 0.2, 0, 0.2);   // C5
        playTone(659.25, 'triangle', 0.2, 0.1, 0.2); // E5
        playTone(783.99, 'triangle', 0.2, 0.2, 0.2); // G5
        playTone(1046.50, 'triangle', 0.6, 0.3, 0.2); // C6
        break;

      case 'start':
        // Two tone start
        playTone(600, 'square', 0.1, 0, 0.1);
        playTone(1000, 'square', 0.2, 0.1, 0.1);
        break;
    }
  }, []);

  return { playSound };
};
