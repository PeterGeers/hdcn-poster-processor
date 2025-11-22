// Create Google Photos Album
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

async function createAlbum() {
  try {
    console.log('📁 Creating Google Photos album...');
    
    const { token } = await oauth2Client.getAccessToken();
    
    const response = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        album: {
          title: 'Flyer / Poster Verzameling'
        }
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Album created successfully!');
      console.log(`📋 Album ID: ${result.id}`);
      console.log(`📝 Album Title: ${result.title}`);
      console.log(`🔗 Album URL: ${result.productUrl}`);
      console.log('\n🔧 Update your .env.local file:');
      console.log(`GOOGLE_PHOTOS_ALBUM_ID=${result.id}`);
    } else {
      console.log('❌ Failed to create album:', result);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAlbum();