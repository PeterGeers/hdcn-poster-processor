/**
 * Google Authentication Helper
 * 
 * This file provides utilities for authenticating with Google APIs
 * using a Service Account (for backend-to-backend communication)
 * 
 * Usage in your Express/Node.js backend:
 * 
 *  const auth = await getGoogleAuth();
 *  const drive = google.drive({ version: 'v3', auth });
 */

/**
 * Initialize Google Authentication
 * 
 * For Node.js/Express backend:
 * 
 * import { google } from 'googleapis';
 * 
 * export async function getGoogleAuth() {
 *   const auth = new google.auth.GoogleAuth({
 *     credentials: {
 *       type: 'service_account',
 *       project_id: process.env.GOOGLE_PROJECT_ID,
 *       private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
 *       private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
 *       client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
 *       client_id: process.env.GOOGLE_CLIENT_ID,
 *       auth_uri: 'https://accounts.google.com/o/oauth2/auth',
 *       token_uri: 'https://oauth2.googleapis.com/token',
 *       auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
 *     },
 *     scopes: [
 *       'https://www.googleapis.com/auth/drive',
 *       'https://www.googleapis.com/auth/calendar',
 *       'https://www.googleapis.com/auth/photoslibrary',
 *     ],
 *   });
 * 
 *   return auth;
 * }
 */

/**
 * For Python/Flask backend:
 * 
 * from google.oauth2 import service_account
 * from googleapiclient.discovery import build
 * 
 * SCOPES = [
 *     'https://www.googleapis.com/auth/drive',
 *     'https://www.googleapis.com/auth/calendar',
 *     'https://www.googleapis.com/auth/photoslibrary',
 * ]
 * 
 * def get_google_auth():
 *     creds = service_account.Credentials.from_service_account_info(
 *         {
 *             'type': 'service_account',
 *             'project_id': os.getenv('GOOGLE_PROJECT_ID'),
 *             'private_key_id': os.getenv('GOOGLE_PRIVATE_KEY_ID'),
 *             'private_key': os.getenv('GOOGLE_PRIVATE_KEY'),
 *             'client_email': os.getenv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
 *             'client_id': os.getenv('GOOGLE_CLIENT_ID'),
 *             'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
 *             'token_uri': 'https://oauth2.googleapis.com/token',
 *             'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
 *         },
 *         scopes=SCOPES
 *     )
 *     return creds
 */

// ============================================
// EXAMPLE: Google Drive API Implementation
// ============================================

/**
 * Example for Node.js:
 * 
 * export async function uploadFileToDrive(auth, folderId, file) {
 *   const drive = google.drive({ version: 'v3', auth });
 *   
 *   const fileMetadata = {
 *     name: file.name,
 *     parents: [folderId],
 *   };
 * 
 *   const media = {
 *     mimeType: file.type,
 *     body: file.stream, // or file.data
 *   };
 * 
 *   const response = await drive.files.create({
 *     resource: fileMetadata,
 *     media: media,
 *     fields: 'id, webViewLink, webContentLink',
 *   });
 * 
 *   return {
 *     fileId: response.data.id,
 *     viewUrl: response.data.webViewLink,
 *     downloadUrl: response.data.webContentLink,
 *   };
 * }
 */

/**
 * Example for Python:
 * 
 * from googleapiclient.http import MediaFileUpload
 * 
 * def upload_file_to_drive(creds, folder_id, file_path, file_name):
 *     drive_service = build('drive', 'v3', credentials=creds)
 *     
 *     file_metadata = {
 *         'name': file_name,
 *         'parents': [folder_id]
 *     }
 *     
 *     media = MediaFileUpload(file_path, mimetype='image/jpeg')
 *     
 *     file = drive_service.files().create(
 *         body=file_metadata,
 *         media_body=media,
 *         fields='id, webViewLink, webContentLink'
 *     ).execute()
 *     
 *     return {
 *         'fileId': file.get('id'),
 *         'viewUrl': file.get('webViewLink'),
 *         'downloadUrl': file.get('webContentLink'),
 *     }
 */

// ============================================
// EXAMPLE: Google Calendar API Implementation
// ============================================

/**
 * Example for Node.js:
 * 
 * export async function createCalendarEvent(auth, calendarId, event) {
 *   const calendar = google.calendar({ version: 'v3', auth });
 *   
 *   const eventData = {
 *     summary: event.title,
 *     description: event.description,
 *     location: event.location,
 *     start: {
 *       dateTime: event.startDate,
 *       timeZone: 'Europe/Amsterdam',
 *     },
 *     end: {
 *       dateTime: event.endDate,
 *       timeZone: 'Europe/Amsterdam',
 *     },
 *     attachments: [
 *       {
 *         fileUrl: event.posterUrl, // URL to the poster on Drive
 *         mimeType: 'image/jpeg',
 *       }
 *     ],
 *   };
 * 
 *   const response = await calendar.events.insert({
 *     calendarId: calendarId,
 *     requestBody: eventData,
 *   });
 * 
 *   return {
 *     eventId: response.data.id,
 *     eventUrl: response.data.htmlLink,
 *   };
 * }
 */

/**
 * Example for Python:
 * 
 * def create_calendar_event(creds, calendar_id, event_data):
 *     calendar_service = build('calendar', 'v3', credentials=creds)
 *     
 *     event = {
 *         'summary': event_data['title'],
 *         'description': event_data['description'],
 *         'location': event_data['location'],
 *         'start': {
 *             'dateTime': event_data['startDate'],
 *             'timeZone': 'Europe/Amsterdam',
 *         },
 *         'end': {
 *             'dateTime': event_data['endDate'],
 *             'timeZone': 'Europe/Amsterdam',
 *         },
 *         'attachments': [
 *             {
 *                 'fileUrl': event_data['posterUrl'],
 *                 'mimeType': 'image/jpeg',
 *             }
 *         ],
 *     }
 *     
 *     event = calendar_service.events().insert(
 *         calendarId=calendar_id,
 *         body=event
 *     ).execute()
 *     
 *     return {
 *         'eventId': event.get('id'),
 *         'eventUrl': event.get('htmlLink'),
 *     }
 */

// ============================================
// EXAMPLE: Google Photos API Implementation
// ============================================

/**
 * Note: Google Photos Library API is more limited than Drive/Calendar
 * You may need to upload to Drive first, then link to Photos
 * 
 * Example for Node.js:
 * 
 * export async function uploadPhotoAndAddToAlbum(auth, albumId, filePath) {
 *   const photoslibrary = google.photoslibrary({ version: 'v1', auth });
 *   
 *   // Upload the media
 *   const uploadResponse = await photoslibrary.mediaItems.search({
 *     requestBody: {
 *       albumId: albumId,
 *     },
 *   });
 *   
 *   // Note: Photos API requires a more complex flow
 *   // Often better to use Drive + Photos integration
 * }
 */

export const googleAuthConfig = {
  requiredScopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/photoslibrary',
  ],
  requiredEnvVars: [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PROJECT_ID',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_DRIVE_FOLDER_ID',
    'GOOGLE_CALENDAR_NATIONAAL',
    'GOOGLE_CALENDAR_INTERNATIONAAL',
    'GOOGLE_CALENDAR_BEURZEN',
  ],
};
