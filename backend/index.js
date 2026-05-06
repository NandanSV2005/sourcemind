const express = require('express');
const cors = require('cors');
require('dotenv').config();

const notebookRoutes = require('./routes/notebooks');
const documentRoutes = require('./routes/documents');
const chatRoutes = require('./routes/chat');
const summaryRoutes = require('./routes/summary');
const compareRoutes = require('./routes/compare');
const gapsRoutes = require('./routes/gaps');
const mindmapRoutes = require('./routes/mindmap');
const flashcardsRoutes = require('./routes/flashcards');
const quizRoutes = require('./routes/quiz');
const podcastRoutes = require('./routes/podcast');
const memoryRoutes = require('./routes/memory');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/notebooks', notebookRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/gaps', gapsRoutes);
app.use('/api/mindmap', mindmapRoutes);
app.use('/api/flashcards', flashcardsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/podcast', podcastRoutes);
app.use('/api/memory', memoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
