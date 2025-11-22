// Find Google Photos Album ID
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3001/auth/callback'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function findAlbums() {
  try {
    console.log('🔍 Finding Google Photos albums...');
    
    const { token } = await oauth2Client.getAccessToken();
    
    const response = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.albums) {
      console.log('📁 Found albums:');
      result.albums.forEach(album => {
        console.log(`- "${album.title}" ID: ${album.id}`);
      });
      
      // Look for the target album
      const targetAlbum = result.albums.find(album => 
        album.title.includes('Flyer') || 
        album.title.includes('Poster') || 
        album.title.includes('Verzameling')
      );
      
      if (targetAlbum) {
        console.log(`\n✅ Found target album: "${targetAlbum.title}"`);
        console.log(`📋 Correct Album ID: ${targetAlbum.id}`);
      }
    } else {
      console.log('No albums found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findAlbums();