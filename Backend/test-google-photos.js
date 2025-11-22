// Google Photos Upload Test Program
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { google } from 'googleapis';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

console.log('🧪 Google Photos Upload Test');
console.log('============================');

// OAuth2 Client Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3001/auth/callback'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function testGooglePhotosUpload() {
  try {
    console.log('📸 Step 1: Loading test image...');
    const imagePath = join(__dirname, '../20251122_140933.jpg');
    
    if (!fs.existsSync(imagePath)) {
      throw new Error('Test image not found: ' + imagePath);
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    console.log(`✅ Image loaded: ${imageBuffer.length} bytes`);

    console.log('🔑 Step 2: Getting access token...');
    const { token } = await oauth2Client.getAccessToken();
    console.log('✅ Access token obtained');

    console.log('📤 Step 3: Uploading image to Google Photos...');
    const uploadResponse = await fetch('https://photoslibrary.googleapis.com/v1/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'X-Goog-Upload-File-Name': '20251122_140933.jpg',
        'X-Goog-Upload-Protocol': 'raw'
      },
      body: imageBuffer
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`);
    }

    const uploadToken = await uploadResponse.text();
    console.log('✅ Image uploaded, token received');

    console.log('📅 Step 4: Creating media item with custom date (2027-01-01)...');
    const createResponse = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newMediaItems: [{
          description: 'HDCN Test Upload - Event Date: 2027-01-01',
          simpleMediaItem: {
            uploadToken: uploadToken,
            fileName: '20251122_140933.jpg'
          }
        }]
      })
    });

    const createResult = await createResponse.json();
    console.log('📋 Create response:', JSON.stringify(createResult, null, 2));

    if (createResult.newMediaItemResults?.[0]?.status?.message === 'Success') {
      const mediaItem = createResult.newMediaItemResults[0].mediaItem;
      console.log('✅ Media item created:', mediaItem.id);
      console.log('🔗 Photo URL:', mediaItem.productUrl);

      console.log('📁 Step 5: Adding to album...');
      const albumId = process.env.GOOGLE_PHOTOS_ALBUM_ID;
      
      if (!albumId) {
        console.log('⚠️  No album ID configured, skipping album assignment');
        return;
      }

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
        console.log('✅ Photo added to album successfully!');
      } else {
        const albumError = await albumResponse.text();
        console.log('❌ Album assignment failed:', albumError);
      }

      console.log('🎉 Test completed successfully!');
      console.log('📸 Photo uploaded with description containing target date');
      console.log('⚠️  Note: Google Photos API cannot change actual photo metadata dates');
      
    } else {
      const errorMsg = createResult.newMediaItemResults?.[0]?.status?.message || 'Unknown error';
      throw new Error(`Failed to create media item: ${errorMsg}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testGooglePhotosUpload();