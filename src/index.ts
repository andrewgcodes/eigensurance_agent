import { createAgent, InsuranceClaim } from './agent/createAgent.js';

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function verifyAndPrintClaim(agent: any, claim: InsuranceClaim) {
  console.log('\n=== Processing Claim ===');
  console.log('Claim Details:');
  console.log(JSON.stringify(claim, null, 2));
  
  const result = await agent.verifyInsuranceClaim(claim);
  
  console.log('\nVerification Result:');
  console.log('Verdict:', result.verdict);
  console.log('Reason:', result.reason);
  console.log('Confidence:', result.confidence);
  console.log('Cryptographic Proof:', result.proof ? 'Generated ✓' : 'Not Available ✗');
  
  // Print relevant verification data
  if (result.verificationData?.wildfireData?.data?.wildfires) {
    console.log('\nMatched Wildfires:', 
      result.verificationData.wildfireData.data.wildfires.map((fire: any) => fire.name).join(', ') || 'None');
  }

  // Print fact-checking results
  if (result.verificationData?.factCheckData) {
    console.log('\nFact-Check Results:');
    console.log('Content:', result.verificationData.factCheckData.content);
    if (result.verificationData.factCheckData.citations?.length > 0) {
      console.log('Sources:', result.verificationData.factCheckData.citations.join(', '));
    }
  }
}

async function main() {
  try {
    const agent = await createAgent();

    // Test Case 1: Legitimate Camp Fire Claim
    const legitimateClaim: InsuranceClaim = {
      claimId: "WF-2018-001",
      policyNumber: "POL-123456",
      claimDate: "2018-11-10",
      location: "Paradise, California",
      description: "Total loss of primary residence due to Camp Fire. Structure completely burned down with all contents destroyed. Smoke damage to remaining foundation.",
      estimatedDamage: 450000
    };

    // Test Case 2: Fraudulent Claim (Wrong Date)
    const wrongDateClaim: InsuranceClaim = {
      claimId: "WF-2023-001",
      policyNumber: "POL-789012",
      claimDate: "2023-03-15",
      location: "Paradise, California",
      description: "House destroyed by wildfire, complete loss of structure and contents.",
      estimatedDamage: 500000
    };

    // Test Case 3: Fraudulent Claim (Wrong Location)
    const wrongLocationClaim: InsuranceClaim = {
      claimId: "WF-2018-002",
      policyNumber: "POL-345678",
      claimDate: "2018-11-12",
      location: "San Francisco, California",
      description: "Property damaged by Camp Fire with severe structural damage and smoke damage.",
      estimatedDamage: 600000
    };

    // Test Case 4: Legitimate Dixie Fire Claim
    const dixieFireClaim: InsuranceClaim = {
      claimId: "WF-2021-001",
      policyNumber: "POL-901234",
      claimDate: "2021-07-20",
      location: "Butte County, California",
      description: "Partial damage to property from Dixie Fire. Significant smoke damage and destruction of outbuildings. Main structure partially damaged.",
      estimatedDamage: 350000
    };

    // Test Case 5: Suspicious Claim (Excessive Damage Amount)
    const excessiveClaim: InsuranceClaim = {
      claimId: "WF-2021-002",
      policyNumber: "POL-567890",
      claimDate: "2021-07-25",
      location: "Butte County, California",
      description: "Minor smoke damage from Dixie Fire to exterior of property.",
      estimatedDamage: 900000
    };

    console.log('Testing Enhanced Wildfire Insurance Claims Verification System');
    console.log('==========================================================');
    console.log('Now including web-based fact-checking through Perplexity API');
    console.log('==========================================================\n');

    // Process claims with delay between each
    await verifyAndPrintClaim(agent, legitimateClaim);
    await delay(2000); // 2 second delay between claims
    
    await verifyAndPrintClaim(agent, wrongDateClaim);
    await delay(2000);
    
    await verifyAndPrintClaim(agent, wrongLocationClaim);
    await verifyAndPrintClaim(agent, dixieFireClaim);
    await verifyAndPrintClaim(agent, excessiveClaim);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 