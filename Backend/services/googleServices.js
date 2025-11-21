import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

class GoogleAuthService {
  constructor() {
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
    }
  }

  async getAuthClient() {
    // Refresh access token if needed
    try {
      const { token } = await this.oauth2Client.getAccessToken();
      console.log('Access token obtained:', token ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.error('Token refresh error:', error.message);
      throw error;
    }
    return this.oauth2Client;
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

export const uploadToDrive = async (file, fileName) => {
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

    const { Readable } = await import('stream');
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

export const createCalendarEvent = async (eventData, driveUrl) => {
  try {
    const calendar = await googleAuth.getCalendarClient();
    
    const calendarIds = {
      'Nationaal': process.env.GOOGLE_CALENDAR_NATIONAAL,
      'Internationaal': process.env.GOOGLE_CALENDAR_INTERNATIONAAL,
      'Beurzen en Diversen': process.env.GOOGLE_CALENDAR_BEURZEN
    };

    const calendarId = calendarIds[eventData.calendar];
    if (!calendarId) {
      throw new Error(`Calendar ID not configured for ${eventData.calendar}`);
    }

    const calendarEvent = {
      summary: eventData.title,
      location: eventData.location,
      description: eventData.description + (driveUrl ? `\n\n<a href="${driveUrl}">View Poster</a>` : ''),
      start: {
        dateTime: new Date(eventData.startDate).toISOString(),
        timeZone: 'Europe/Amsterdam'
      },
      end: {
        dateTime: new Date(eventData.endDate).toISOString(),
        timeZone: 'Europe/Amsterdam'
      }
    };

    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: calendarEvent
    });

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

export const uploadToGooglePhotos = async (file, eventDate) => {
  try {
    const authClient = await googleAuth.getAuthClient();
    
    // First upload the photo
    const uploadResponse = await fetch('https://photoslibrary.googleapis.com/v1/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${(await authClient.getAccessToken()).token}`,
        'Content-Type': 'application/octet-stream',
        'X-Goog-Upload-File-Name': file.originalname,
        'X-Goog-Upload-Protocol': 'raw'
      },
      body: file.buffer
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }
    
    const uploadToken = await uploadResponse.text();
    
    // Create media item in library
    const createResponse = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${(await authClient.getAccessToken()).token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newMediaItems: [{
          description: `HDCN Event Poster - ${eventDate}`,
          simpleMediaItem: {
            uploadToken: uploadToken
          }
        }]
      })
    });
    
    const createResult = await createResponse.json();
    console.log('Google Photos create response:', JSON.stringify(createResult, null, 2));
    
    if (createResult.newMediaItemResults?.[0]?.status?.message === 'Success') {
      const mediaItem = createResult.newMediaItemResults[0].mediaItem;
      
      // Add to album if album ID is configured
      const albumId = process.env.GOOGLE_PHOTOS_ALBUM_ID;
      if (albumId) {
        await fetch('https://photoslibrary.googleapis.com/v1/albums/' + albumId + ':batchAddMediaItems', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await authClient.getAccessToken()).token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mediaItemIds: [mediaItem.id]
          })
        });
      }
      
      return {
        success: true,
        message: 'Photo uploaded to Google Photos and added to album',
        url: mediaItem.productUrl
      };
    } else {
      const errorMsg = createResult.newMediaItemResults?.[0]?.status?.message || 'Unknown error';
      throw new Error(`Failed to create media item: ${errorMsg}`);
    }
    
  } catch (error) {
    console.error('Photo upload error:', error);
    return {
      success: false,
      message: 'Failed to upload to Google Photos: ' + error.message
    };
  }
};

export const checkDuplicatePoster = async (fileName) => {
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