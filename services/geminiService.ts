import { GoogleGenAI } from "@google/genai";
import { EventDetails, CalendarType } from '../types';
import { mockExtractEventDetails } from './mockOcrService';

// Helper to clean base64 string
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");
};

// Helper to extract field from text
const extractField = (text: string, field: string): string | null => {
  const regex = new RegExp(`${field}[:\\s]+([^\\n]+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};

export const extractEventDetails = async (imageBase64: string): Promise<EventDetails> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log('API Key loaded:', apiKey ? 'Yes' : 'No');
  
  if (!apiKey) {
    console.warn('No API key found, using mock OCR service');
    return await mockExtractEventDetails(imageBase64);
  }

  // Try to initialize Gemini - if it fails due to browser restrictions, use mock
  let genAI;
  try {
    genAI = new GoogleGenAI(apiKey);
  } catch (initError: any) {
    console.warn('Gemini initialization failed (browser restrictions), using mock OCR service');
    return await mockExtractEventDetails(imageBase64);
  }

  const prompt = `
    Analyze this event poster and extract:
    Title: [event title]
    Date: [start date in YYYY-MM-DD format]
    Time: [start time if available]
    Location: [venue/address]
    Description: [brief summary]
    
    Please format your response clearly with these labels.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const response = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64(imageBase64)
        }
      }
    ]);

    const result = await response.response;
    const text = result.text();
    
    if (!text) throw new Error("No data returned from Gemini.");

    // Parse the response
    const title = extractField(text, 'title') || extractField(text, 'event') || 'Event from Poster';
    const dateStr = extractField(text, 'date') || extractField(text, 'datum');
    const timeStr = extractField(text, 'time') || extractField(text, 'tijd');
    const location = extractField(text, 'location') || extractField(text, 'locatie') || extractField(text, 'venue') || 'Location from poster';
    const description = extractField(text, 'description') || text.substring(0, 200) + '...';

    // Create date objects
    let startDate = new Date();
    let endDate = new Date();
    
    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        startDate = parsedDate;
        endDate = new Date(parsedDate.getTime() + 4 * 60 * 60 * 1000); // +4 hours
      }
    }

    // Determine calendar type
    let calendar = CalendarType.NATIONAAL;
    const textLower = text.toLowerCase();
    if (textLower.includes('international') || textLower.includes('world') || textLower.includes('europe')) {
      calendar = CalendarType.INTERNATIONAAL;
    } else if (textLower.includes('beurs') || textLower.includes('fair') || textLower.includes('swap')) {
      calendar = CalendarType.BEURZEN;
    }

    return {
      title,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location,
      description,
      calendar
    };

  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    
    // Check if it's a browser restriction error
    if (error.message?.includes('browser') || error.message?.includes('API Key must be set')) {
      console.warn('Gemini API has browser restrictions, using mock OCR service');
      return await mockExtractEventDetails(imageBase64);
    }
    
    // Use mock service as fallback for any other error
    console.warn('Gemini API unavailable, using mock OCR service');
    return await mockExtractEventDetails(imageBase64);
  }
};