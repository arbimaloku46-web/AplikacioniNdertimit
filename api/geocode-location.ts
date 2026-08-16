import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // CORS handling for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  try {
    const { query } = req.body || {};
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Find the exact latitude and longitude for this location query: "${query}". Return a JSON object with exactly two keys: "lat" (number) and "lng" (number). Do not return any other text, markdown, or explanation.`,
      config: {
        tools: [{ googleMaps: {} }],
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    const text = response.text;
    if (text) {
      const coords = JSON.parse(text);
      return res.status(200).json(coords);
    } else {
      throw new Error("No text in response");
    }
  } catch (error: any) {
    console.error("Geocoding error:", error);
    res.status(500).json({ error: error.message || "Failed to geocode location" });
  }
}
