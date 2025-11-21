import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

import { extractEventDetails } from './services/openrouterService.js';
import { uploadToDrive, createCalendarEvent, uploadToGooglePhotos, checkDuplicatePoster, googleAuth } from './services/googleServices.js';
import { verifyCompleteSetup } from './services/verificationService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HDCN Poster Processor Backend' });
});

// Check available models
app.get('/api/models', async (req, res) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      }
    });
    const models = await response.json();
    const visionModels = models.data.filter(model => 
      model.id.includes('vision') || 
      model.id.includes('gpt-4o') ||
      model.id.includes('claude') ||
      model.id.includes('gemini')
    );
    res.json({ models: visionModels.map(m => ({ id: m.id, name: m.name })) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OCR endpoint
app.post('/api/extract', upload.single('image'), async (req, res) => {
  try {
    console.log('OCR request received');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('File received:', req.file.originalname, req.file.size, 'bytes');
    console.log('API Key available:', !!process.env.VITE_GEMINI_API_KEY);
    
    const imageBase64 = req.file.buffer.toString('base64');
    console.log('Image converted to base64, length:', imageBase64.length);
    
    const eventDetails = await extractEventDetails(imageBase64);
    console.log('OCR completed successfully');
    
    res.json({ success: true, data: eventDetails });
  } catch (error) {
    console.error('OCR extraction error:', error);
    res.status(500).json({ error: error.message || 'OCR processing failed' });
  }
});

// Check duplicates
app.post('/api/check-duplicate', async (req, res) => {
  try {
    const { fileName } = req.body;
    const result = await checkDuplicatePoster(fileName);
    res.json(result);
  } catch (error) {
    console.error('Duplicate check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Comprehensive verification
app.get('/api/verify-setup', async (req, res) => {
  try {
    console.log('Running comprehensive setup verification...');
    const results = await verifyCompleteSetup();
    res.json({ success: true, results });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process event (upload to all Google services)
app.post('/api/process-event', upload.single('image'), async (req, res) => {
  try {
    console.log('Process event request received');
    
    if (!req.file) {
      console.log('No file in process request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('File received for processing:', req.file.originalname);
    console.log('Event data raw:', req.body.eventData);
    
    const eventData = JSON.parse(req.body.eventData);
    console.log('Parsed event data:', eventData);
    
    let driveResult, calendarResult, photoResult;
    
    // 1. Upload to Drive
    console.log('Starting Drive upload...');
    try {
      driveResult = await uploadToDrive(req.file, eventData.title);
      console.log('Drive result:', driveResult);
    } catch (error) {
      console.error('Drive upload error:', error);
      driveResult = { success: false, message: 'Drive upload failed: ' + error.message };
    }

    // 2. Create Calendar Event
    console.log('Starting Calendar event creation...');
    try {
      calendarResult = await createCalendarEvent(eventData, driveResult?.url || '');
      console.log('Calendar result:', calendarResult);
    } catch (error) {
      console.error('Calendar creation error:', error);
      calendarResult = { success: false, message: 'Calendar creation failed: ' + error.message };
    }

    // 3. Upload to Photos
    console.log('Starting Photos upload...');
    try {
      photoResult = await uploadToGooglePhotos(req.file, eventData.startDate);
      console.log('Photos result:', photoResult);
    } catch (error) {
      console.error('Photos upload error:', error);
      photoResult = { success: false, message: 'Photos upload failed: ' + error.message };
    }

    console.log('All processing completed successfully');
    res.json({
      success: true,
      results: {
        drive: driveResult,
        calendar: calendarResult,
        photos: photoResult
      }
    });

  } catch (error) {
    console.error('Event processing error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Event processing failed' });
  }
});

// OAuth2 setup routes
app.get('/auth/setup', async (req, res) => {
  const oauth2Client = await googleAuth.getAuthClient();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/photoslibrary'
    ]
  });
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const oauth2Client = await googleAuth.getAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    console.log('All tokens received:', tokens);
    
    if (tokens.refresh_token) {
      // Update the client with new tokens
      oauth2Client.setCredentials(tokens);
      
      res.json({
        message: 'Authentication successful! Refresh token obtained.',
        refresh_token: tokens.refresh_token,
        status: 'ready'
      });
    } else {
      res.json({
        message: 'Access token received but no refresh token. You may need to revoke access and try again.',
        access_token: tokens.access_token ? 'present' : 'missing',
        note: 'Go to https://myaccount.google.com/permissions and revoke access, then try again'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 HDCN Poster Processor Backend running on http://localhost:${PORT}`);
  console.log(`📁 Environment loaded from: ${join(__dirname, '../.env.local')}`);
  console.log(`🔐 OAuth2 setup: http://localhost:${PORT}/auth/setup`);
});