import sys
sys.path.insert(0, '/home/l2euser/TradeByBater')

from ai_assistant import AIOrchestrator, KnowledgeBaseProvider, ProfessionalEnglishTrainer

test_cases = [
    {"query": "hi", "expected": "Greeting"},
    {"query": "how do i list something", "expected": "Listing guide"},
    {"query": "is trading safe", "expected": "Safety info"},
    {"query": "which states are available", "expected": "Location info"},
    {"query": "is it free", "expected": "Cost info"},
    {"query": "what about scams", "expected": "Safety info"},
    {"query": "what categories exist", "expected": "Category info"},
    {"query": "getting started", "expected": "Onboarding"},
]

def run_tests():
    print("🤖 Testing TradeByBater AI System...\n")
    
    orchestrator = AIOrchestrator()
    
    for test in test_cases:
        print(f"📝 Query: \"{test['query']}\"")
        print(f"✅ Expected: {test['expected']}")
        
        response = orchestrator.process_query(test["query"])
        display = response.text[:100] + "..." if len(response.text) > 100 else response.text
        print(f"📄 Response: {display}")
        print(f"🔧 Provider: {response.provider} | Confidence: {response.confidence}\n")
    
    print("✅ All tests completed!")

if __name__ == "__main__":
    run_tests()