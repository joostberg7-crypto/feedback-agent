import { Request, Response } from 'express';
import { Session } from '../models/Session';
import { geminiService } from '../services/gemini.service';

export const chatController = {
  // Alle sessies ophalen
  async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = await Session.find().sort({ createdAt: -1 });
      res.json(sessions.map(s => ({ ...s.toObject(), id: s._id })));
    } catch (error) {
      res.status(500).json({ error: 'Fout bij ophalen sessies' });
    }
  },

  // Nieuwe sessie starten
  async createSession(req: Request, res: Response) {
    try {
      const newSession = new Session({ title: 'Nieuw Gesprek', messages: [] });
      await newSession.save();
      res.json({ ...newSession.toObject(), id: newSession._id });
    } catch (error) {
      res.status(500).json({ error: 'Fout bij aanmaken sessie' });
    }
  },

  // Chatbericht verwerken (Nog zonder SSE voor nu, focus op structuur)
  async sendMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const session = await Session.findById(id);
      if (!session) return res.status(404).json({ error: 'Sessie niet gevonden' });

      // Update titel bij eerste bericht
      if (session.messages.length === 0) {
        session.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
      }

      const history = session.messages;
      const aiResponse = await geminiService.generateChatResponse(history, content);

      session.messages.push({ role: 'user', content });
      session.messages.push({ role: 'assistant', content: aiResponse });
      session.updatedAt = new Date();
      await session.save();

      const lastMessage = session.messages[session.messages.length - 1];
      res.json({
        id: lastMessage._id,
        content: aiResponse,
        createdAt: lastMessage.timestamp
      });
    } catch (error) {
      res.status(500).json({ error: 'AI kon niet antwoorden' });
    }
  }
};