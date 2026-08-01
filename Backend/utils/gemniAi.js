import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;
let ai = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn('GEMINI_API_KEY not set — Gemini responses will fall back to a local message.');
}

const getGemniAiAPiResponse = async (message) => {
  if (!ai) {
    // safe fallback when API key is not configured
    return `Assistant currently unavailable (no GEMINI_API_KEY configured). You asked: "${message}"`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    return response.text;
  } catch (err) {
    console.error('Gemini API error:', err);
    return 'Assistant is temporarily unavailable.';
  }
};

export default getGemniAiAPiResponse;