import { googleAuth } from './googleAuth';
import { EventDetails, BackendResult, CalendarType } from '../types';

export const uploadToDrive = async (file: File): Promise<BackendResult> => {
  try {
    const drive = await googleAuth.getDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      throw new Error('Google Drive folder ID not configured');
    }

    const fileMetadata = {
      name: file.name,
      parents: [folderId]
    };

    const media = {
      mimeType: file.type,
      body: file.stream()
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink'
    });

    return {
      success: true,
      message: 'File uploaded to Google Drive successfully',
      url: response.data.webViewLink || ''
    };
  } catch (error) {
    console.error('Drive upload error:', error);
    return {
      success: false,
      message: 'Failed to upload to Google Drive'
    };
  }
};

export const createCalendarEvent = async (event: EventDetails): Promise<BackendResult> => {
  try {
    const calendar = await googleAuth.getCalendarClient();
    
    const calendarIds = {
      [CalendarType.NATIONAAL]: process.env.GOOGLE_CALENDAR_NATIONAAL,
      [CalendarType.INTERNATIONAAL]: process.env.GOOGLE_CALENDAR_INTERNATIONAAL,
      [CalendarType.BEURZEN]: process.env.GOOGLE_CALENDAR_BEURZEN
    };

    const calendarId = calendarIds[event.calendar];
    if (!calendarId) {
      throw new Error(`Calendar ID not configured for ${event.calendar}`);
    }

    const calendarEvent = {
      summary: event.title,
      location: event.location,
      description: event.description,
      start: {
        dateTime: event.startDate,
        timeZone: 'Europe/Amsterdam'
      },
      end: {
        dateTime: event.endDate,
        timeZone: 'Europe/Amsterdam'
      }
    };

    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: calendarEvent
    });

    return {
      success: true,
      message: `Event created in ${event.calendar} calendar`,
      url: response.data.htmlLink || ''
    };
  } catch (error) {
    console.error('Calendar creation error:', error);
    return {
      success: false,
      message: 'Failed to create calendar event'
    };
  }
};

export const checkDuplicatePoster = async (fileName: string): Promise<BackendResult> => {
  try {
    const drive = await googleAuth.getDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const response = await drive.files.list({
      q: `name='${fileName}' and parents in '${folderId}'`,
      fields: 'files(id, name)'
    });

    const isDuplicate = response.data.files && response.data.files.length > 0;

    return {
      success: !isDuplicate,
      message: isDuplicate ? 'Duplicate poster found' : 'No duplicates found'
    };
  } catch (error) {
    console.error('Duplicate check error:', error);
    return {
      success: true,
      message: 'Could not check for duplicates, proceeding anyway'
    };
  }
};