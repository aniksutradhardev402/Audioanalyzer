import React from 'react';
import { AnalysisResult, StemName } from '../../types/analysis';
import { getFileUrl } from '../../lib/api';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  stems: AnalysisResult['stems'];
  songId: string;
  lyricsDocPath?: string | null;
}

const stemOrder: (StemName | 'master')[] = ['master', 'vocals', 'drums', 'bass', 'guitar', 'piano', 'other'];

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, stems, songId, lyricsDocPath }) => {
  if (!isOpen) {
    return null;
  }

  const handleDownload = (stemPath: string, stemName: string) => {
    const baseUrl = getFileUrl(stemPath);
    if (!baseUrl) return;
    // Append query param to trigger "Save As" dialog via backend header
    const url = `${baseUrl}?download=true`;

    const link = document.createElement('a');
    link.href = url;
    const extension = stemPath.split('.').pop() || 'wav';
    link.setAttribute('download', `${songId}-${stemName}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-app-elevated border border-app rounded-2xl shadow-2xl w-full max-w-md p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-app">Download Files</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-app-accent/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-app-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {lyricsDocPath && (
            <div className="flex items-center justify-between p-3 bg-app-accent/10 rounded-lg border border-app-accent">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-app-accent" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2-2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="font-medium capitalize text-app">Lyrics & Chords Sheet</span>
              </div>
              <button
                onClick={() => handleDownload(lyricsDocPath, 'lyrics-chords')}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-app-accent text-app rounded-md hover:bg-app-accent/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download (.docx)
              </button>
            </div>
          )}
          {stemOrder.map(stemName => {
            const stemPath = stems[stemName];
            if (!stemPath) return null;
            return (
              <div key={stemName} className="flex items-center justify-between p-3 bg-app rounded-lg border border-app">
                <span className="font-medium capitalize text-app">{stemName}</span>
                <button
                  onClick={() => handleDownload(stemPath, stemName)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-app-accent text-app rounded-md hover:bg-app-accent/80 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-app-muted mt-4 text-center">Files are provided in .wav and .docx format.</p>
      </div>
    </div>
  );
};