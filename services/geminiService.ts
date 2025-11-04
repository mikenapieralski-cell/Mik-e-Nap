
import { GoogleGenAI } from "@google/genai";

// The API key is injected by the environment.
// The explicit check is removed to prevent unnecessary errors, adhering to the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

export const translateText = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return text; // Return empty or whitespace text as is
  }
  
  const systemInstruction = `You are an expert SRT file translator.
Your task is to translate text snippets from an SRT file to Spanish.
The user will provide a series of text snippets joined by a unique separator '|||---|||'.
You must:
1. Translate each individual text snippet to Spanish.
2. Preserve the '|||---|||' separator between each translated snippet.
3. Return ONLY the translated snippets, joined by the same separator.
4. Do not add any extra explanations, introductory phrases, or any other conversational text.
5. Preserve any original line breaks and HTML tags (like <i>, <b>, <u>, <font>) within each snippet. Translate only the text content.

Example Input:
Hello world|||---|||How are you?

Example Output:
Hola mundo|||---|||¿Cómo estás?`;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: text,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.3, // Lower temperature for more deterministic, direct translations
        }
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Propagate a more informative error
    throw new Error(`Failed to translate text. Please check your API key and network connection. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
};
