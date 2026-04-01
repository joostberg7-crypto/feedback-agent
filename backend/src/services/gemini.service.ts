import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "Je bent een Feedback Assistent voor de HvA..." 
});

export const geminiService = {
  async generateChatResponse(history: any[], newMessage: string) {
    const chat = model.startChat({
      history: history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    });
    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  }
};