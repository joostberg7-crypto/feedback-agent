import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. DATABASE CONNECTIE
// ==========================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback_sessions';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Succesvol verbonden met MongoDB!'))
  .catch((err) => console.error('MongoDB verbindingsfout:', err));

// ==========================================
// 2. MONGOOSE SCHEMA'S
// ==========================================
const messageSchema = new mongoose.Schema({
  role: { type: String, required: true }, // 'user' of 'docent'
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  title: { type: String, default: 'Nieuw Gesprek' },
  createdAt: { type: Date, default: Date.now },
  messages: [messageSchema]
});

const Session = mongoose.model('Session', sessionSchema);

// ==========================================
// 3. API ROUTES
// ==========================================

// A. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend draait als een zonnetje op MongoDB!' });
});

// B. Haal alle sessies op voor de zijbalk
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    // Zet '_id' om naar 'id' voor de Vue frontend
    const mappedSessions = sessions.map(s => ({ ...s.toObject(), id: s._id }));
    res.json(mappedSessions);
  } catch (error) {
    console.error('Fout bij ophalen sessies:', error);
    res.status(500).json({ error: 'Kon sessies niet ophalen' });
  }
});

// C. Maak een NIEUWE lege sessie aan
app.post('/api/sessions', async (req, res) => {
  try {
    const newSession = new Session({ title: 'Nieuw Gesprek', messages: [] });
    await newSession.save();
    res.json({ ...newSession.toObject(), id: newSession._id });
  } catch (error) {
    console.error('Fout bij aanmaken sessie:', error);
    res.status(500).json({ error: 'Kon geen sessie aanmaken' });
  }
});

// D. Haal 1 specifieke sessie op inclusief alle berichten als je erop klikt
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Sessie niet gevonden' });
    res.json({ ...session.toObject(), id: session._id });
  } catch (error) {
    console.error('Fout bij ophalen sessie:', error);
    res.status(500).json({ error: 'Fout op server' });
  }
});

// E. Verwijder een specifieke sessie
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Fout bij verwijderen:', error);
    res.status(500).json({ error: 'Kon sessie niet verwijderen' });
  }
});

// F. Chat endpoint
app.post('/api/sessions/:id/chat', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Geen content gevonden' });
    }

    let session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Sessie niet gevonden' });

    // Update titel bij eerste bericht
    if (session.messages.length === 0) {
      session.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }

    // Sla berichten op
    session.messages.push({ role: 'user', content: content });

    const aiResponse = `Dit is een tijdelijk antwoord. We gaan straks AI koppelen aan: "${content}"`;
    session.messages.push({ role: 'assistant', content: aiResponse });

    await session.save();

    const lastMessage = session.messages[session.messages.length - 1];
    
    res.json({
      id: lastMessage._id,
      content: aiResponse,
      createdAt: lastMessage.timestamp
    });

  } catch (error) {
    console.error('Fout in chat endpoint:', error);
    res.status(500).json({ error: 'Er ging iets mis op de server' });
  }
});

// ==========================================
// 4. SERVER STARTEN
// ==========================================
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});