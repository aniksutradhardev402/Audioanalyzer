// src/hooks/useStaticWaveform.ts
import { useEffect, useState } from 'react';

/**
 * Fetches and decodes an audio file, then builds a static waveform array
 * with values between 0 and 1.
 */
export function useStaticWaveform(
  audioUrl: string | null,
  barCount: number = 500,
) {
  const [samples, setSamples] = useState<number[] | null>(null);

  useEffect(() => {
    if (!audioUrl) {
      setSamples(null);
      return;
    }

    let cancelled = false;
    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();

    const run = async () => {
      try {
        const res = await fetch(audioUrl, { mode: 'cors' });
        const arrayBuf = await res.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);

        if (cancelled) return;

        const channel = audioBuf.getChannelData(0);
        const len = channel.length;
        const step = Math.floor(len / barCount) || 1;
        const values: number[] = [];

        for (let i = 0; i < barCount; i++) {
          const start = i * step;
          if (start >= len) break;
          let peak = 0;
          for (let j = 0; j < step && start + j < len; j++) {
            const v = Math.abs(channel[start + j]);
            if (v > peak) peak = v;
          }
          values.push(peak);
        }

        const max = values.reduce((m, v) => (v > m ? v : m), 0.0001);
        setSamples(values.map((v) => v / max));
      } catch (e) {
        console.error('Waveform decode failed', e);
        setSamples(null);
      }
    };

    run();

    return () => {
      cancelled = true;
      ctx.close().catch(() => {});
    };
  }, [audioUrl, barCount]);

  return samples;
}
