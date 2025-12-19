export interface EventDetails {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  calendar: CalendarType;
  rawText?: string; // All extracted text from poster
}

export enum CalendarType {
  NATIONAAL = 'Nationaal',
  INTERNATIONAAL = 'Internationaal',
  BEURZEN = 'Beurzen en Diversen'
}

export interface BackendResult {
  success: boolean;
  message?: string;
  error?: string;
  results?: any;
  url?: string;
}

export interface UploadResult {
  success: boolean;
  message: string;
  url?: string;
  id?: string;
}

export interface VerificationResult {
  service: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}