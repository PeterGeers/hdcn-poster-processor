# 🎯 HDCN Poster Processor

**Automated Ham Radio Event Management System**

A TypeScript-based application that streamlines the process of managing ham radio event posters by automatically extracting event information and distributing it across multiple Google services.

## 🚀 Purpose

The HDCN Poster Processor automates the tedious manual process of:

- Reading event details from poster images
- Creating calendar entries in multiple calendars
- Storing posters in organized folders
- Archiving images with proper metadata

**Before**: Manual data entry, prone to errors, time-consuming
**After**: Upload poster → Everything automated in seconds

## 🔄 Workflow

```
📤 Upload Poster → 🔍 OCR Extract → ✏️ Review & Edit → 📅 Create Events → 📁 Archive
```

### Step-by-Step Process

1. **📤 Upload Event Poster**

   - Drag & drop poster image (JPG, PNG, PDF)
   - Automatic duplicate detection

2. **🔍 OCR Text Extraction**

   - AI-powered text recognition (OpenRouter + Gemini)
   - Extracts: Title, Date, Time, Location, Description
   - Smart calendar categorization (Nationaal/Internationaal/Beurzen)

3. **✏️ Review & Validation**

   - User-friendly interface to verify/edit extracted data
   - Date validation and formatting
   - Manual corrections if needed

4. **📅 Multi-Calendar Integration**

   - Creates events in appropriate H-DCN Google Calendars:
     - **Nationaal**: Dutch national events
     - **Internationaal**: International events
     - **Beurzen en Diversen**: Fairs and swap meets

5. **📁 Automated Archiving**
   - **Google Drive**: Stores poster in "PostersForAgenda" folder
   - **Google Photos**: Archives with event date metadata
   - **Calendar Links**: Clickable poster links in calendar events

## 🏗️ Architecture

### Frontend (React + TypeScript)

- Modern React interface with TypeScript
- Real-time OCR preview and editing
- Step-by-step wizard workflow
- Responsive design

### Backend (Node.js + TypeScript)

- Express.js API server
- Google OAuth2 integration
- OCR processing pipeline
- Multi-service coordination

### AI Integration

- **OpenRouter API**: Primary OCR engine
- **Google Gemini**: Backup OCR service
- Smart text parsing and categorization

### Google Services Integration

- **Google Drive API**: File storage and organization
- **Google Calendar API**: Multi-calendar event creation
- **Google Photos API**: Image archiving with metadata

## 🛠️ Technical Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **AI/OCR**: OpenRouter, Google Gemini
- **Cloud**: Google Workspace APIs
- **Auth**: OAuth2 with refresh tokens
- **Development**: Hot reload, TypeScript throughout

## 🚀 Quick Start

1. **Start Both Servers**

   ```bash
   # VS Code Command Palette
   Ctrl+Shift+P → "Tasks: Run Task" → "Start Both"

   # Or use batch script
   .\start-servers.bat
   ```

2. **Access Application**

   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

3. **System Verification**
   - Visit frontend → Run system verification
   - Checks all Google service connections

## 📊 System Status

✅ **OCR Processing**: OpenRouter + Gemini working  
✅ **Google Drive**: Full upload/organize access  
✅ **Google Calendar**: All 3 calendars integrated  
✅ **Google Photos**: Upload with metadata working  
✅ **OAuth2**: Refresh tokens configured  
✅ **TypeScript**: Complete type safety

## 🎯 Benefits

- **⏱️ Time Saving**: 5-minute manual process → 30 seconds automated
- **🎯 Accuracy**: AI extraction reduces human error
- **📋 Consistency**: Standardized event formatting
- **🔄 Integration**: Single upload → multiple services
- **📱 Accessibility**: Web-based, works anywhere
- **🔍 Searchable**: All events properly categorized and linked

## 👥 Target Users

- **H-DCN Webmasters**: Primary users managing event calendars
- **Ham Radio Clubs**: Organizations with regular events
- **Event Coordinators**: Anyone managing recurring poster-based events

---

**Built for H-DCN (webhulpje)**my passion to improve my time spent and learn AI app development in the Netherlands\*
