import { EventDetails, BackendResult } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export const extractEventDetailsFromBackend = async (file: File): Promise<EventDetails> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${BACKEND_URL}/extract`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`OCR failed: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'OCR extraction failed');
  }

  return result.data;
};

export const checkDuplicatePosterBackend = async (fileName: string): Promise<BackendResult> => {
  const response = await fetch(`${BACKEND_URL}/check-duplicate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fileName })
  });

  if (!response.ok) {
    throw new Error(`Duplicate check failed: ${response.statusText}`);
  }

  return await response.json();
};

export const processEventBackend = async (file: File, eventData: EventDetails): Promise<BackendResult> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('eventData', JSON.stringify(eventData));

  const response = await fetch(`${BACKEND_URL}/process-event`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Event processing failed: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Event processing failed');
  }

  return {
    success: true,
    message: 'Event processed successfully',
    results: result.results
  };
};