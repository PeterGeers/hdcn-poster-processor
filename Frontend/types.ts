export enum Step {
  VERIFY = 'Verify Setup',
  UPLOAD = 'Upload',
  REVIEW = 'Review',
  CALENDAR = 'Calendar',
  SUCCESS = 'Finish'
}

export enum CalendarType {
  NATIONAAL = 'Nationaal',
  INTERNATIONAAL = 'Internationaal',
  BEURZEN = 'Beurzen en Diversen'
}

export interface EventDetails {
  title: string;
  startDate: string; // ISO string YYYY-MM-DDTHH:mm
  endDate: string;   // ISO string YYYY-MM-DDTHH:mm
  location: string;
  description: string;
  calendar: CalendarType;
  rawText?: string; // All extracted text from poster
}

export interface ProcessingState {
  file: File | null;
  imagePreviewUrl: string | null;
  extractedData: EventDetails | null;
  isProcessing: boolean;
  error: string | null;
}

export interface BackendResult {
  success: boolean;
  message: string;
  url?: string;
  downloadUrl?: string;
  downloadName?: string;
}