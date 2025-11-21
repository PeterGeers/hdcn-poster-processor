export const extractEventDetails = async (imageBase64) => {
  console.log('Starting OpenRouter OCR extraction...');
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('OpenRouter API Key check:', apiKey ? 'Present' : 'Missing');
  
  if (!apiKey) {
    throw new Error("OpenRouter API Key is missing. Please set OPENROUTER_API_KEY in .env.local");
  }

  const prompt = `Look at this event poster and extract the key information. 

Respond with ONLY a JSON object in this exact format:
{
  "title": "event name from poster",
  "startDate": "2024-12-15T09:00:00.000Z",
  "endDate": "2024-12-15T13:00:00.000Z",
  "location": "venue or address from poster",
  "description": "brief description of the event",
  "calendar": "Nationaal"
}

Rules:
- Use actual dates from the poster
- If no time shown, use 09:00 for start
- If no end time, add 4 hours to start
- For calendar: use "Internationaal" if outside Netherlands, "Beurzen en Diversen" for fairs/swap meets, otherwise "Nationaal"`;

  try {
    console.log('Making OpenRouter API call...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'HDCN Poster Processor'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
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
                  url: `data:image/jpeg;base64,${imageBase64}`
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
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('OpenRouter API response received');
    
    console.log('Full API result:', JSON.stringify(result, null, 2));
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      console.error('Invalid response structure:', result);
      throw new Error('Invalid response format from OpenRouter');
    }

    const content = result.choices[0].message.content;
    console.log('Raw response content:', content);
    console.log('Content type:', typeof content);
    console.log('Content length:', content ? content.length : 0);

    if (!content || content.trim() === '') {
      throw new Error('Empty response from API');
    }

    // Try to parse JSON from the response
    let eventData;
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
          // If no JSON found, create from text analysis
          console.log('No JSON found, creating from text analysis');
          eventData = {
            title: content.split('\n')[0] || 'Event from Poster',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
            location: 'Location from poster',
            description: content.substring(0, 200),
            calendar: 'Nationaal'
          };
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse response as JSON');
      }
    }

    // Validate and format the response
    const title = eventData.title || 'Event from Poster';
    const location = eventData.location || 'Location from poster';
    const description = eventData.description || 'Event details extracted from poster';
    const calendar = eventData.calendar || 'Nationaal';

    // Handle dates
    let startDate = new Date();
    let endDate = new Date();
    
    if (eventData.startDate) {
      startDate = new Date(eventData.startDate);
      if (isNaN(startDate.getTime())) {
        startDate = new Date();
      }
    }
    
    if (eventData.endDate) {
      endDate = new Date(eventData.endDate);
      if (isNaN(endDate.getTime())) {
        endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // +4 hours
      }
    } else {
      endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // +4 hours
    }

    const result_data = {
      title,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location,
      description,
      calendar
    };

    console.log('Processed event data:', result_data);
    return result_data;

  } catch (error) {
    console.error("OpenRouter Extraction Error:", error);
    
    // Fallback to mock data if OpenRouter fails
    console.log('Using fallback mock data due to OpenRouter error');
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