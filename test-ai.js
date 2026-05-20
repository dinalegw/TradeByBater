async function runTests() {
  const { AIOrchestrator } = require('./lib/ai-providers');
  const { ProfessionalEnglishTrainer } = require('./lib/trainer');

  console.log("Running AI System Tests...\n");

  const orchestrator = new AIOrchestrator();
  const trainer = new ProfessionalEnglishTrainer();

  const testQueries = [
    { query: "Hi", expected: "greeting" },
    { query: "How do I list something?", expected: "listing" },
    { query: "Is it safe to trade?", expected: "safety" },
    { query: "Which states are available?", expected: "location" },
    { query: "What does it cost?", expected: "pricing" }
  ];

  for (const { query, expected } of testQueries) {
    console.log(`Q: ${query}`);
    try {
      const response = await orchestrator.processQuery(query);
      console.log(`A: ${response.text.substring(0, 100)}...`);
      console.log(`Provider: ${response.provider}, Confidence: ${response.confidence}\n`);
    } catch (error) {
      console.log(`Error: ${error.message}\n`);
    }
  }

  console.log("Tests completed. Professional English trainer demonstration:");
  const enhanced = await trainer.enhanceResponse(
    "You can list items easily.",
    { formal: true }
  );
  console.log(`Enhanced: ${enhanced}`);
}

runTests().catch(console.error);