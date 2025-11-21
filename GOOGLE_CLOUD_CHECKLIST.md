# Google Cloud Setup Checklist

Use this checklist to track your progress through the Google Cloud authentication setup.

## Phase 1: Google Cloud Project Setup

- [ ] Create Google Cloud project "HDCN Poster Processor"
- [ ] Enable Google Drive API
- [ ] Enable Google Calendar API
- [ ] Enable Google Photos Library API
- [ ] Enable Google Vision API (optional, for OCR)

## Phase 2: Service Account Creation

- [ ] Create Service Account named `hdcn-poster-processor`
- [ ] Download Service Account Key (JSON format)
- [ ] Save JSON key securely (never commit to git!)
- [ ] Extract and note the following from JSON:
  - [ ] `project_id`: ________________
  - [ ] `client_email`: ________________
  - [ ] `private_key`: ________________ (keep secure!)
  - [ ] `client_id`: ________________

## Phase 3: Google Drive Setup

- [ ] Create folder `PostersForAgenda` in webmaster@h-dcn.nl Drive
- [ ] Extract folder ID from URL: ________________
- [ ] Share folder with service account email
- [ ] Grant "Editor" permissions
- [ ] Test: Service account can create files in this folder

## Phase 4: Google Calendar Setup

- [ ] Create calendar "Nationaal" in webmaster@h-dcn.nl
  - Calendar ID: ________________
- [ ] Create calendar "Internationaal" in webmaster@h-dcn.nl
  - Calendar ID: ________________
- [ ] Create calendar "Beurzen en Diversen" in webmaster@h-dcn.nl
  - Calendar ID: ________________
- [ ] Share each calendar with service account email
- [ ] Grant "Editor" permissions to each
- [ ] Test: Service account can create events in each calendar

## Phase 5: Google Photos Setup

- [ ] Create album "Flyer / Poster Verzameling" in Google Photos
- [ ] Extract album ID: ________________
- [ ] Share album with service account email
- [ ] Test: Service account can upload photos

## Phase 6: Environment Variables Configuration

- [ ] Create/update `.env.local` file
- [ ] Add `GOOGLE_SERVICE_ACCOUNT_EMAIL`: ________________
- [ ] Add `GOOGLE_PROJECT_ID`: ________________
- [ ] Add `GOOGLE_PRIVATE_KEY`: ✓ (from JSON)
- [ ] Add `GOOGLE_DRIVE_FOLDER_ID`: ________________
- [ ] Add `GOOGLE_CALENDAR_NATIONAAL`: ________________
- [ ] Add `GOOGLE_CALENDAR_INTERNATIONAAL`: ________________
- [ ] Add `GOOGLE_CALENDAR_BEURZEN`: ________________
- [ ] Add `GOOGLE_PHOTOS_ALBUM_ID`: ________________
- [ ] Add `GEMINI_API_KEY`: ________________
- [ ] Add `VITE_BACKEND_URL`: `http://localhost:3000/api`

## Phase 7: Backend Implementation

- [ ] Install Google API libraries (@googleapis packages)
- [ ] Create backend service with authentication
- [ ] Test Drive API connection
- [ ] Test Calendar API connection
- [ ] Test Photos API connection
- [ ] Create API endpoints for:
  - [ ] `POST /api/upload-poster` - Upload to Drive
  - [ ] `POST /api/create-event` - Create calendar event
  - [ ] `POST /api/upload-photo` - Upload to Photos
  - [ ] `GET /api/check-duplicate` - Check for duplicate posters

## Phase 8: Frontend Integration

- [ ] Update frontend to call backend API instead of mock service
- [ ] Add error handling for API failures
- [ ] Add loading states during API calls
- [ ] Test end-to-end workflow

## Phase 9: Testing & Validation

- [ ] Upload a test poster to Drive (check PostersForAgenda folder)
- [ ] Verify poster URL is accessible
- [ ] Create a test calendar event (check calendar)
- [ ] Verify event appears on calendar
- [ ] Upload a test photo to Photos (check album)
- [ ] Verify photo appears in album
- [ ] Test duplicate detection
- [ ] Test error handling (network failures, permission issues)

## Phase 10: Security & Deployment

- [ ] Add `.env.local` to `.gitignore`
- [ ] Use environment variable management for sensitive keys
- [ ] Set up GitHub Secrets for CI/CD (if using GitHub Actions)
- [ ] Review Google Cloud IAM permissions (least privilege)
- [ ] Enable audit logging
- [ ] Set up monitoring/alerts
- [ ] Document credential rotation procedure
- [ ] Deploy backend to production
- [ ] Deploy frontend to production

---

## Useful Links

- [Google Cloud Console](https://console.cloud.google.com)
- [Google Drive API Docs](https://developers.google.com/drive/api/guides/about-sdk)
- [Google Calendar API Docs](https://developers.google.com/calendar/api/guides/overview)
- [Google Photos Library API Docs](https://developers.google.com/photos/library/guides/get-started)
- [Google Vision API Docs](https://cloud.google.com/vision/docs)
- [Service Account Documentation](https://cloud.google.com/iam/docs/service-accounts)

---

## Notes

Document any issues or special configurations here:

```
[Add your notes here]
```

---

## Completed Date

- Started: __________
- Completed: __________
