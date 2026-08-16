import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import http from "http";

dotenv.config();
process.env.VITE_MAPTILER_API_KEY = '2XSQoYHYmYcpza7rCRwj';
process.env.MAPTILER_API_KEY = '2XSQoYHYmYcpza7rCRwj';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kfodljdnoaapfsocmywl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/delete-account", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid authorization header" });
      }

      if (!SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." });
      }

      const token = authHeader.split(" ")[1];
      
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      
      if (userError || !user) {
        return res.status(401).json({ error: "Invalid token or user not found" });
      }

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

      if (deleteError) {
        throw deleteError;
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete account error:", error);
      res.status(500).json({ error: error.message || "Failed to delete account" });
    }
  });

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
      server: { middlewareMode: true, hmr: { server } },
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

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
