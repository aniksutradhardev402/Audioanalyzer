import { useEffect, useRef, useState } from 'react';

export interface AudioAnalysisData {
  timeDomain: Float32Array | null;
  frequency: Uint8Array | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

const mediaAnalyzers = new WeakMap<
  HTMLMediaElement,
  { ctx: AudioContext; analyser: AnalyserNode }
>();

export function useAudioAnalyzer(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  options?: { fftSize?: number },
): AudioAnalysisData {
  const [data, setData] = useState<AudioAnalysisData>({
    timeDomain: null,
    frequency: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
  });

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    let mounted = true;

    let ctx: AudioContext;
    let analyser: AnalyserNode;

    const existing = mediaAnalyzers.get(el);
    if (existing) {
      ctx = existing.ctx;
      analyser = existing.analyser;
    } else {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      ctx = new AudioCtx();

      analyser = ctx.createAnalyser();
      analyser.fftSize = options?.fftSize ?? 2048;

      const source = ctx.createMediaElementSource(el);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      mediaAnalyzers.set(el, { ctx, analyser });
    }

    const handlePlay = async () => {
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch (e) {
          console.error('AudioContext resume failed', e);
        }
      }
    };

    el.addEventListener('play', handlePlay);

    const freqArray = new Uint8Array(analyser.frequencyBinCount);
    const timeArray = new Float32Array(analyser.fftSize);

    const tick = () => {
      if (!mounted || !audioRef.current) return;

      analyser.getByteFrequencyData(freqArray);
      analyser.getFloatTimeDomainData(timeArray);

      const audio = audioRef.current;

      setData({
        timeDomain: timeArray.slice(0),
        frequency: freqArray.slice(0),
        currentTime: audio.currentTime || 0,
        duration: audio.duration || 0,
        isPlaying: !audio.paused,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mounted = false;
      el.removeEventListener('play', handlePlay);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [audioRef, options?.fftSize]);

  return data;
}
