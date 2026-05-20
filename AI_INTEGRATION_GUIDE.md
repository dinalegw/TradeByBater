# TradeByBater AI Integration Guide

## Overview
This AI system provides an intelligent, professional, and highly responsive trading assistant for the TradeByBater barter platform.

## Files Created

| File | Purpose |
|------|---------|
| `tradebybater-ai.js` | Standalone browser AI (no backend required) |
| `ai_assistant.py` | Python Flask backend with multi-provider support |
| `server.js` | Node.js backend (requires npm install) |
| `lib/ai-providers.js` | Multi-AI provider integration |
| `lib/trainer.js` | Professional English training system |
| `AI_TEST_SCRIPT.js` | Browser console test script |
| `test_ai.py` | Python test script |

## Usage

### Browser-Only (Recommended)
No installation required. The AI works directly in the browser:

```html
<script src="tradebybater-ai.js"></script>
<script>
  const ai = new TradeByBaterAI();
  const response = await ai.processQuery("How do I list something?");
  console.log(response.text);
</script>
```

### With Python Backend
```bash
pip install -r requirements.txt
python ai_assistant.py
```

### With Node.js Backend
```bash
npm install
npm start
```

## AI Providers (Priority Order)
1. OpenAI (ChatGPT) - Set `OPENAI_API_KEY`
2. Anthropic (Claude) - Set `CLAUDE_API_KEY`
3. Ollama (Local) - Set `OLLAMA_URL`
4. Knowledge Base - Always available fallback

## Professional English Features
- Formal greetings and conclusions
- Sophisticated vocabulary (utilize, facilitate, optimize)
- Analytical sentence structures
- Context-aware tone adaptation

## Test the AI
Open the HTML file in a browser and run in console:
```javascript
runTests();
```