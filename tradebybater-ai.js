/**
 * TradeByBater Advanced AI Assistant
 * Professional, Intelligent, Responsive AI System
 * Best programming language: JavaScript (runs in-browser with zero dependencies)
 */

class ProfessionalEnglishEngine {
  constructor() {
    this.formalPatterns = {
      greetings: [
        "Greetings. How may I assist you today?",
        "Good day. I am here to support your trading endeavors.",
        "Welcome to TradeByBater. How may I be of service?"
      ],
      transitions: [
        "Based on my analysis,",
        "Upon careful consideration,",
        "My evaluation indicates that"
      ],
      conclusions: [
        "Is there anything further I may address?",
        "Please let me know if you require additional information.",
        "I am here to ensure your trading success."
      ]
    };
    this.vocabulary = {
      formal: ["utilize", "facilitate", "optimize", "implement", "coordinate"],
      trading: ["barter exchange", "mutual value transfer", "commodity equivalence"],
      quality: ["exceptional", "distinguished", "superior", "comprehensive"]
    };
  }

  enhance(text, options = {}) {
    if (!text) return text;
    
    let result = text;
    
    if (options.formal) {
      if (!/^(Greetings|Good|Hello)/i.test(text)) {
        result = `${this.random(this.formalPatterns.greetings)} ${text}`;
      }
      if (!/further|additional|assistance/i.test(text)) {
        result = `${result} ${this.random(this.formalPatterns.conclusions)}`;
      }
    }
    
    return result;
  }

  random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

class TradeByBaterAI {
  constructor() {
    this.engine = new ProfessionalEnglishEngine();
    this.knowledgeBase = {
      identity: {
        triggers: ["name", "who are you", "what are you"],
        response: "I am the TradeByBater AI Assistant, an advanced artificial intelligence system designed to facilitate seamless barter trading across Nigeria."
      },
      listing: {
        triggers: ["list", "post", "create listing", "sell", "item"],
        response: "To create a listing, navigate to 'Create Listing', provide comprehensive item details, specify your exchange preferences, add photographs, and publish. Your listing reaches traders across all 36 Nigerian states instantly."
      },
      trading: {
        triggers: ["trade", "exchange", "barter", "negotiate", "offer"],
        response: "Execute trades by browsing listings, identifying items of interest, submitting proposals, negotiating terms if necessary, confirming agreements, and arranging exchanges. Our AI facilitates optimal matching."
      },
      locations: {
        triggers: ["state", "where", "available", "nigeria", "location"],
        response: "TradeByBater operates comprehensively across all 36 Nigerian states plus the Federal Capital Territory, including major hubs: Lagos, Abuja, Port Harcourt, Kano, Ibadan, and Enugu."
      },
      safety: {
        triggers: ["safe", "scam", "security", "trust", "protect", "verified"],
        response: "Safety measures include mandatory phone verification, AI-powered fraud detection, transparent rating systems, optional escrow for high-value trades, and dedicated dispute mediation."
      },
      pricing: {
        triggers: ["cost", "fee", "price", "free", "charge", "money", "expensive"],
        response: "TradeByBater operates with absolutely zero transaction fees. Listing, browsing, and trading are completely free. Optional premium features include listing boosts and verified trader badges."
      },
      payment: {
        triggers: ["bank", "payment", "transfer", "cash", "pay"],
        response: "Barter trading requires no financial transactions. Exchange goods, skills, or services directly without monetary involvement. This empowers traders without banking access."
      },
      categories: {
        triggers: ["category", "what can i trade", "types", "items"],
        response: "TradeByBater supports: Technology & Gadgets, Fashion & Clothing, Home & Furniture, Food & Agriculture, Education & Skills, Transport & Autos, Creative Arts, and Professional Services."
      },
      reputation: {
        triggers: ["reputation", "rating", "trust score", "review"],
        response: "Build reputation through successful trades, earning ratings from trading partners. Higher ratings increase visibility and trading opportunities. Honesty and prompt responses enhance scores."
      },
      gettingStarted: {
        triggers: ["start", "begin", "new", "first time", "getting started"],
        response: "Begin by registering with your phone number, verifying your account, browsing active listings or creating your own, and initiating your first barter exchange within minutes."
      }
    };
  }

  async processQuery(message, context = {}) {
    const msg = message.toLowerCase().trim();
    
    if (!msg) return this.getDefaultResponse();
    
    for (const [key, data] of Object.entries(this.knowledgeBase)) {
      for (const trigger of data.triggers) {
        if (msg.includes(trigger)) {
          let response = data.response;
          response = this.engine.enhance(response, { formal: context.formal !== false });
          return {
            text: response,
            provider: "tradebybater-ai",
            confidence: 0.9,
            suggestions: this.getSuggestions(key)
          };
        }
      }
    }
    
    return this.getDefaultResponse();
  }

  getDefaultResponse() {
    return {
      text: this.engine.enhance(
        "I am the TradeByBater AI Assistant. I specialize in barter trading guidance. Please inquire about listings, trading, safety, locations, or platform features.",
        { formal: true }
      ),
      provider: "tradebybater-ai",
      confidence: 0.7,
      suggestions: ["How listings work", "Trading process", "Safety measures"]
    };
  }

  getSuggestions(topic) {
    const map = {
      listing: ["Create my first listing", "Best listing practices"],
      trading: ["Find trades near me", "Negotiation tips"],
      safety: ["Report a suspicious listing", "Verification levels"],
      categories: ["Browse Tech category", "Services listings"],
      default: ["Getting started", "Platform features", "Safety info"]
    };
    return map[topic] || map.default;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TradeByBaterAI, ProfessionalEnglishEngine };
}

// Browser global
if (typeof window !== 'undefined') {
  window.TradeByBaterAI = TradeByBaterAI;
}

// Usage example:
// const ai = new TradeByBaterAI();
// const response = await ai.processQuery("How do I list something?");
// console.log(response.text);