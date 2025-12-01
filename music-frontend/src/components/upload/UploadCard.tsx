import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { Button } from '../common/Button';

interface Props {
  onFileSelected: (file: File) => void;
  isBusy: boolean;
  statusMessage?: string;
}

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];

export function UploadCard({ onFileSelected, isBusy, statusMessage }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|flac|ogg)$/i)) {
      setError('Unsupported format. Use MP3, WAV, FLAC, or OGG.');
      return;
    }
    setError(null);
    onFileSelected(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl shadow-slate-950/80">
      <div
        className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-8 py-16 transition ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-slate-700 bg-slate-900/60'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-cyan-400">
          {/* Upload icon */}
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.7"
            fill="none"
          >
            <path d="M12 3v12" />
            <path d="M7 8l5-5 5 5" />
            <path d="M5 21h14" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-50">
          Upload Your Music
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Drag &amp; drop your audio file here
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Supported formats: MP3, WAV, FLAC, OGG
        </p>

        <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
          <span className="h-px w-12 bg-slate-700" />
          OR
          <span className="h-px w-12 bg-slate-700" />
        </div>

        <div className="mt-5">
          <Button
            type="button"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            {isBusy ? 'Uploading…' : 'Choose File'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.flac,.ogg,audio/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {statusMessage && (
          <p className="mt-4 text-xs text-cyan-300">{statusMessage}</p>
        )}

        {error && (
          <p className="mt-3 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
