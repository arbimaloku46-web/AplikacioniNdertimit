import { GoogleGenAI } from "@google/genai";
import { WeeklyUpdate, Project } from '../types';

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateProgressReport = async (project: Project, update: WeeklyUpdate): Promise<string> => {
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  if (!process.env.API_KEY) {
    return "API Key not configured. Cannot generate AI report.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  let lastError: any;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Correct usage: ai.models.generateContent
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Analysis currently unavailable.";
    } catch (error: any) {
      lastError = error;
      
      const errString = JSON.stringify(error);
      // Handle Quota Exhausted immediately - do not retry
      if (errString.includes("RESOURCE_EXHAUSTED") || (error?.status === 429 && errString.includes("quota"))) {
        console.warn("Gemini API Quota Exceeded");
        return "AI analysis unavailable: Daily API quota exceeded. Please check billing or try again tomorrow.";
      }

      // Determine if error is retryable (429 Rate Limit - not quota, or 503 Service Unavailable)
      const status = error?.status || error?.code || error?.error?.code || error?.response?.status;
      const isRateLimit = status === 429 || status === 503 || (error?.message && error.message.includes('429'));

      if (isRateLimit && attempt < MAX_RETRIES) {
        const backoffTime = BASE_DELAY * Math.pow(2, attempt); // 1s, 2s, 4s
        console.warn(`Gemini API attempt ${attempt + 1} failed with ${status}. Retrying in ${backoffTime}ms...`);
        await delay(backoffTime);
        continue;
      }
      
      console.error("Gemini API Error:", error);
      break; // Non-retryable error or max retries reached
    }
  }

  // Provide a user-friendly error message based on the last error
  const status = lastError?.status || lastError?.code || lastError?.error?.code;
  if (status === 429 || (lastError?.message && lastError.message.includes('quota'))) {
      return "AI analysis temporarily unavailable due to high usage. Please try again later.";
  }

  return "Unable to generate AI insight at this time.";
};