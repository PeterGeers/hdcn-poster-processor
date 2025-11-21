import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

class GoogleAuthService {
  private auth: GoogleAuth;
  
  constructor() {
    this.auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/photoslibrary'
      ]
    });
  }

  async getAuthClient() {
    return await this.auth.getClient();
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

export const googleAuth = new GoogleAuthService();