import React from 'react';
import { SrtFile, TranslationStatus } from '../types';
import { DownloadIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon, SpinnerIcon } from './Icons';

interface FileQueueItemProps {
  srtFile: SrtFile;
  onRemove: (id: number) => void;
}

const StatusIndicator: React.FC<{ status: TranslationStatus }> = ({ status }) => {
  switch (status) {
    case TranslationStatus.QUEUED:
      return <div className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-blue-400" /><span className="text-blue-400">Queued</span></div>;
    case TranslationStatus.TRANSLATING:
      return <div className="flex items-center gap-2"><SpinnerIcon className="w-5 h-5 text-yellow-400 animate-spin" /><span className="text-yellow-400">Translating...</span></div>;
    case TranslationStatus.COMPLETED:
      return <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-400" /><span className="text-green-400">Completed</span></div>;
    case TranslationStatus.ERROR:
      return <div className="flex items-center gap-2"><XCircleIcon className="w-5 h-5 text-red-400" /><span className="text-red-400">Error</span></div>;
    default:
      return null;
  }
};

export const FileQueueItem: React.FC<FileQueueItemProps> = ({ srtFile, onRemove }) => {
  
  const handleDownload = () => {
    if (srtFile.translatedContent) {
      const blob = new Blob([srtFile.translatedContent], { type: 'text/srt;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const originalName = srtFile.file.name.replace('.srt', '');
      link.download = `${originalName}_sp.srt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  
  const isActionable = srtFile.status === TranslationStatus.QUEUED || srtFile.status === TranslationStatus.ERROR;

  return (
    <div className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:bg-gray-700/50">
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate" title={srtFile.file.name}>{srtFile.file.name}</p>
        <p className="text-sm text-gray-400">{(srtFile.file.size / 1024).toFixed(2)} KB</p>
        {srtFile.status === TranslationStatus.ERROR && srtFile.errorMessage && (
          <p className="text-xs text-red-400 mt-1 truncate" title={srtFile.errorMessage}>{srtFile.errorMessage}</p>
        )}
      </div>
      <div className="flex-shrink-0 w-40 text-center">
        <StatusIndicator status={srtFile.status} />
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        {srtFile.status === TranslationStatus.COMPLETED && (
          <button
            onClick={handleDownload}
            className="p-2 text-teal-400 hover:text-white hover:bg-teal-600 rounded-full transition-colors duration-200"
            title="Download Translated File"
          >
            <DownloadIcon className="w-6 h-6" />
          </button>
        )}
        {isActionable && (
           <button
             onClick={() => onRemove(srtFile.id)}
             className="p-2 text-red-400 hover:text-white hover:bg-red-600 rounded-full transition-colors duration-200"
             title="Remove File"
           >
             <TrashIcon className="w-6 h-6" />
           </button>
        )}
      </div>
    </div>
  );
};