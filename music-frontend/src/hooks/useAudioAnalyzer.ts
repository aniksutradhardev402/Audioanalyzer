import { useEffect, useRef, useState } from 'react';

export interface AnalyzerState {
  timeDomain: Float32Array | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

// ✅ One analyser bundle per AUDIO ELEMENT
const ANALYSER_MAP = new WeakMap<
  HTMLMediaElement,
  {
    ctx: AudioContext;
    analyser: AnalyserNode;
  }
>();

export function useAudioAnalyzer(
  audioRef: React.RefObject<HTMLAudioElement | null>,
): AnalyzerState {
  const rafRef = useRef<number>(null);
  const [state, setState] = useState<AnalyzerState>({
    timeDomain: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let bundle = ANALYSER_MAP.get(audio);

    // ✅ Create ONLY ONCE per audio element
    if (!bundle) {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;

      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;

      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      bundle = { ctx, analyser };
      ANALYSER_MAP.set(audio, bundle);
    }

    const { ctx, analyser } = bundle;

    const buffer = new Float32Array(analyser.fftSize);

    const tick = () => {
      analyser.getFloatTimeDomainData(buffer);

      setState({
        timeDomain: buffer.slice(),
        currentTime: audio.currentTime || 0,
        duration: audio.duration || 0,
        isPlaying: !audio.paused,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    const onPlay = async () => {
      if (ctx.state === 'suspended') await ctx.resume();
    };

    audio.addEventListener('play', onPlay);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      audio.removeEventListener('play', onPlay);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // ❗ DO NOT close AudioContext (shared & reused)
    };
  }, [audioRef]);

  return state;
}
