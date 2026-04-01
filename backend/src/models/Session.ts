import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  title: { type: String, default: 'Nieuw Gesprek' },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Session = mongoose.model('Session', sessionSchema);