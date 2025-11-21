# HDCN Poster Processor
A React app that uses OpenRouter AI, Gemini Pro, and Google Lens to automate poster processing and event scheduling.

## Core Workflow

### 1. Upload Poster
- Accept poster uploads from local computer or Google Drive
- Support common image formats (JPG, PNG, PDF)

### 2. Extract and Validate Text
- Use Google Lens/Gemini Pro to perform OCR and extract text from poster
- Display extracted text in a review window for user verification
- Extract key event details: date, title, location, description

**2.1 Date Processing**
- Automatically detect event date from extracted text
- Present identified date to user for approval/modification
- Handle ambiguous dates with user clarification (e.g., DD/MM vs MM/DD)

**2.2 Duplicate Detection & Storage**
- Check if poster already exists in Google Drive "PostersForAgenda" folder
- If new: upload poster to "PostersForAgenda" folder
- If duplicate: notify user and skip upload
- Provide shareable Google Drive URL (lh3 format preferred for direct image access)

### 3. Create Calendar Event
- Create agenda posting in one of three H-DCN Google Calendars:
  - Nationaal
  - Internationaal
  - Beurzen en Diversen
- Calendar: webmaster@h-dcn.nl (service account)

**3.1 Event Customization**
- Allow user to review and modify event details before posting
- Enable user to set/adjust start date and end date
- Attach poster URL as Google Drive element to calendar event

**3.2 Calendar Integration**
- Auto-populate event title and description from extracted poster text
- Link poster Google Drive file to calendar event

### 4. Archive in Google Photos
- Upload poster to Google Photos account (webmaster@h-dcn.nl)
- Ensure photo metadata date matches the event start date from calendar
- Add poster to album: "Flyer / Poster Verzameling"

## Backend Architecture Recommendation

Use a backend service (Node.js/Express or Python/Flask) to:
- Securely handle Google API credentials (service account)
- Manage OAuth flows for user authentication
- Implement OCR processing pipeline
- Handle duplicate detection logic
- Reduce client-side exposure to sensitive API keys

**Recommended Google APIs:**
- Google Drive API (upload, folder management)
- Google Calendar API (event creation)
- Google Photos API (upload, album management)
- Google Vision API or Gemini API (OCR)

## Error Handling

- **Failed OCR**: Provide fallback option for manual text entry
- **Date ambiguity**: Present user with detected date options for confirmation
- **Duplicate posters**: Show existing poster and prompt user to update existing event instead
- **API failures**: Graceful error messages with retry options
- **Date mismatch**: Alert if poster date differs significantly from event date
