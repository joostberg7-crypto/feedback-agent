import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// 1. Haal alle sessies met berichten op
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });
    res.json(sessions);
  } catch (error) {
    console.error('Database fout:', error);
    res.status(500).json({ error: 'Fout bij ophalen sessies' });
  }
});

// 2. Maak een sessie aan
app.post('/api/sessions', async (req, res) => {
  try {
    const session = await prisma.session.create({
      data: { title: 'Nieuwe Feedback Sessie' },
      include: { messages: true }
    });
    res.json(session);
  } catch (error) {
    console.error('Database fout:', error);
    res.status(500).json({ error: 'Fout bij aanmaken sessie' });
  }
});

// 3. Verwijder een sessie
app.delete('/api/sessions/:sessionId', async (req, res) => {
  try {
    await prisma.session.delete({ where: { id: req.params.sessionId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Database fout:', error);
    res.status(500).json({ error: 'Fout bij verwijderen sessie' });
  }
});

// 4. De "Proxy" route: Sla docentbericht op en genereer dummy antwoord
app.post('/api/sessions/:sessionId/chat', async (req, res) => {
  const { sessionId } = req.params;
  const { content } = req.body;

  try {
    await prisma.message.create({
      data: { role: 'user', content, sessionId }
    });

    await prisma.session.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });

    // Simuleer korte bedenktijd voor het echte effect
    await new Promise(resolve => setTimeout(resolve, 600));

    const agentMessage = await prisma.message.create({
      data: {
        role: 'agent',
        content: 'Dit is een veilig testbericht vanuit je eigen database. De echte AI logica bouwen we later in!',
        sessionId
      }
    });

    res.json(agentMessage);
  } catch (error) {
    console.error('Database fout:', error);
    res.status(500).json({ error: 'Fout bij chatten' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is verbonden met de database' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT} en is verbonden met Prisma`));