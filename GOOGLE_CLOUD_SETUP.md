# Google Cloud Authentication Setup Guide

## Overview
This guide walks you through setting up Google Cloud APIs for the HDCN Poster Processor. You'll need:
- **Google Drive API** - Upload and manage poster files
- **Google Calendar API** - Create and manage calendar events
- **Google Photos Library API** - Upload to photo albums
- **Google Vision API** - OCR text extraction (optional)

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project selector at the top
3. Click "NEW PROJECT"
4. Name: `HDCN Poster Processor`
5. Click "CREATE"
6. Wait for the project to be created, then select it

---

## Step 2: Enable Required APIs

### 2.1 Enable Google Drive API
1. Search for "Google Drive API" in the top search bar
2. Click on it
3. Click "ENABLE"

### 2.2 Enable Google Calendar API
1. Search for "Google Calendar API"
2. Click on it
3. Click "ENABLE"

### 2.3 Enable Google Photos Library API
1. Search for "Google Photos Library API"
2. Click on it
3. Click "ENABLE"

### 2.4 Enable Google Vision API (Optional, for OCR)
1. Search for "Google Vision API"
2. Click on it
3. Click "ENABLE"

---

## Step 3: Create a Service Account

A Service Account allows your backend to authenticate without user interaction.

1. In the Google Cloud Console, go to **Navigation Menu** → **APIs & Services** → **Credentials**
2. Click "CREATE CREDENTIALS" → "Service Account"
3. Fill in the details:
   - **Service Account Name:** `hdcn-poster-processor`
   - **Service Account ID:** Auto-generated
   - **Description:** `Service account for HDCN Poster Processor`
4. Click "CREATE AND CONTINUE"
5. Click "CONTINUE" (skip optional steps)
6. Click "DONE"

---

## Step 4: Create and Download Service Account Key

1. In **APIs & Services** → **Credentials**, find your service account
2. Click on the service account name
3. Go to the "KEYS" tab
4. Click "ADD KEY" → "Create new key"
5. Choose "JSON" format
6. Click "CREATE"
7. **Save this JSON file securely** - you'll need it for your backend

Example file structure:
```json
{
  "type": "service_account",
  "project_id": "hdcn-poster-processor-xxxxx",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "hdcn-poster-processor@hdcn-poster-processor-xxxxx.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## Step 5: Grant Permissions to Service Account

The service account needs access to the webmaster@h-dcn.nl account.

### For Google Drive:
1. Go to **Google Drive**
2. Create/open the folder `PostersForAgenda`
3. Right-click → "Share"
4. Share with the service account email: `hdcn-poster-processor@hdcn-poster-processor-xxxxx.iam.gserviceaccount.com`
5. Give "Editor" permissions
6. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/[FOLDER_ID]`

### For Google Calendar:
1. Go to **Google Calendar**
2. Create calendars if not already created:
   - Nationaal
   - Internationaal
   - Beurzen en Diversen
3. Right-click each calendar → "Settings" → "Share with specific people"
4. Share with the service account email
5. Give "Editor" permissions
6. Get calendar IDs from calendar settings

### For Google Photos:
1. Go to **Google Photos**
2. Create the album `Flyer / Poster Verzameling` if not already created
3. Share with the service account email

---

## Step 6: Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
# Google Cloud Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=hdcn-poster-processor@hdcn-poster-processor-xxxxx.iam.gserviceaccount.com
GOOGLE_PROJECT_ID=hdcn-poster-processor-xxxxx
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Drive
GOOGLE_DRIVE_FOLDER_ID=your_PostersForAgenda_folder_id

# Google Calendar
GOOGLE_CALENDAR_NATIONAAL=your_nationaal_calendar_id@group.calendar.google.com
GOOGLE_CALENDAR_INTERNATIONAAL=your_internationaal_calendar_id@group.calendar.google.com
GOOGLE_CALENDAR_BEURZEN=your_beurzen_calendar_id@group.calendar.google.com

# Google Photos
GOOGLE_PHOTOS_ALBUM_ID=your_album_id

# API Keys (if using Gemini for OCR)
GEMINI_API_KEY=your_gemini_api_key

# Backend URL (for frontend to call)
VITE_BACKEND_URL=http://localhost:3000/api
```

⚠️ **IMPORTANT:** 
- Never commit `.env.local` to version control
- Store sensitive keys securely (e.g., in GitHub Secrets for CI/CD)
- Rotate keys periodically

---

## Step 7: Install Google Client Libraries

In your backend project (when created), install:

```bash
npm install google-auth-library @googleapis/drive @googleapis/calendar @googleapis/photoslibrary
```

Or for Python:
```bash
pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

---

## Step 8: Implement Backend Authentication

See `backend/auth/googleAuth.ts` (or similar) for implementation examples.

---

## Verification Checklist

- [x] All required APIs enabled
- [x] Service account created
- [x] Service account key downloaded (JSON)
- [x] Folder `PostersForAgenda` created and shared
- [x] Calendars created and shared
- [x] Album `Flyer / Poster Verzameling` created and shared
- [x] `.env.local` configured with all credentials
- [x] Backend can authenticate with Google APIs

---

## Troubleshooting

### "Permission denied" errors
- Verify service account email is shared with correct permissions (Editor)
- Check that the correct folder/calendar/album IDs are used

### "Invalid credentials" errors
- Ensure `GOOGLE_PRIVATE_KEY` is properly formatted with line breaks
- Verify JSON key file is not corrupted

### API not enabled
- Go back to APIs & Services → Enabled APIs
- Search for the API and re-enable if needed

---

## Next Steps

1. Set up the **backend service** (Node.js/Python)
2. Create API endpoints that use these credentials
3. Update frontend to call backend instead of mock service
4. Test end-to-end workflow
