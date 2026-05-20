# TradeByBater AI System

A sophisticated AI-powered trading assistant for Nigeria's premier barter platform.

## Features

- **Multi-Provider AI Integration**: Works with OpenAI (ChatGPT), Anthropic (Claude), Ollama (local), and built-in knowledge base
- **Professional English**: Formal, intelligent responses with sophisticated vocabulary
- **Highly Responsive**: Fast responses optimized for trading inquiries
- **Extremely Smart**: Combines multiple AI models with fallback systems
- **Zero-Fee Trading Support**: Expert knowledge of barter economics

## Installation

```bash
npm install
cp .env.example .env
# Edit .env with your API keys
```

## Running

```bash
# Development mode
npm run dev

# Production
npm start

# Test the AI
npm test
```

## API Endpoints

### POST /api/ai
Process a query and get an AI response.

```json
{
  "message": "How do I list an item?",
  "context": {
    "userId": "optional",
    "formal": true
  }
}
```

Response:
```json
{
  "reply": "Greetings. To create a listing...",
  "provider": "openai",
  "confidence": 0.95
}
```

### GET /api/health
Check system status and available providers.

## Configuration

Set environment variables in `.env`:

- `OPENAI_API_KEY` - ChatGPT API key
- `CLAUDE_API_KEY` - Anthropic Claude API key  
- `OLLAMA_URL` - Local Ollama server (optional)
- `PORT` - Server port (default: 3000)

## Architecture

```
server.js              - Express server
lib/
  ai-providers.js      - Multi-provider AI integration
  trainer.js           - Professional English training
  logger.js            - Logging system
```

## AI Providers (Priority Order)

1. OpenAI (GPT-4) - Primary
2. Claude (Anthropic) - Secondary
3. Ollama (Local) - Offline fallback
4. Knowledge Base - Always available

## Professional English Profile

The AI uses formal English with:
- Sophisticated vocabulary
- Analytical sentence structures
- Professional greeting and closing patterns
- Context-aware tone adaptation