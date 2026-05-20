#!/usr/bin/env python3
"""
TradeByBater AI Quick Test
Run: python test_ai.py
"""

import sys
sys.path.insert(0, '/home/l2euser/TradeByBater')

from ai_assistant import AIOrchestrator

def test():
    print("🤖 Testing TradeByBater AI (Python Version)...\n")
    
    ai = AIOrchestrator()
    
    queries = [
        "Hi, how do I list something?",
        "Is trading safe?",
        "Which states are supported?",
        "What does it cost?",
        "How to trade items?"
    ]
    
    for q in queries:
        print(f"Q: {q}")
        r = ai.process_query(q)
        print(f"A: {r.text[:80]}...")
        print(f"   Provider: {r.provider}, Confidence: {r.confidence}\n")

if __name__ == "__main__":
    test()