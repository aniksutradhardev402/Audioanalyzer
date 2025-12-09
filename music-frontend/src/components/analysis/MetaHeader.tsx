import { TrackMetadata } from '../../types/analysis';

interface Props {
  metadata: TrackMetadata;
}

const StatCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) => (
  <div className="flex flex-col rounded-2xl border border-app bg-app-elevated/60 px-4 py-3 text-xs shadow-md">
    <span className="text-[11px] uppercase tracking-wide app-text-muted">
      {label}
    </span>
    <span className="mt-1 text-sm font-semibold text-app">{value}</span>
    {helper && <span className="mt-1 text-[11px] app-text-muted">{helper}</span>}
  </div>
);

export function MetadataHeader({ metadata }: Props) {
  const durationMinutes = Math.floor(metadata.duration_seconds / 60);
  const durationSeconds = Math.round(metadata.duration_seconds % 60)
    .toString()
    .padStart(2, '0');

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="BPM" value={metadata.bpm.toString()} />
      <StatCard label="Key" value={metadata.estimated_key} />
      <StatCard
        label="Duration"
        value={`${durationMinutes}:${durationSeconds}`}
      />
      <StatCard
        label="Loudness"
        value={metadata.loudness_rms.toFixed(3)}
        helper="RMS (relative)"
      />
      <StatCard
        label="Brightness"
        value={metadata.brightness_spectral_centroid.toFixed(0)}
        helper="Spectral centroid"
      />
    </section>
  );
}
