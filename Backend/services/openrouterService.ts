import { EventDetails, CalendarType } from '../types.js';

export const extractEventDetails = async (imageBase64: string, mimeType?: string): Promise<EventDetails> => {
  console.log('Starting OpenRouter OCR extraction...');
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('OpenRouter API Key check:', apiKey ? 'Present' : 'Missing');
  
  if (!apiKey) {
    throw new Error("OpenRouter API Key is missing. Please set OPENROUTER_API_KEY in .env.local");
  }

  // Vision models for OCR (cheapest first)
  const visionModels = [
    "anthropic/claude-3-haiku",     // Cheap, reliable
    "openai/gpt-4o-mini",          // Paid fallback
    "anthropic/claude-3-5-sonnet",  // Premium option
  ];

  const prompt = `Bekijk deze evenement poster en haal de belangrijkste informatie eruit. 

Antwoord ALLEEN met een JSON object in dit exacte formaat:
{
  "title": "evenement naam van poster (behoud Nederlandse tekst)",
  "startDate": "2024-12-15T09:00:00.000Z",
  "endDate": "2024-12-15T13:00:00.000Z",
  "location": "locatie of adres van poster (behoud Nederlandse tekst)",
  "description": "korte beschrijving van het evenement (behoud Nederlandse tekst)",
  "calendar": "Nationaal",
  "rawText": "ALLE tekst die je op de poster ziet, exact zoals het er staat, inclusief datum, tijd, locatie, beschrijving, etc."
}

Regels:
- Gebruik werkelijke datums van de poster
- Als geen tijd getoond, gebruik 09:00 voor start
- Als geen eindtijd, voeg 4 uur toe aan starttijd
- Voor calendar: gebruik "Internationaal" als buiten Nederland, "Beurzen en Diversen" voor beurzen/rommelmarkten, anders "Nationaal"
- BELANGRIJK: Behoud alle Nederlandse tekst, vertaal NIETS naar het Engels
- Voor rawText: kopieer ALLE zichtbare tekst van de poster, inclusief kleine details, datums, tijden, adressen, etc.`;

  // Try models in order until one works
  for (const model of visionModels) {
    try {
      console.log(`Trying model: ${model}`);
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'HDCN Poster Processor'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Model ${model} failed:`, response.status, errorText);
        continue; // Try next model
      }

      const result = await response.json();
      console.log(`Model ${model} succeeded`);
    
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        console.error(`Invalid response from ${model}:`, result);
        continue; // Try next model
      }

      const content = result.choices[0].message.content;
      
      if (!content || content.trim() === '') {
        console.error(`Empty response from ${model}`);
        continue; // Try next model
      }

      // Store the raw content for display
      const rawOcrText = content.trim();

      // Try to parse JSON from the response
      let eventData: any;
      try {
        // First try direct parse
        eventData = JSON.parse(content.trim());
      } catch (directParseError) {
        try {
          // Extract JSON from response (might have extra text)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            eventData = JSON.parse(jsonMatch[0]);
          } else {
            console.error(`No valid JSON from ${model}`);
            continue; // Try next model
          }
        } catch (parseError) {
          console.error(`JSON parse error from ${model}:`, parseError);
          continue; // Try next model
        }
      }

      // Validate and format the response
      const title = eventData.title || 'Event from Poster';
      const location = eventData.location || 'Location from poster';
      let description = eventData.description || 'Event details extracted from poster';
      // Remove any template parameters like {TIJD}, {TIME}, etc.
      description = description.replace(/\{[^}]*\}/g, '').replace(/Tot\s+Undefined\s+parameter[^\n]*/gi, '').trim();
      if (!description) description = 'Event details extracted from poster';
      const calendar = eventData.calendar || CalendarType.NATIONAAL;

      // Handle dates
      let startDate = new Date();
      let endDate = new Date();
      
      if (eventData.startDate) {
        startDate = new Date(eventData.startDate);
        if (isNaN(startDate.getTime())) {
          // Default to next week at 9:00 AM
          startDate = new Date();
          startDate.setDate(startDate.getDate() + 7);
          startDate.setHours(9, 0, 0, 0);
        }
      }
      
      if (eventData.endDate) {
        endDate = new Date(eventData.endDate);
        if (isNaN(endDate.getTime())) {
          // If no valid end date, add 4 hours to start date
          endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
        }
      } else {
        // Default end time: 4 hours after start
        endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
      }
      
      // Ensure end date is after start date
      if (endDate <= startDate) {
        endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
      }

      const result_data = {
        title,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location,
        description,
        calendar,
        rawText: eventData.rawText || rawOcrText // Use extracted raw text or fallback to AI response
      };

      console.log(`Success with ${model}:`, result_data);
      return result_data;

    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      continue; // Try next model
    }
  }

  // If all models failed
  console.error("All OpenRouter models failed");
    
  // Fallback to mock data if OpenRouter fails
  console.log('Using fallback mock data due to OpenRouter error');
  return {
    title: "Ham Radio Event (OCR Failed)",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    location: "Location from poster",
    description: "Event details extracted from poster. Please review and edit as needed.",
    calendar: CalendarType.NATIONAAL
  };
};