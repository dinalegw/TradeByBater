// TradeByBater AI Test Script
// Run in browser console: copy and paste into browser DevTools

const testCases = [
  { query: 'hi', expected: 'Greeting response' },
  { query: 'hello there', expected: 'Greeting response' },
  { query: 'whats your name', expected: 'Identity response' },
  { query: 'who are you', expected: 'Identity response' },
  { query: 'how do i list something', expected: 'Listing guide' },
  { query: 'how to post an item', expected: 'Listing guide' },
  { query: 'how to trade', expected: 'Trading guide' },
  { query: 'find a listing', expected: 'Trading guide' },
  { query: 'which states are available', expected: 'Location info' },
  { query: 'is it free', expected: 'Cost info' },
  { query: 'what about scams', expected: 'Safety info' },
  { query: 'do i need a bank', expected: 'Payment method info' },
  { query: 'what categories exist', expected: 'Category info' },
  { query: 'how do i build reputation', expected: 'Trust info' },
  { query: 'nigerian barter', expected: 'Cultural info' },
  { query: 'getting started', expected: 'Onboarding info' },
  { query: 'random question xyz', expected: 'Smart fallback' }
];

async function runTests() {
  console.log('🤖 Testing TradeByBater AI System...\n');
  
  const ai = new TradeByBaterAI();
  
  for (const test of testCases) {
    console.log(`\n📝 Query: "${test.query}"`);
    console.log(`✅ Expected: ${test.expected}`);
    
    const response = await ai.processQuery(test.query);
    console.log(`📄 Response: ${response.text.substring(0, 100)}...`);
    console.log(`🔧 Provider: ${response.provider} | Confidence: ${response.confidence}`);
  }
  
  console.log('\n\n✅ All tests completed!');
}

// Auto-run if in browser
if (typeof window !== 'undefined' && window.TradeByBaterAI) {
  runTests();
}