import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// 1. Maak een nieuwe sessie aan
app.post('/api/sessions', async (req, res) => {
  try {
    const session = await prisma.session.create({
      data: {
        title: 'Nieuwe Feedback Sessie'
      }
    });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij het aanmaken van een sessie' });
  }
});

// 2. Sla een bericht op in een specifieke sessie
app.post('/api/sessions/:sessionId/messages', async (req, res) => {
  const { sessionId } = req.params;
  const { role, content } = req.body;

  try {
    const message = await prisma.message.create({
      data: {
        role: role,
        content: content,
        sessionId: sessionId
      }
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij het opslaan van het bericht' });
  }
});

// 3. Haal alle berichten van een sessie op
app.get('/api/sessions/:sessionId/messages', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { sessionId: sessionId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij het ophalen van de berichten' });
  }
});

// Health check route voor de frontend
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is verbonden met de database' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server draait succesvol op poort ${PORT} en is verbonden met Prisma`);
});