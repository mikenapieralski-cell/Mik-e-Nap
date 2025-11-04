
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
     if (files && files.length > 0) {
      onFilesAdded(files);
    }
  };
  
  const openFileDialog = () => {
    document.getElementById('file-input')?.click();
  };

  const dragClasses = isDragging ? 'border-teal-400 bg-gray-700/50' : 'border-gray-600 hover:border-teal-500';

  return (
    <div 
      className={`relative w-full p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${dragClasses}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onClick={openFileDialog}
    >
      <input 
        id="file-input"
        type="file" 
        multiple 
        accept=".srt" 
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <UploadIcon className="w-12 h-12 text-gray-500" />
        <p className="text-xl font-semibold text-gray-300">
          Drag & drop your .srt files here
        </p>
        <p className="text-gray-400">or <span className="font-bold text-teal-400">click to browse</span></p>
      </div>
    </div>
  );
};
