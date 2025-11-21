import { GoogleGenAI } from "@google/genai";
import { WeeklyUpdate, Project } from '../types';

// Helper function to get the API key safely
const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

export const generateProgressReport = async (project: Project, update: WeeklyUpdate): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "API Key not configured. Cannot generate AI report.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Act as a senior construction project manager. 
    Generate a concise, professional executive summary for a weekly client update.
    
    Project Name: ${project.name}
    Location: ${project.location}
    Current Week: ${update.weekNumber}
    Raw Notes: "${update.summary}"
    Key Stats: 
    - Completion: ${update.stats.completion}%
    - Workers: ${update.stats.workersOnSite}
    - Weather: ${update.stats.weatherConditions}

    The tone should be reassuring, professional, and highlight progress. 
    Mention the specific stats provided. 
    Keep it under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI insight at this time.";
  }
};