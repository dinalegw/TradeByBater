const axios = require('axios');
const NodeCache = require('node-cache');
const { logger } = require('./logger');

class AIProvider {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.enabled = config.enabled !== false;
    this.priority = config.priority || 99;
  }

  async generateResponse(message, context) {
    throw new Error('Not implemented');
  }

  getStatus() {
    return { name: this.name, enabled: this.enabled, priority: this.priority };
  }
}

class OpenAIProvider extends AIProvider {
  constructor(config) {
    super('openai', config);
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4-turbo-preview';
  }

  async generateResponse(message, context) {
    if (!this.apiKey) throw new Error('OpenAI API key not configured');
    
    const systemPrompt = `You are the TradeByBater AI Assistant, a highly intelligent, professional, and responsive AI for Nigeria's premier barter trading platform. 

Key traits:
- Use formal, professional English with clear, concise responses
- Be extremely knowledgeable about barter trading, Nigerian markets, and economics
- Respond with high intelligence and analytical precision
- Always provide actionable, helpful information
- Adapt tone to be warm yet professional
- Support all 36 Nigerian states + FCT

Platform details:
- Zero-fee barter marketplace
- Trade goods, skills, and services
- AI-powered matching and fraud detection
- Safety features include phone verification and escrow

Context: ${JSON.stringify(context)}`;

    const response = await axios.post(
      `${this.baseURL}/chat/completions`,
      {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      text: response.data.choices[0].message.content,
      provider: 'openai',
      confidence: 0.95
    };
  }
}

class ClaudeProvider extends AIProvider {
  constructor(config) {
    super('claude', config);
    this.apiKey = config.apiKey || process.env.CLAUDE_API_KEY;
    this.baseURL = config.baseURL || 'https://api.anthropic.com/v1';
    this.model = config.model || 'claude-3-opus-20240229';
  }

