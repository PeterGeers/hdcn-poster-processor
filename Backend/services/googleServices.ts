import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { EventDetails, UploadResult } from '../types.js';
import { Readable } from 'stream';

class GoogleAuthService {
  private oauth2Client: OAuth2Client | null = null;

  private initializeClient() {
    if (!this.oauth2Client) {
      console.log('Initializing GoogleAuthService with credentials:', {
        clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing',
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN?.substring(0, 20) + '...'
      });
      
      // Use environment variables for OAuth2 credentials
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3001/auth/callback'
      );
      
      // Set refresh token for webmaster@h-dcn.nl
      if (process.env.GOOGLE_REFRESH_TOKEN) {
        this.oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });
        console.log('OAuth2 client configured with refresh token');
      } else {
        console.warn('No refresh token found in environment variables');
      }
    }
    return this.oauth2Client;
  }

  async getAuthClient(): Promise<OAuth2Client> {
    const client = this.initializeClient();
    
    // Only try to refresh if we have a refresh token
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      try {
        const { token } = await client.getAccessToken();
        console.log('Access token obtained:', token ? 'SUCCESS' : 'FAILED');
      } catch (error: any) {
        console.warn('Token refresh failed:', error.message);
        // Continue anyway - might work for some operations
      }
    } else {
      console.warn('No refresh token available - some operations may fail');
    }
    return client;
  }

  async getDriveClient() {
    const authClient = await this.getAuthClient();
    return google.drive({ version: 'v3', auth: authClient });
  }

  async getCalendarClient() {
    const authClient = await this.getAuthClient();
    return google.calendar({ version: 'v3', auth: authClient });
  }
}

const googleAuth = new GoogleAuthService();

export { googleAuth };

export const uploadToDrive = async (file: Express.Multer.File, fileName?: string): Promise<UploadResult> => {
  try {
    const drive = await googleAuth.getDriveClient();
    
    // Create a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uniqueFileName = `${timestamp}_${fileName || file.originalname}`;

    // Upload to user's Drive folder
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    let fileMetadata = {
      name: uniqueFileName
    };
    
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    // Use imported Readable
    const stream = new Readable();
    stream.push(file.buffer);
    stream.push(null);
    
    const media = {
      mimeType: file.mimetype,
      body: stream
    };

    console.log('Uploading to user Drive:', fileMetadata);
    
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink,webContentLink,parents'
    });

    console.log('Drive upload response:', response.data);

    // Make the file publicly viewable
    try {
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
      console.log('File permissions set to public');
    } catch (permError) {
      console.warn('Could not set public permissions:', permError.message);
    }

    return {
      success: true,
      message: 'File uploaded to Google Drive successfully',
      url: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
      fileId: response.data.id
    };
  } catch (error) {
    console.error('Drive upload error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    });
    
    return {
      success: false,
      message: 'Failed to upload to Google Drive: ' + error.message,
      details: error.code || error.status || 'Unknown error'
    };
  }
};

export const createCalendarEvent = async (eventData: EventDetails, driveUrl?: string): Promise<UploadResult> => {
  try {
    const calendar = await googleAuth.getCalendarClient();
    
    const calendarIds: Record<string, string | undefined> = {
      'Nationaal': process.env.GOOGLE_CALENDAR_NATIONAAL,
      'Internationaal': process.env.GOOGLE_CALENDAR_INTERNATIONAAL,
      'Beurzen en Diversen': process.env.GOOGLE_CALENDAR_BEURZEN
    };

    const calendarId = calendarIds[eventData.calendar];
    if (!calendarId) {
      throw new Error(`Calendar ID not configured for ${eventData.calendar}`);
    }

    const startDate = new Date(eventData.startDate);
    let endDate = new Date(eventData.endDate);
    
    // Ensure end date is after start date
    if (endDate <= startDate) {
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Next day
    }
    
    // Check if it's an all-day event (no specific time)
    const isAllDay = startDate.getHours() === 0 && startDate.getMinutes() === 0;
    
    // For multi-day events, ensure proper end time
    const isMultiDay = (endDate.getTime() - startDate.getTime()) > (24 * 60 * 60 * 1000);
    
    if (isMultiDay && !isAllDay) {
      // Set end time to end of last day (23:59)
      endDate.setHours(23, 59, 0, 0);
    }
    
    // Clean description without template parameters
    const cleanDescription = eventData.description.replace(/\{[^}]*\}/g, '').trim();
    
    const calendarEvent = {
      summary: eventData.title,
      location: eventData.location,
      description: cleanDescription + (driveUrl ? `\n\n<a href="${driveUrl}">Poster</a>` : ''),
      start: isAllDay ? {
        date: startDate.toISOString().split('T')[0]
      } : {
        dateTime: startDate.toISOString(),
        timeZone: 'Europe/Amsterdam'
      },
      end: isAllDay ? {
        date: new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      } : {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Amsterdam'
      }
    };

    console.log('Creating calendar event with data:', JSON.stringify(calendarEvent, null, 2));
    
    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: calendarEvent
    });
    
    console.log('Calendar event created successfully:', response.data.id);

    return {
      success: true,
      message: `Event created in ${eventData.calendar} calendar`,
      url: response.data.htmlLink || ''
    };
  } catch (error) {
    console.error('Calendar creation error:', error);
    return {
      success: false,
      message: 'Failed to create calendar event: ' + error.message
    };
  }
};

