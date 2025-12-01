import { useEffect, useRef, useState } from 'react';

export interface AnalyzerState {
  timeDomain: Float32Array | null;
  frequency: Uint8Array | null;
  sampleRate: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

// One analyser per audio element (no InvalidStateError)
const ANALYSERS = new WeakMap<
  HTMLMediaElement,
  { ctx: AudioContext; analyser: AnalyserNode }
>();

export function useAudioAnalyzer(
  audioRef: React.RefObject<HTMLAudioElement | null>,
): AnalyzerState {
  const rafRef = useRef<number>(null);
  const [state, setState] = useState<AnalyzerState>({
    timeDomain: null,
    frequency: null,
    sampleRate: 0,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let bundle = ANALYSERS.get(audio);

    if (!bundle) {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;

      const src = ctx.createMediaElementSource(audio);
      src.connect(analyser);
      analyser.connect(ctx.destination);

      bundle = { ctx, analyser };
      ANALYSERS.set(audio, bundle);
    }

    const { ctx, analyser } = bundle;
    const freqArr = new Uint8Array(analyser.frequencyBinCount);
    const timeArr = new Float32Array(analyser.fftSize);

    const tick = () => {
      analyser.getByteFrequencyData(freqArr);
      analyser.getFloatTimeDomainData(timeArr);

      setState({
        timeDomain: timeArr.slice(),
        frequency: freqArr.slice(),
        sampleRate: ctx.sampleRate,
        currentTime: audio.currentTime || 0,
        duration: audio.duration || 0,
        isPlaying: !audio.paused,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    const onPlay = async () => {
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }
    };

    audio.addEventListener('play', onPlay);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      audio.removeEventListener('play', onPlay);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // don't close ctx – reused
    };
  }, [audioRef]);

  return state;
}
