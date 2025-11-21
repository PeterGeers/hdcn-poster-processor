import { googleAuth } from './googleAuth';

interface VerificationResult {
  service: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export const verifyGoogleSetup = async (): Promise<VerificationResult[]> => {
  const results: VerificationResult[] = [];

  // Check environment variables
  results.push(checkEnvironmentVariables());

  // Check Google Drive access
  try {
    const driveResult = await checkDriveAccess();
    results.push(driveResult);
  } catch (error) {
    results.push({
      service: 'Google Drive',
      status: 'error',
      message: 'Failed to connect to Google Drive',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Check Google Calendar access
  try {
    const calendarResults = await checkCalendarAccess();
    results.push(...calendarResults);
  } catch (error) {
    results.push({
      service: 'Google Calendar',
      status: 'error',
      message: 'Failed to connect to Google Calendar',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return results;
};

function checkEnvironmentVariables(): VerificationResult {
  const required = [
    'GOOGLE_APPLICATION_CREDENTIALS',
    'GOOGLE_PROJECT_ID',
    'GOOGLE_DRIVE_FOLDER_ID',
    'GOOGLE_CALENDAR_NATIONAAL',
    'GOOGLE_CALENDAR_INTERNATIONAAL',
    'GOOGLE_CALENDAR_BEURZEN',
    'GEMINI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length === 0) {
    return {
      service: 'Environment Variables',
      status: 'success',
      message: 'All required environment variables are set'
    };
  }

  return {
    service: 'Environment Variables',
    status: 'error',
    message: `Missing environment variables: ${missing.join(', ')}`,
    details: 'Check your .env.local file'
  };
}

async function checkDriveAccess(): Promise<VerificationResult> {
  const drive = await googleAuth.getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    return {
      service: 'Google Drive',
      status: 'error',
      message: 'GOOGLE_DRIVE_FOLDER_ID not set'
    };
  }

  try {
    // Try to access the folder
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id,name,permissions'
    });

    if (response.data) {
      return {
        service: 'Google Drive',
        status: 'success',
        message: `Successfully accessed folder: ${response.data.name}`,
        details: `Folder ID: ${folderId}`
      };
    }
  } catch (error: any) {
    if (error.code === 404) {
      return {
        service: 'Google Drive',
        status: 'error',
        message: 'Drive folder not found',
        details: `Check if folder ID ${folderId} is correct and shared with service account`
      };
    }
    
    if (error.code === 403) {
      return {
        service: 'Google Drive',
        status: 'error',
        message: 'Permission denied to access Drive folder',
        details: 'Share the folder with your service account email with Editor permissions'
      };
    }

    throw error;
  }

  return {
    service: 'Google Drive',
    status: 'error',
    message: 'Unknown Drive access error'
  };
}

async function checkCalendarAccess(): Promise<VerificationResult[]> {
  const calendar = await googleAuth.getCalendarClient();
  const results: VerificationResult[] = [];

  const calendars = [
    { name: 'Nationaal', id: process.env.GOOGLE_CALENDAR_NATIONAAL },
    { name: 'Internationaal', id: process.env.GOOGLE_CALENDAR_INTERNATIONAAL },
    { name: 'Beurzen', id: process.env.GOOGLE_CALENDAR_BEURZEN }
  ];

  for (const cal of calendars) {
    if (!cal.id) {
      results.push({
        service: `Calendar (${cal.name})`,
        status: 'error',
        message: `Calendar ID not set for ${cal.name}`
      });
      continue;
    }

    try {
      const response = await calendar.calendars.get({
        calendarId: cal.id
      });

      if (response.data) {
        results.push({
          service: `Calendar (${cal.name})`,
          status: 'success',
          message: `Successfully accessed calendar: ${response.data.summary}`,
          details: `Calendar ID: ${cal.id}`
        });
      }
    } catch (error: any) {
      if (error.code === 404) {
        results.push({
          service: `Calendar (${cal.name})`,
          status: 'error',
          message: `Calendar not found: ${cal.name}`,
          details: `Check if calendar ID ${cal.id} is correct`
        });
      } else if (error.code === 403) {
        results.push({
          service: `Calendar (${cal.name})`,
          status: 'error',
          message: `Permission denied for calendar: ${cal.name}`,
          details: 'Share the calendar with your service account email with Editor permissions'
        });
      } else {
        results.push({
          service: `Calendar (${cal.name})`,
          status: 'error',
          message: `Error accessing calendar: ${cal.name}`,
          details: error.message
        });
      }
    }
  }

  return results;
}