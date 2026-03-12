import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const aiService = {
  async getCodeSuggestion(code: string, language: string, context: string) {
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `You are an expert AI Pair Programmer. Given the following ${language} code and context, provide a short, helpful code suggestion or completion. 
      
      Context: ${context}
      Code:
      ${code}
      
      Provide only the code snippet or a very brief explanation (max 20 words).`;

      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      return null;
    }
  },

  async explainCode(code: string, language: string) {
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `Explain the following ${language} code in detail. Break down the logic, complexity, and suggest improvements.
      
      Code:
      ${code}`;

      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI Explanation Error:", error);
      return "Failed to generate explanation.";
    }
  },

  async predictBugs(code: string, language: string) {
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `Analyze the following ${language} code for potential bugs, security vulnerabilities, and performance issues. 
      Return the results as a JSON array of objects with the following structure:
      { "line": number, "severity": "low" | "medium" | "high", "message": string, "suggestion": string }
      
      Code:
      ${code}`;

      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Bug Prediction Error:", error);
      return [];
    }
  },

  async generateFromVoice(command: string, language: string) {
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `You are a voice-to-code assistant. Convert the following natural language command into valid ${language} code.
      
      Command: "${command}"
      
      Provide ONLY the code snippet, no explanations.`;

      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Voice Generation Error:", error);
      return "// Failed to generate code from voice command.";
    }
  },

  async dashboardChat(message: string) {
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `You are the DevSync Platform Assistant. Help the user with coding questions, explain platform features, or suggest project ideas.
      
      User Message: "${message}"
      
      Keep your response helpful, professional, and concise (max 100 words).`;

      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Dashboard Chat Error:", error);
      return "I'm sorry, I'm having trouble connecting right now. How else can I help you?";
    }
  }
};
