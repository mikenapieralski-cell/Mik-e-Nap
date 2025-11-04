
import React, { useState, useCallback } from 'react';
import { SrtFile, TranslationStatus, SrtBlock } from './types';
import { FileUpload } from './components/FileUpload';
import { FileQueue } from './components/FileQueue';
import { translateText } from './services/geminiService';
import { parseSrt, reconstructSrt } from './services/srtParser';
import { LogoIcon } from './components/Icons';

const SEPARATOR = '|||---|||';

function App() {
  const [files, setFiles] = useState<SrtFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesAdded = useCallback((acceptedFiles: File[]) => {
    const newSrtFiles: Promise<SrtFile>[] = acceptedFiles
      .filter(file => file.name.endsWith('.srt'))
      .map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
              resolve({
                id: Date.now() + Math.random(),
                file,
                status: TranslationStatus.QUEUED,
                originalContent: content,
                translatedContent: null,
                errorMessage: null,
              });
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = () => reject(new Error("Error reading file"));
          reader.readAsText(file);
        });
      });

    Promise.all(newSrtFiles).then(newFiles => {
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    });
  }, []);

  const updateFileStatus = (id: number, status: TranslationStatus, data?: Partial<SrtFile>) => {
    setFiles(prevFiles =>
      prevFiles.map(f => (f.id === id ? { ...f, status, ...data } : f))
    );
  };

  const processFile = async (srtFile: SrtFile) => {
    updateFileStatus(srtFile.id, TranslationStatus.TRANSLATING);
    try {
      const blocks = parseSrt(srtFile.originalContent);
      const textsToTranslate = blocks.map(block => block.text);

      // If there's no text to translate, mark as complete and skip API call
      if (textsToTranslate.every(t => !t.trim())) {
        updateFileStatus(srtFile.id, TranslationStatus.COMPLETED, { translatedContent: srtFile.originalContent });
        return;
      }
      
      const joinedText = textsToTranslate.join(SEPARATOR);
      const translatedJoinedText = await translateText(joinedText);
      const translatedTexts = translatedJoinedText.split(SEPARATOR);

      if (translatedTexts.length !== textsToTranslate.length) {
        throw new Error(`Translation alignment failed. Expected ${textsToTranslate.length} snippets, received ${translatedTexts.length}.`);
      }
      
      const translatedBlocks: SrtBlock[] = blocks.map((block, index) => ({
        ...block,
        text: translatedTexts[index] || '',
      }));
      
      const translatedContent = reconstructSrt(translatedBlocks);
      updateFileStatus(srtFile.id, TranslationStatus.COMPLETED, { translatedContent });
    } catch (error) {
      console.error(`Error processing file ${srtFile.file.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      updateFileStatus(srtFile.id, TranslationStatus.ERROR, { errorMessage });
    }
  };

  const handleStartProcessing = async () => {
    setIsProcessing(true);
    const queuedFiles = files.filter(f => f.status === TranslationStatus.QUEUED);
    for (const file of queuedFiles) {
      await processFile(file);
    }
    setIsProcessing(false);
  };

  const handleRemoveFile = (id: number) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== id));
  };
  
  const handleClearAll = () => {
    setFiles([]);
  };

  const hasQueuedFiles = files.some(f => f.status === TranslationStatus.QUEUED);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <LogoIcon className="w-12 h-12 text-teal-400" />
            <h1 className="text-4xl font-bold tracking-tight text-white">SRT Bulk Translator</h1>
          </div>
          <p className="text-lg text-gray-400">
            Translate your <code className="bg-gray-700 text-teal-300 px-2 py-1 rounded">.srt</code> files to Spanish in seconds.
          </p>
        </header>

        <main>
          <FileUpload onFilesAdded={handleFilesAdded} />
          
          {files.length > 0 && (
            <div className="mt-8">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-semibold">Translation Queue</h2>
                 <button
                    onClick={handleClearAll}
                    className="px-4 py-2 text-sm font-medium text-red-400 bg-red-900/50 rounded-lg hover:bg-red-900 transition-colors duration-200"
                  >
                    Clear All
                  </button>
               </div>
              <FileQueue files={files} onRemoveFile={handleRemoveFile} />
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleStartProcessing}
                  disabled={!hasQueuedFiles || isProcessing}
                  className="w-full sm:w-auto px-8 py-3 text-lg font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Start Translation'}
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by Google Gemini. Built with React & Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
