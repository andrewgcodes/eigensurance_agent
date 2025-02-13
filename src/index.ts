import { createAgent } from './agent/createAgent.js';

async function main() {
  try {
    console.log('🤖 Initializing AI Agent...');
    const agent = await createAgent();

    // Example 1: Generate verifiable text
    console.log('\n📝 Generating verifiable text...');
    const prompt = 'What is the capital of France?';
    const textResult = await agent.generateVerifiableText(prompt);
    console.log('Response:', textResult.content);
    console.log('Proof available:', !!textResult.proof);

    // Example 2: Verify location (using Paris coordinates)
    console.log('\n📍 Verifying location...');
    const locationResult = await agent.verifyLocation(48.8566, 2.3522);
    console.log('Location verified:', locationResult.isValid);
    console.log('Proof available:', !!locationResult.proof);

    // Example 3: Log custom information
    console.log('\n📊 Logging custom information...');
    await agent.logInfo('Demo Completed', {
      timestamp: new Date().toISOString(),
      status: 'success'
    });

    console.log('\n✅ Demo completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 