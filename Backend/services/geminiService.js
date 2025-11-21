import { GoogleGenAI } from "@google/genai";

export const extractEventDetails = async (imageBase64) => {
  console.log('Starting OCR extraction...');
  
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  console.log('API Key check:', apiKey ? 'Present' : 'Missing');
  
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in .env.local");
  }

  let genAI;
  try {
    genAI = new GoogleGenAI(apiKey);
    console.log('GoogleGenAI initialized successfully');
  } catch (initError) {
    console.error('Failed to initialize GoogleGenAI:', initError);
    throw new Error('Failed to initialize Gemini API: ' + initError.message);
  }

  const prompt = `
    Analyze this Dutch event poster and extract:
    Title: [event title]
    Date: [start date in YYYY-MM-DD format]
    Time: [start time if available, otherwise 09:00]
    Location: [venue/address]
    Description: [brief summary in Dutch]
    
    Please format your response clearly with these labels.
    If the location is outside the Netherlands, suggest 'Internationaal'.
    If it's a ham radio swap meet or fair, suggest 'Beurzen en Diversen'.
    Otherwise, suggest 'Nationaal'.
  `;

  try {
    console.log('Getting Gemini model...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Model obtained, making API call...');
    
    const response = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      }
    ]);
    console.log('API call completed');

    const result = await response.response;
    const text = result.text();
    console.log('Text extracted, length:', text?.length || 0);
    
    if (!text) throw new Error("No data returned from Gemini.");

    // Parse the response
    const extractField = (text, field) => {
      const regex = new RegExp(`${field}[:\\s]+([^\\n]+)`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : null;
    };

    const title = extractField(text, 'title') || extractField(text, 'event') || 'Event from Poster';
    const dateStr = extractField(text, 'date') || extractField(text, 'datum');
    const timeStr = extractField(text, 'time') || extractField(text, 'tijd') || '09:00';
    const location = extractField(text, 'location') || extractField(text, 'locatie') || extractField(text, 'venue') || 'Location from poster';
    const description = extractField(text, 'description') || text.substring(0, 200) + '...';

    // Create date objects
    let startDate = new Date();
    let endDate = new Date();
    
    if (dateStr) {
      const parsedDate = new Date(dateStr + 'T' + timeStr);
      if (!isNaN(parsedDate.getTime())) {
        startDate = parsedDate;
        endDate = new Date(parsedDate.getTime() + 4 * 60 * 60 * 1000); // +4 hours
      }
    }

    // Determine calendar type
    let calendar = 'Nationaal';
    const textLower = text.toLowerCase();
    if (textLower.includes('international') || textLower.includes('world') || textLower.includes('europe')) {
      calendar = 'Internationaal';
    } else if (textLower.includes('beurs') || textLower.includes('fair') || textLower.includes('swap')) {
      calendar = 'Beurzen en Diversen';
    }

    return {
      title,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location,
      description,
      calendar
    };

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    
    // Fallback to mock data if Gemini fails
    console.log('Using fallback mock data due to Gemini error');
    return {
      title: "Ham Radio Event (OCR Failed)",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      location: "Location from poster",
      description: "Event details extracted from poster. Please review and edit as needed.",
      calendar: "Nationaal"
    };
  }
};