import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

const app = express();
app.use(cors());

// Test image proxy endpoint
app.get('/api/test-image/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials from .env
    oauth2Client.setCredentials({
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Get file as stream
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'stream' });
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    // Pipe the image data to response
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(404).json({ error: 'Image not found' });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Image proxy server running' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test image proxy running on http://localhost:${PORT}`);
  console.log(`Test image: http://localhost:${PORT}/api/test-image/11rMNAnPVMBfRGuZ5iQodaT5We_ruhtWc`);
});