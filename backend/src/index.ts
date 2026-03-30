import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Test route om te kijken of de Vue frontend kan verbinden
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'De api werkt!' });
});

// Hier komen later de routes voor sessies en AI-calls
// app.post('/api/sessions', createSession);
// app.post('/api/chat', handleChat);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});