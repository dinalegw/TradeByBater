import os
import random
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from cachetools import TTLCache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AIResponse:
    text: str
    provider: str
    confidence: float
    suggestions: List[str] = None

class ProfessionalEnglishTrainer:
    def __init__(self):
        self.formal_greetings = [
            "Greetings. How may I assist you today?",
            "Good day. I am here to support your trading endeavors.",
            "Welcome. What trading assistance do you require?"
        ]
        self.formal_closings = [
            "Is there anything further I may address?",
            "Please let me know if you require additional information.",
            "I am here to ensure your trading success."
        ]
        
    def enhance(self, text: str, formal: bool = True) -> str:
        if not formal:
            return text
            
        greeting = random.choice(self.formal_greetings)
        closing = random.choice(self.formal_closings)
        return f"{greeting} {text} {closing}"

class KnowledgeBaseProvider:
    def __init__(self):
        self.trainer = ProfessionalEnglishTrainer()
        self.knowledge = {
            "greetings": {
                "keywords": ["hi", "hello", "hey", "greetings"],
                "responses": [
                    "I am the TradeByBater AI Assistant. How may I assist you with your barter trading inquiries?",
                    "Greetings! Welcome to TradeByBater. I am here to help you navigate Nigeria's premier barter platform."
                ]
            },
            "listing": {
                "keywords": ["list", "post", "create", "sell", "item"],
                "responses": [
                    "To create a listing: 1) Click 'Create Listing', 2) Describe your item comprehensively, 3) Select a category, 4) Specify what you seek in exchange, 5) Add photographs, 6) Publish. Your listing reaches traders nationwide immediately.",
                    "Listing creation is straightforward. Navigate to 'Post Something', provide detailed item information, indicate your preferred trade, and publish instantly across all 36 Nigerian states."
                ]
            },
            "trading": {
                "keywords": ["trade", "exchange", "barter", "negotiate"],
                "responses": [
                    "To execute a trade: Browse listings, identify items of interest, submit a trade proposal, negotiate terms if needed, confirm agreement, and arrange exchange.",
                    "Trading is efficient: Discover items via search, propose trades directly, negotiate mutually beneficial terms, and complete the exchange."
                ]
            },
            "locations": {
                "keywords": ["where", "location", "state", "nigeria", "available"],
                "responses": [
                    "TradeByBater operates across all 36 Nigerian states plus FCT. Major hubs include Lagos, Abuja, Port Harcourt, Kano, Ibadan, and Enugu.",
                    "Our services extend nationwide. All Nigerian states from Lagos to Borno are fully supported."
                ]
            },
            "safety": {
                "keywords": ["safe", "scam", "security", "trust", "protect"],
                "responses": [
                    "Security includes phone verification, AI fraud detection, user ratings, optional escrow for high-value trades, and dispute mediation.",
                    "We prioritize safety through mandatory phone verification, AI monitoring, transparent ratings, and escrow protection for valuable items."
                ]
            },
            "pricing": {
                "keywords": ["cost", "fee", "price", "free", "charge", "money"],
                "responses": [
                    "TradeByBater is completely free. No fees for listings, browsing, or trading. Optional premium features include listing boosts and verified badges.",
                    "Platform access is free. Post listings, trade goods, and communicate at zero cost."
                ]
            }
        }
        
    def get_response(self, message: str) -> AIResponse:
        msg_lower = message.lower()
        
        for _, data in self.knowledge.items():
            for keyword in data["keywords"]:
                if keyword in msg_lower:
                    text = random.choice(data["responses"])
                    return AIResponse(
                        text=text,
                        provider="knowledge",
                        confidence=0.85,
                        suggestions=["List an item", "Find trades", "Safety info"]
                    )
                    
        return AIResponse(
            text="Thank you for your inquiry. I am the TradeByBater AI Assistant. How may I assist you with listings, trading, or platform features?",
            provider="knowledge",
            confidence=0.7
        )

class OpenAIProvider:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.enabled = bool(self.api_key)
        
    def get_response(self, message: str, context: str = "") -> Optional[AIResponse]:
        if not self.enabled:
            return None
            
        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4-turbo-preview",
                    "messages": [
                        {"role": "system", "content": "You are the TradeByBater AI Assistant. Use formal, professional English. Be highly intelligent and responsive."},
                        {"role": "user", "content": message}
                    ],
                    "max_tokens": 500,
                    "temperature": 0.7
                },
                timeout=10
            )
            data = response.json()
            return AIResponse(
                text=data["choices"][0]["message"]["content"],
                provider="openai",
                confidence=0.95
            )
        except Exception as e:
            logger.warning(f"OpenAI failed: {e}")
            return None

class ClaudeProvider:
    def __init__(self):
        self.api_key = os.getenv("CLAUDE_API_KEY")
        self.enabled = bool(self.api_key)
        
    def get_response(self, message: str, context: str = "") -> Optional[AIResponse]:
        if not self.enabled:
            return None
            
        try:
            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.api_key,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": "claude-3-opus-20240229",
                    "system": "You are the TradeByBater AI Assistant. Use formal, professional English.",
                    "messages": [{"role": "user", "content": message}],
                    "max_tokens": 500
                },
                timeout=10
            )
            data = response.json()
            return AIResponse(
                text=data["content"][0]["text"],
                provider="claude",
                confidence=0.92
            )
        except Exception as e:
            logger.warning(f"Claude failed: {e}")
            return None

class AIOrchestrator:
    def __init__(self):
        self.providers = []
        self.fallback = KnowledgeBaseProvider()
        self.trainer = ProfessionalEnglishTrainer()
        
        # Initialize providers in priority order
        self.providers.append(OpenAIProvider())
        self.providers.append(ClaudeProvider())
        
    def process_query(self, message: str, context: Dict = None) -> AIResponse:
        context = context or {}
        
        for provider in self.providers:
            if not provider.enabled:
                continue
            result = provider.get_response(message, context.get("userContext", ""))
            if result:
                result.text = self.trainer.enhance(result.text, context.get("formal", True))
                return result
                
        # Fallback to knowledge base
        result = self.fallback.get_response(message)
        result.text = self.trainer.enhance(result.text, context.get("formal", True))
        return result

# Flask app
app = Flask(__name__)
CORS(app)
orchestrator = AIOrchestrator()

@app.route("/api/ai", methods=["POST"])
def ai_endpoint():
    data = request.json
    message = data.get("message", "")
    context = data.get("context", {})
    
    if not message:
        return jsonify({"error": "Message required"}), 400
        
    response = orchestrator.process_query(message, context)
    
    return jsonify({
        "reply": response.text,
        "provider": response.provider,
        "confidence": response.confidence,
        "suggestions": response.suggestions or []
    })

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "providers": [p.__class__.__name__ for p in orchestrator.providers]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 3000)))