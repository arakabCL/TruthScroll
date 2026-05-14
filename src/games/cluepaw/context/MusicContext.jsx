import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const MELODY = [523.25, 659.25, 783.99, 659.25, 880.00, 1046.50, 880.00, 783.99, 659.25, 783.99, 880.00, 783.99, 1046.50, 783.99, 659.25, 523.25];
const BASS = [130.81, 130.81, 174.61, 174.61, 196.00, 196.00, 130.81, 130.81];
const CHORDS = [
  [261.63, 329.63, 392.00], // C major
  [349.23, 440.00, 523.25], // F major
  [392.00, 493.88, 587.33], // G major
  [261.63, 329.63, 392.00], // C major
];

const MusicContext = createContext(null);

function getStoredDefault() {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem('clupaw-music-enabled') !== '0';
}

export function MusicProvider({ children }) {
  const [enabled, setEnabled] = useState(getStoredDefault);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const gainRef = useRef(null);
  const timerRef = useRef(null);
  const stepRef = useRef(0);

  const makeTone = (ctx, frequency, start, duration, type = 'sine', volume = 0.08, destination = gainRef.current) => {
    if (!frequency || !destination) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'triangle' ? 1800 : 900, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    osc.start(start);
    osc.stop(start + duration + 0.04);
  };

  const makeNoise = (ctx, start, duration = 0.045, volume = 0.018) => {
    if (!gainRef.current) return;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4200, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(gainRef.current);
    source.start(start);
    source.stop(start + duration);
  };

  const scheduleBeat = () => {
    const ctx = audioRef.current;
    if (!ctx) return;
    const step = stepRef.current;
    const now = ctx.currentTime + 0.02;
    const phraseStep = step % MELODY.length;
    const barStep = step % 8;

    if (barStep === 0 || barStep === 4) {
      const chord = CHORDS[Math.floor(step / 8) % CHORDS.length];
      chord.forEach((note, index) => makeTone(ctx, note, now + index * 0.015, 0.9, 'sine', 0.018));
    }

    if (barStep % 2 === 0) {
      makeTone(ctx, BASS[Math.floor(step / 2) % BASS.length], now, 0.42, 'sine', 0.052);
    }

    makeTone(ctx, MELODY[phraseStep], now + (barStep % 2 ? 0.04 : 0), 0.3, 'triangle', 0.042);

    if (barStep === 3 || barStep === 7) {
      makeTone(ctx, (MELODY[(phraseStep + 4) % MELODY.length] || 392) * 1.5, now + 0.09, 0.18, 'sine', 0.017);
    }

    makeNoise(ctx, now + (barStep % 2 ? 0.08 : 0), 0.035, barStep === 0 ? 0.012 : 0.008);
    stepRef.current = step + 1;
  };

  const stopMusic = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    if (gainRef.current && audioRef.current) {
      gainRef.current.gain.exponentialRampToValueAtTime(0.001, audioRef.current.currentTime + 0.12);
    }
    if (audioRef.current) {
      window.setTimeout(() => {
        audioRef.current?.close?.();
        audioRef.current = null;
        gainRef.current = null;
      }, 160);
    }
    setPlaying(false);
  };

  const startMusic = () => {
    if (audioRef.current) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const compressor = ctx.createDynamicsCompressor();
    const master = ctx.createGain();
    compressor.threshold.setValueAtTime(-28, ctx.currentTime);
    compressor.knee.setValueAtTime(18, ctx.currentTime);
    compressor.ratio.setValueAtTime(4, ctx.currentTime);
    master.gain.setValueAtTime(0.001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.25);
    master.connect(compressor);
    compressor.connect(ctx.destination);
    audioRef.current = ctx;
    gainRef.current = master;
    stepRef.current = 0;
    scheduleBeat();
    timerRef.current = window.setInterval(scheduleBeat, 300);
    setPlaying(true);
  };

  const setMusicEnabled = (nextEnabled) => {
    window.localStorage.setItem('clupaw-music-enabled', nextEnabled ? '1' : '0');
    setEnabled(nextEnabled);
    if (nextEnabled) startMusic();
    else stopMusic();
  };

  useEffect(() => {
    if (!enabled || playing) return undefined;
    const startAfterGesture = () => startMusic();
    window.addEventListener('pointerdown', startAfterGesture, { once: true });
    window.addEventListener('keydown', startAfterGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startAfterGesture);
      window.removeEventListener('keydown', startAfterGesture);
    };
  }, [enabled, playing]);

  useEffect(() => () => stopMusic(), []);

  const value = useMemo(() => ({
    enabled,
    playing,
    toggleMusic: () => setMusicEnabled(!enabled),
    setMusicEnabled,
  }), [enabled, playing]);

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used inside MusicProvider');
  }
  return context;
}
