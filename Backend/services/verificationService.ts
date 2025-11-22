import { googleAuth } from './googleServices.js';
import { VerificationResult } from '../types.js';

export const verifyCompleteSetup = async (): Promise<VerificationResult[]> => {
  const results: VerificationResult[] = [];

  // 1. Check environment variables
  results.push(checkEnvironmentVariables());

  // 2. Check Google Cloud credentials
  try {
    const credentialsResult = await checkGoogleCredentials();
    results.push(credentialsResult);
  } catch (error) {
    results.push({
      service: 'Google Cloud Credentials',
      status: 'error',
      message: 'Failed to load Google Cloud credentials',
      details: error.message
    });
  }

  // 3. Check Google Drive access
  try {
    const driveResult = await checkDriveAccess();
    results.push(driveResult);
  } catch (error) {
    results.push({
      service: 'Google Drive',
      status: 'error',
      message: 'Failed to connect to Google Drive',
      details: error.message
    });
  }

  // 4. Check all three calendars
  try {
    const calendarResults = await checkAllCalendars();
    results.push(...calendarResults);
  } catch (error) {
    results.push({
      service: 'Google Calendar',
      status: 'error',
      message: 'Failed to connect to Google Calendar',
      details: error.message
    });
  }

  // 5. Check OpenRouter API
  try {
    const ocrResult = await checkOpenRouterAPI();
    results.push(ocrResult);
  } catch (error) {
    results.push({
      service: 'OpenRouter OCR',
      status: 'error',
      message: 'Failed to connect to OpenRouter API',
      details: error.message
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
    'OPENROUTER_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length === 0) {
    return {
      service: 'Environment Variables',
      status: 'success',
      message: 'All required environment variables are set',
      details: `Checked: ${required.join(', ')}`
    };
  }

  return {
    service: 'Environment Variables',
    status: 'error',
    message: `Missing environment variables: ${missing.join(', ')}`,
    details: 'Check your .env.local file'
  };
}

async function checkGoogleCredentials(): Promise<VerificationResult> {
  try {
    const authClient = await googleAuth.getAuthClient();
    
    return {
      service: 'Google Cloud Credentials',
      status: 'success',
      message: 'Service account authentication successful',
      details: 'Credentials loaded and authenticated'
    };
  } catch (error) {
    return {
      service: 'Google Cloud Credentials',
      status: 'error',
      message: 'Failed to authenticate with Google Cloud',
      details: error.message
    };
  }
}

async function checkDriveAccess(): Promise<VerificationResult> {
  try {
    const drive = await googleAuth.getDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      return {
        service: 'Google Drive',
        status: 'error',
        message: 'GOOGLE_DRIVE_FOLDER_ID not set'
      };
    }

    // Try to access the folder
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id,name,permissions'
    });

    if (response.data) {
      // Test actual file upload
      try {
        const testFileName = `test-upload-${Date.now()}.txt`;
        const testContent = 'HDCN Poster Processor test file - please delete';
        
        const { Readable } = await import('stream');
        const stream = new Readable();
        stream.push(testContent);
        stream.push(null);
        
        const uploadResponse = await drive.files.create({
          requestBody: {
            name: testFileName,
            parents: [folderId]
          },
          media: {
            mimeType: 'text/plain',
            body: stream
          },
          fields: 'id,webViewLink'
        });

        // Clean up test file
        if (uploadResponse.data.id) {
          await drive.files.delete({ fileId: uploadResponse.data.id });
        }

        return {
          service: 'Google Drive',
          status: 'success',
          message: `Full upload access confirmed: ${response.data.name}`,
          details: `Can read, write, and delete files. Folder ID: ${folderId}`
        };
      } catch (uploadError) {
        console.error('Drive upload test error:', uploadError);
        
        if (uploadError.message?.includes('storage quota') || uploadError.code === 'RESOURCE_EXHAUSTED') {
          return {
            service: 'Google Drive',
            status: 'warning',
            message: 'Drive folder accessible but storage quota exceeded',
            details: 'Service account has no storage space. Consider using shared drive or different approach.'
          };
        }
        
        if (uploadError.code === 403) {
          return {
            service: 'Google Drive',
            status: 'warning',
            message: `Read-only access to folder: ${response.data.name}`,
            details: 'Share the folder with service account email with Editor permissions'
          };
        }
        
        return {
          service: 'Google Drive',
          status: 'error',
          message: 'Upload test failed',
          details: uploadError.message
        };
      }
    }
  } catch (error) {
    if (error.code === 404) {
      return {
        service: 'Google Drive',
        status: 'error',
        message: 'Drive folder not found',
        details: `Check if folder ID ${process.env.GOOGLE_DRIVE_FOLDER_ID} is correct and shared with service account`
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

    return {
      service: 'Google Drive',
      status: 'error',
      message: 'Drive access error',
      details: error.message
    };
  }
}

async function checkAllCalendars(): Promise<VerificationResult[]> {
  const calendar = await googleAuth.getCalendarClient();
  const results: VerificationResult[] = [];

  const calendars = [
    { name: 'Nationaal', id: process.env.GOOGLE_CALENDAR_NATIONAAL },
    { name: 'Internationaal', id: process.env.GOOGLE_CALENDAR_INTERNATIONAAL },
    { name: 'Beurzen en Diversen', id: process.env.GOOGLE_CALENDAR_BEURZEN }
  ];

  for (const cal of calendars) {
    if (!cal.id) {
      results.push({
        service: `Calendar (${cal.name})`,
        status: 'error',
        message: `Calendar ID not set for ${cal.name}`,
        details: 'Check your .env.local file'
      });
      continue;
    }

    try {
      // Check if we can read the calendar
      const response = await calendar.calendars.get({
        calendarId: cal.id
      });

      if (response.data) {
        // Try to create a test event to check write permissions
        try {
          const testEvent = {
            summary: 'HDCN Test Event - Please Delete',
            description: 'This is a test event created by HDCN Poster Processor to verify permissions. Please delete.',
            start: {
              dateTime: new Date().toISOString(),
              timeZone: 'Europe/Amsterdam'
            },
            end: {
              dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // +1 hour
              timeZone: 'Europe/Amsterdam'
            }
          };

          const createResponse = await calendar.events.insert({
            calendarId: cal.id,
            requestBody: testEvent
          });

          // If successful, delete the test event
          if (createResponse.data.id) {
            await calendar.events.delete({
              calendarId: cal.id,
              eventId: createResponse.data.id
            });
          }

          results.push({
            service: `Calendar (${cal.name})`,
            status: 'success',
            message: `Full access confirmed: ${response.data.summary}`,
            details: `Can read and write events. Calendar ID: ${cal.id}`
          });
        } catch (writeError) {
          if (writeError.code === 403) {
            results.push({
              service: `Calendar (${cal.name})`,
              status: 'warning',
              message: `Read-only access to calendar: ${response.data.summary}`,
              details: 'Share the calendar with your service account email with Editor permissions'
            });
          } else {
            results.push({
              service: `Calendar (${cal.name})`,
              status: 'error',
              message: `Write permission test failed: ${cal.name}`,
              details: writeError.message
            });
          }
        }
      }
    } catch (error) {
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
          details: 'Share the calendar with your service account email'
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

async function checkOpenRouterAPI(): Promise<VerificationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return {
      service: 'OpenRouter OCR',
      status: 'error',
      message: 'OpenRouter API key not set',
      details: 'Set OPENROUTER_API_KEY in .env.local'
    };
  }

  try {
    // Test with a simple text-only request
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'HDCN Poster Processor'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: 'Say "API test successful"'
          }
        ],
        max_tokens: 10
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        service: 'OpenRouter OCR',
        status: 'success',
        message: 'OpenRouter API connection successful',
        details: 'API key valid and model accessible'
      };
    } else {
      const errorText = await response.text();
      return {
        service: 'OpenRouter OCR',
        status: 'error',
        message: `OpenRouter API error: ${response.status}`,
        details: errorText
      };
    }
  } catch (error) {
    return {
      service: 'OpenRouter OCR',
      status: 'error',
      message: 'Failed to connect to OpenRouter API',
      details: error.message
    };
  }
}