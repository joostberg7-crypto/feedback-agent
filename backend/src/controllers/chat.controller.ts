import { Request, Response } from 'express';
import { Session } from '../models/Session';
import { geminiService } from '../services/gemini.service';

/**
 * In deze controller regelen we alles rondom de chatsessies.
 * We zorgen ervoor dat gesprekken kunnen worden opgehaald, aangemaakt, verwerkt en verwijderd.
 */
export const chatController = {
  
  /**
   * We halen hier een lijstje op van alle gesprekken die we in de database hebben staan.
   * We sorteren ze zo dat de meest recente gesprekken bovenaan verschijnen.
   * @param req - Het verzoek dat we binnenkrijgen.
   * @param res - We sturen de lijst met sessies terug naar de gebruiker.
   */
  async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = await Session.find().sort({ createdAt: -1 });
      res.json(sessions.map(s => ({ ...s.toObject(), id: s._id })));
    } catch (error) {
      res.status(500).json({ error: 'Fout bij ophalen sessies' });
    }
  },

  /**
   * Hier maken we een gloednieuwe chatsessie aan.
   * We geven het de standaard naam 'Nieuw Gesprek' en bewaren het direct in onze database.
   * @param req - De aanvraag voor een nieuw gesprek.
   * @param res - We sturen de gegevens van de nieuwe sessie terug.
   */
  async createSession(req: Request, res: Response) {
    try {
      const newSession = new Session({ title: 'Nieuw Gesprek', messages: [] });
      await newSession.save();
      res.json({ ...newSession.toObject(), id: newSession._id });
    } catch (error) {
      res.status(500).json({ error: 'Fout bij aanmaken sessie' });
    }
  },

  /**
   * We verwerken hier een nieuw bericht en zorgen dat de AI direct begint te praten.
   * We sturen het antwoord stukje voor stukje (streaming) naar het scherm, zodat de gebruiker niet hoeft te wachten.
   * Pas als de AI helemaal klaar is, slaan we het hele gesprek op in de database.
   * @param req - Bevat het ID van de chat en de tekst die is getypt.
   * @param res - De open verbinding waarmee we de tekst live doorsturen.
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const session = await Session.findById(id);
      if (!session) return res.status(404).json({ error: 'Sessie niet gevonden' });

      // We stellen de verbinding in zodat we data live kunnen blijven sturen.
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const history = session.messages;
      const stream = await geminiService.generateChatStream(history, content);

      let fullAIResponse = "";

      // We lopen door de stroom van woorden die we van de AI binnenkrijgen.
      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullAIResponse += chunkText;
        
        // We sturen elk woordje direct door naar de app.
        res.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
      }

      // We voegen het bericht van de gebruiker en het volledige antwoord van de AI toe aan de sessie.
      session.messages.push({ role: 'user', content });
      session.messages.push({ role: 'agent', content: fullAIResponse });
      await session.save();

      // We laten weten dat we klaar zijn en sluiten de verbinding netjes af.
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error("Streaming fout:", error);
      res.end();
    }
  },

  /**
   * We wissen hier een specifiek gesprek uit de database.
   * We zoeken het gesprek op via het ID en verwijderen het definitief.
   * @param req - Bevat het ID van het gesprek dat weg moet.
   * @param res - We laten weten of het verwijderen gelukt is.
   */
  async deleteSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const session = await Session.findByIdAndDelete(id); 
      
      if (!session) {
        return res.status(404).json({ error: 'Sessie niet gevonden' });
      }
      
      res.json({ message: 'Sessie succesvol verwijderd' });
    } catch (error) {
      res.status(500).json({ error: 'Fout bij verwijderen sessie' });
    }
  },
};