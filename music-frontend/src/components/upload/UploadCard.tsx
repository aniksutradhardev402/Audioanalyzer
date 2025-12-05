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
    <div className="rounded-3xl border-2 app-accent bg-app-elevated p-8 transition-all duration-300  cursor-pointer hover:shadow-2xl hover:border-gray-400">
      {/* The className now conditionally adds a background and border color when a file is being dragged over */}
      <div
        className={`flex flex-col  items-center justify-center rounded-3xl  border-2 border-dashed px-4 py-8 transition-all duration-300 transform  hover:hover:scale-102 bg-app-accent-soft ${
          isDragging ? ' border-double bg-app-accent-soft scale-102' : 'border-current'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-app-accent-soft text-app-accent">
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
        <h1 className="text-xl font-semibold text-app">
          Upload Your Music
        </h1>
        <p className="mt-2 text-sm app-text-muted">
          Drag &amp; drop your audio file here
        </p>
        <p className="mt-1 text-xs app-text-muted">
          Supported formats: MP3, WAV, FLAC, OGG
        </p>

        <div className="mt-6 flex items-center gap-3 text-xs app-text-muted">
          <span className="h-px w-12 bg-app-accent" />
          OR
          <span className="h-px w-12 bg-app-accent" />
        </div>

        <div className="mt-5">
          <Button
            type="button"
            disabled={isBusy}
            className="transition-all duration-300 hover:shadow-xl bg-app-accent"
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

        {statusMessage && <p className="mt-4 text-xs text-app-accent">{statusMessage}</p>}

        {error && (
          <p className="mt-3 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
