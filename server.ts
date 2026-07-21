import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/geocode-location", async (req, res) => {
    try {
      const { query } = req.body;
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
        return res.json(coords);
      } else {
        throw new Error("No text in response");
      }
    } catch (error: any) {
      console.error("Geocoding error:", error);
      res.status(500).json({ error: error.message || "Failed to geocode location" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
