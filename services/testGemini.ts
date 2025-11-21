import { GoogleGenAI } from "@google/genai";

export const testGeminiConnection = async (): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return "❌ No API key found";
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Simple text-only test
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: {
        parts: [{ text: "Say 'Hello from Gemini API'" }]
      }
    });

    const text = response.text;
    return `✅ API Working: ${text}`;
  } catch (error: any) {
    return `❌ API Error: ${error.message}`;
  }
};