export const uploadToGooglePhotos = async (file: Express.Multer.File, eventDate: string): Promise<UploadResult> => {
  try {
    console.log('📸 Starting Google Photos upload...');
    const authClient = await googleAuth.getAuthClient();
    
    console.log('🔑 Getting access token...');
    const { token } = await authClient.getAccessToken();
    
    console.log('📤 Uploading image to Google Photos...');
    const uploadResponse = await fetch('https://photoslibrary.googleapis.com/v1/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'X-Goog-Upload-File-Name': file.originalname,
        'X-Goog-Upload-Protocol': 'raw'
      },
      body: file.buffer
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`);
    }
    
    const uploadToken = await uploadResponse.text();
    console.log('✅ Image uploaded, creating media item...');
    
    // Create media item with event date in description
    const createResponse = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newMediaItems: [{
          description: `HDCN Event Poster - Event Date: ${eventDate}`,
          simpleMediaItem: {
            uploadToken: uploadToken,
            fileName: file.originalname
          }
        }]
      })
    });
    
    const createResult = await createResponse.json();
    console.log('📋 Google Photos create response:', JSON.stringify(createResult, null, 2));
    
    if (createResult.newMediaItemResults?.[0]?.status?.message === 'Success') {
      const mediaItem = createResult.newMediaItemResults[0].mediaItem;
      console.log('✅ Media item created:', mediaItem.id);
      
      // Try to add to album if album ID is configured (optional)
      const albumId = process.env.GOOGLE_PHOTOS_ALBUM_ID;
      if (albumId) {
        console.log('📁 Attempting to add to album...');
        try {
          const albumResponse = await fetch(`https://photoslibrary.googleapis.com/v1/albums/${albumId}:batchAddMediaItems`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mediaItemIds: [mediaItem.id]
            })
          });
          
          if (albumResponse.ok) {
            console.log('✅ Photo added to album');
          } else {
            const albumError = await albumResponse.text();
            console.log('⚠️ Album assignment failed (photo still uploaded):', albumError);
          }
        } catch (albumError) {
          console.log('⚠️ Album assignment failed (photo still uploaded):', albumError.message);
        }
      }
      
      return {
        success: true,
        message: 'Photo uploaded to Google Photos successfully',
        url: mediaItem.productUrl
      };
    } else {
      const errorMsg = createResult.newMediaItemResults?.[0]?.status?.message || 'Unknown error';
      throw new Error(`Failed to create media item: ${errorMsg}`);
    }
    
  } catch (error: any) {
    console.error('❌ Google Photos upload error:', error);
    return {
      success: false,
      message: 'Failed to upload to Google Photos: ' + error.message
    };
  }
};

export const checkDuplicatePoster = async (fileName: string): Promise<UploadResult> => {
  try {
    const drive = await googleAuth.getDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const response = await drive.files.list({
      q: `name contains '${fileName}' and parents in '${folderId}'`,
      fields: 'files(id, name)'
    });

    const isDuplicate = response.data.files && response.data.files.length > 0;

    return {
      success: !isDuplicate,
      message: isDuplicate ? 'Similar poster found in Drive' : 'No duplicates found'
    };
  } catch (error) {
    console.error('Duplicate check error:', error);
    return {
      success: true,
      message: 'Could not check for duplicates, proceeding anyway'
    };
  }
};