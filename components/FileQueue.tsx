
import React from 'react';
import { SrtFile } from '../types';
import { FileQueueItem } from './FileQueueItem';

interface FileQueueProps {
  files: SrtFile[];
  onRemoveFile: (id: number) => void;
}

export const FileQueue: React.FC<FileQueueProps> = ({ files, onRemoveFile }) => {
  return (
    <div className="space-y-3 bg-gray-800/50 p-4 rounded-lg">
      {files.map(file => (
        <FileQueueItem key={file.id} srtFile={file} onRemove={onRemoveFile} />
      ))}
    </div>
  );
};
