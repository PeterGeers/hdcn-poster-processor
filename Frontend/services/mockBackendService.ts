import { EventDetails, BackendResult } from '../types';

/**
 * NOTE: This is a frontend-only simulation.
 * In a real production environment, these functions would communicate 
 * with a secured backend server (Node.js/Python) that holds the Service Account 
 * credentials for the Google Drive, Calendar, and Photos APIs.
 */

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate .ics file content
const generateICS = (event: EventDetails): string => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Remove - and : and ensure Z (UTC) or local time formatting
    return dateStr.replace(/[-:]/g, '').split('.')[0];
  };

  const now = formatDate(new Date().toISOString());
  const start = formatDate(event.startDate);
  const end = formatDate(event.endDate);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HDCN//Poster Processor//EN
BEGIN:VEVENT
UID:${Date.now()}@hdcn.nl
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
};

export const checkDuplicatePoster = async (fileName: string): Promise<BackendResult> => {
  await delay(800);
  // Simulate a random duplicate check (low chance for demo)
  const isDuplicate = Math.random() < 0.05;
  
  if (isDuplicate) {
    return { success: false, message: "Duplicate poster detected in 'PostersForAgenda' folder." };
  }
  return { success: true, message: "No duplicates found." };
};

export const uploadToDrive = async (file: File): Promise<BackendResult> => {
  await delay(1000);
  console.log(`[MOCK] Processing ${file.name} for Drive...`);
  
  // Create a local URL for the file so the user can download it "as if" it was on drive
  const objectUrl = URL.createObjectURL(file);

  return { 
    success: true, 
    message: "File ready for Drive (Simulation Mode).", 
    url: objectUrl,
    downloadUrl: objectUrl,
    downloadName: `[HDCN_DRIVE]_${file.name}`
  };
};

export const createCalendarEvent = async (event: EventDetails, driveUrl?: string): Promise<BackendResult> => {
  await delay(1000);
  console.log(`[MOCK] Generating Calendar Event for '${event.calendar}'...`);
  
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);

  return { 
    success: true, 
    message: `Event file generated for ${event.calendar}.`,
    downloadUrl: downloadUrl,
    downloadName: 'event.ics'
  };
};

export const uploadToGooglePhotos = async (file: File, date: string): Promise<BackendResult> => {
  await delay(1000);
  // For photos, we just reuse the file blob
  const objectUrl = URL.createObjectURL(file);

  return { 
    success: true, 
    message: "Photo processed for Album (Simulation Mode).",
    downloadUrl: objectUrl,
    downloadName: `[HDCN_PHOTOS]_${date}_${file.name}`
  };
};