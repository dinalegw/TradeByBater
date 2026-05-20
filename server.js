require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { AIOrchestrator } = require('./lib/ai-providers');
const { logger } = require('./lib/logger');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize AI Orchestrator
const aiOrchestrator = new AIOrchestrator();

// Rate limiting (simple in-memory)
const rateLimit = new Map();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60000; // 1 minute

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];
  const recent = userRequests.filter(t => now - t < RATE_WINDOW);
  
  if (recent.length >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  recent.push(now);
  rateLimit.set(ip, recent);
  next();
});

// API Routes
app.post('/api/ai', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    logger.info('AI request received', { 
      messageLength: message.length, 
      userId: context.userId 
    });
    
    const response = await aiOrchestrator.processQuery(message, context);
    
    res.json({
      reply: response.text,
      provider: response.provider,
      confidence: response.confidence,
      suggestions: response.suggestions || []
    });
  } catch (error) {
    logger.error('AI endpoint error', { error: error.message });
    res.status(500).json({ 
      error: 'AI processing failed',
      reply: "I'm experiencing technical difficulties. Please try again later."
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    providers: aiOrchestrator.getProviderStatus(),
    timestamp: new Date().toISOString()
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  logger.info(`TradeByBater AI server running on port ${PORT}`);
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = { app, aiOrchestrator };