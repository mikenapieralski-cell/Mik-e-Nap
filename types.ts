
export enum TranslationStatus {
  QUEUED = 'Queued',
  TRANSLATING = 'Translating',
  COMPLETED = 'Completed',
  ERROR = 'Error',
}

export interface SrtFile {
  id: number;
  file: File;
  status: TranslationStatus;
  originalContent: string;
  translatedContent: string | null;
  errorMessage: string | null;
}

export interface SrtBlock {
  index: number;
  time: string;
  text: string;
}