  async generateResponse(message, context) {
    if (!this.apiKey) throw new Error('Claude API key not configured');
    
    const systemPrompt = `You are the TradeByBater AI Assistant for Nigeria's premier barter platform. Respond with formal, professional English. Be highly intelligent, analytical, and extremely helpful. Key details: Zero-fee trading across all 36 Nigerian states, trade goods/skills/services, AI matching, fraud detection, phone verification. Context: ${JSON.stringify(context)}`;

    const response = await axios.post(
      `${this.baseURL}/messages`,
      {
        model: this.model,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return {
      text: response.data.content[0].text,
      provider: 'claude',
      confidence: 0.92
    };
  }
}

class OllamaProvider extends AIProvider {
  constructor(config) {
    super('ollama', config);
    this.baseURL = config.baseURL || 'http://localhost:11434';
    this.model = config.model || 'llama3';
  }

  async generateResponse(message, context) {
    const systemPrompt = `You are the TradeByBater AI Assistant. Use formal, professional English. Be highly intelligent and responsive.`;
    
    const response = await axios.post(
      `${this.baseURL}/api/chat`,
      {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        stream: false
      }
    );

    return {
      text: response.data.message.content,
      provider: 'ollama',
      confidence: 0.85
    };
  }
}

class LocalKnowledgeProvider extends AIProvider {
  constructor(config) {
    super('knowledge', config);
    this.cache = new NodeCache({ stdTTL: 300 });
    this.knowledgeBase = this.initializeKnowledge();
  }

  initializeKnowledge() {
    return {
      greetings: {
        keywords: ['hi', 'hello', 'hey', 'greetings'],
        responses: [
          'Greetings! I am the TradeByBater AI Assistant. How may I assist you with your barter trading inquiries today?',
          'Hello! Welcome to TradeByBater. I am here to help you navigate Nigeria\'s premier barter platform. What can I do for you?'
        ]
      },
      listing: {
        keywords: ['list', 'post', 'create listing', 'how to sell'],
        responses: [
          'To create a listing on TradeByBater: 1) Click "Create Listing", 2) Describe your item clearly with specifics, 3) Select an appropriate category, 4) Specify what you seek in exchange, 5) Add high-quality photographs, 6) Publish. Your listing will be visible nationwide immediately.',
          'Listing creation is straightforward: Navigate to "Post Something", provide comprehensive details about your item or service, indicate your preferred trade, and publish instantly across all 36 Nigerian states.'
        ]
      },
      trading: {
        keywords: ['trade', 'exchange', 'barter', 'how to trade'],
        responses: [
          'To execute a trade: 1) Browse available listings by category or location, 2) Identify items of interest, 3) Submit a trade proposal with your offer, 4) Negotiate terms if necessary, 5) Confirm mutual agreement, 6) Arrange exchange. The platform supports direct value exchange without monetary transactions.',
          'Trading on TradeByBater is efficient: Discover items via search or browsing, propose trades directly, negotiate mutually beneficial terms, and complete the exchange. Our AI facilitates optimal matching.'
        ]
      },
      locations: {
        keywords: ['location', 'state', 'where', 'available'],
        responses: [
          'TradeByBater operates comprehensively across all 36 Nigerian states plus the Federal Capital Territory. Our platform serves Lagos, Abuja, Port Harcourt, Kano, Ibadan, Enugu, and every state in between. Geographical boundaries do not restrict your trading potential.',
          'Our services extend nationwide: All 36 states including Lagos, Kano, Rivers, Oyo, and FCT are fully supported. Cross-state barter trading is seamless and encouraged.'
        ]
      },
      safety: {
        keywords: ['safe', 'scam', 'security', 'trust'],
        responses: [
          'Security measures include: Mandatory phone verification for all traders, AI-powered fraud detection monitoring listing patterns, user rating and review systems, optional escrow services for high-value exchanges, and dedicated dispute resolution support. Trade with confidence.',
          'TradeByBater prioritizes safety: Every user verifies via phone number, our AI detects suspicious activity, transparent rating systems ensure accountability, and escrow protection secures valuable trades. Your security is paramount.'
        ]
      },
      fees: {
        keywords: ['cost', 'fee', 'price', 'free', 'charge'],
        responses: [
          'TradeByBater operates with zero transaction fees. Creating listings, browsing, and executing trades incur no costs. Premium optional features include listing boosts (₦500-₦2000) and verified trader badges (₦1000/month). The core platform remains entirely free.',
          'Platform access is completely free of charge. Post listings, trade goods, and communicate with traders at no cost. Optional premium features for enhanced visibility are available for those seeking additional benefits.'
        ]
      }
    };
  }

  async generateResponse(message, context) {
    const msg = message.toLowerCase();
    
    for (const [key, data] of Object.entries(this.knowledgeBase)) {
      for (const keyword of data.keywords) {
        if (msg.includes(keyword)) {
          const response = data.responses[
            Math.floor(Math.random() * data.responses.length)
          ];
          return {
            text: response,
            provider: 'knowledge',
            confidence: 0.8,
            suggestions: ['List an item', 'Find trades', 'Safety info']
          };
        }
      }
    }

    return {
      text: "Thank you for your inquiry. I am the TradeByBater AI Assistant, here to assist with barter trading questions. Could you please provide more details about your specific interest regarding listings, trading, safety, or platform features?",
      provider: 'knowledge',
      confidence: 0.7,
      suggestions: ['How to list items', 'Trading process', 'Safety measures']
    };
  }
}

class AIOrchestrator {
  constructor() {
    this.providers = [];
    this.localFallback = new LocalKnowledgeProvider({});
    this.initializeProviders();
  }

  initializeProviders() {
    const providers = [];

    if (process.env.OPENAI_API_KEY) {
      providers.push(new OpenAIProvider({ priority: 1 }));
    }

    if (process.env.CLAUDE_API_KEY) {
      providers.push(new ClaudeProvider({ priority: 2 }));
    }

    providers.push(new OllamaProvider({ priority: 99, enabled: !!process.env.OLLAMA_URL }));
    providers.sort((a, b) => a.priority - b.priority);

    this.providers = providers;
  }

  async processQuery(message, context = {}) {
    for (const provider of this.providers) {
      if (!provider.enabled) continue;

      try {
        logger.info(`Trying provider: ${provider.name}`);
        const result = await provider.generateResponse(message, context);
        logger.info(`Provider ${provider.name} succeeded`);
        return result;
      } catch (error) {
        logger.warn(`Provider ${provider.name} failed:`, error.message);
        continue;
      }
    }

    return await this.localFallback.generateResponse(message, context);
  }

  getProviderStatus() {
    return this.providers.map(p => p.getStatus());
  }
}

module.exports = {
  AIProvider,
  OpenAIProvider,
  ClaudeProvider,
  OllamaProvider,
  LocalKnowledgeProvider,
  AIOrchestrator
};