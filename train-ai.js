async function trainAI() {
  const { ProfessionalEnglishTrainer } = require('./lib/trainer');
  const trainer = new ProfessionalEnglishTrainer();

  const sampleQueries = [
    {
      input: "How do I list an item?",
      expectedStyle: "formal",
      domain: "listings"
    },
    {
      input: "Is trading safe?",
      expectedStyle: "analytical",
      domain: "safety"
    },
    {
      input: "What states are covered?",
      expectedStyle: "informative",
      domain: "locations"
    }
  ];

  console.log("Training AI with professional English patterns...");
  
  for (const query of sampleQueries) {
    const enhanced = await trainer.enhanceResponse(
      "Sample response about " + query.domain,
      { formal: query.expectedStyle === "formal" }
    );
    console.log(`Input: ${query.input}`);
    console.log(`Enhanced: ${enhanced}\n`);
  }

  console.log("Training complete. Professional vocabulary patterns loaded.");
}

trainAI().catch(console.error);