import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import chatRoutes from './routes/chat.routes';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connectie
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('Succesvol verbonden met MongoDB!'))
  .catch(err => console.error('MongoDB verbindingsfout:', err));

// Routes koppelen
app.use('/api/sessions', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend draait als een zonnetje!' });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});