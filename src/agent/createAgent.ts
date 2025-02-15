// @ts-ignore
import { OpacityAdapter } from '@layr-labs/agentkit-opacity';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Verify required environment variables
const requiredEnvVars = [
  'OPACITY_OPENAI_KEY',
  'OPACITY_TEAM_ID',
  'OPACITY_TEAM_NAME',
  'OPACITY_PROVER_URL',
  'PERPLEXITY_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export interface ClaimVerificationResponse {
  verdict: 'APPROVE' | 'DENY';
  reason: string;
  confidence: number;
  proof?: any;
  verificationData?: {
    wildfireData?: any;
    propertyData?: any;
    weatherData?: any;
    factCheckData?: any;
  };
}

export interface InsuranceClaim {
  claimId: string;
  policyNumber: string;
  claimDate: string;
  location: string;
  description: string;
  estimatedDamage: number;
}

// Known historical wildfires for simulation
const HISTORICAL_WILDFIRES = [
  {
    name: "Camp Fire",
    location: "Paradise, California",
    startDate: "2018-11-08",
    endDate: "2018-11-25",
    totalAcres: 153336,
    structures: {
      destroyed: 18804,
      damaged: 674
    },
    conditions: {
      windSpeed: "50 mph",
      humidity: "10-20%",
      temperature: "80°F"
    }
  },
  {
    name: "Dixie Fire",
    location: "Butte County, California",
    startDate: "2021-07-13",
    endDate: "2021-10-25",
    totalAcres: 963309,
    structures: {
      destroyed: 1329,
      damaged: 95
    },
    conditions: {
      windSpeed: "30-40 mph",
      humidity: "15-25%",
      temperature: "85°F"
    }
  }
];

// Property value ranges by area
const PROPERTY_VALUES = {
  "Paradise, California": {
    averageValue: 425000,
    priceRange: {
      min: 300000,
      max: 750000
    },
    valueHistory: {
      "2018": 450000,
      "2019": 350000,
      "2020": 375000,
      "2021": 400000,
      "2022": 425000
    }
  },
  "Butte County, California": {
    averageValue: 475000,
    priceRange: {
      min: 350000,
      max: 850000
    },
    valueHistory: {
      "2018": 500000,
      "2019": 450000,
      "2020": 460000,
      "2021": 470000,
      "2022": 475000
    }
  }
};

class VerificationTools {
  async checkWildfireHistory(location: string, date: string): Promise<any> {
    try {
      // Simulate API response with historical data
      const dateObj = new Date(date);
      const wildfires = HISTORICAL_WILDFIRES.filter(fire => {
        const fireStart = new Date(fire.startDate);
        const fireEnd = new Date(fire.endDate);
        return (
          fire.location.toLowerCase().includes(location.toLowerCase()) &&
          dateObj >= fireStart &&
          dateObj <= fireEnd
        );
      });

      return {
        status: "success",
        timestamp: new Date().toISOString(),
        data: {
          wildfires: wildfires,
          totalFound: wildfires.length,
          locationMatch: wildfires.length > 0
        }
      };
    } catch (error: any) {
      console.error('Error checking wildfire history:', error);
      return null;
    }
  }

  async getPropertyValue(location: string): Promise<any> {
    try {
      // Simulate property value lookup
      const propertyData = PROPERTY_VALUES[location as keyof typeof PROPERTY_VALUES] || {
        averageValue: 500000,
        priceRange: {
          min: 350000,
          max: 800000
        },
        valueHistory: {
          "2022": 500000
        }
      };

      return {
        status: "success",
        timestamp: new Date().toISOString(),
        data: {
          location,
          propertyData,
          confidence: 0.9
        }
      };
    } catch (error: any) {
      console.error('Error getting property value:', error);
      return null;
    }
  }

  async getWeatherHistory(location: string, date: string): Promise<any> {
    try {
      // Find if there was a wildfire during this time
      const wildfire = HISTORICAL_WILDFIRES.find(fire => {
        const dateObj = new Date(date);
        const fireStart = new Date(fire.startDate);
        const fireEnd = new Date(fire.endDate);
        return (
          fire.location.toLowerCase().includes(location.toLowerCase()) &&
          dateObj >= fireStart &&
          dateObj <= fireEnd
        );
      });

      // Simulate weather conditions based on historical data
      const weatherData = wildfire ? {
        date,
        location,
        conditions: wildfire.conditions,
        fireRiskLevel: "Extreme",
        warnings: ["Red Flag Warning in effect"],
        historicalComparison: "Above average fire risk"
      } : {
        date,
        location,
        conditions: {
          windSpeed: "10-15 mph",
          humidity: "45-55%",
          temperature: "72°F"
        },
        fireRiskLevel: "Low",
        warnings: [],
        historicalComparison: "Normal conditions"
      };

      return {
        status: "success",
        timestamp: new Date().toISOString(),
        data: weatherData
      };
    } catch (error: any) {
      console.error('Error getting weather history:', error);
      return null;
    }
  }

  async factCheckWithPerplexity(query: string): Promise<any> {
    try {
      console.log('Sending fact-check query to Perplexity:', query);
      
      const requestBody = {
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a fact-checking assistant focused on verifying wildfire incidents. Provide specific dates, locations, and damage information when available."
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.0,
        max_tokens: 1000,
        top_p: 0.9
      };

      console.log('Perplexity API request:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Perplexity API response:', JSON.stringify(response.data, null, 2));

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        console.error('Unexpected Perplexity API response format:', response.data);
        return {
          content: "Unable to fact-check due to API response format issue",
          citations: []
        };
      }

      return {
        content: response.data.choices[0].message.content,
        citations: response.data.citations || []
      };
    } catch (error: any) {
      console.error('Error fact-checking with Perplexity:', error.response?.data || error.message);
      return {
        content: `Error during fact-checking: ${error.response?.data?.error || error.message}`,
        citations: []
      };
    }
  }
}

const SEARCH_QUERY_PROMPT = `You are an insurance claim investigator. Based on the claim details, create a specific search query to fact-check the wildfire incident.
Focus on verifying:
1. The occurrence of the wildfire at the specified location and date
2. The extent of damage in the area
3. Weather conditions during the incident

Format your response as a single, specific search query.

Claim details:
`;

const FINAL_VERIFICATION_PROMPT = `You are an AI insurance claim verification agent specializing in wildfire damage claims. 
You have access to multiple sources of verification:

1. Historical wildfire data
2. Property value data
3. Weather condition data
4. Web-based fact-checking results

Your task is to analyze all available information and provide a final verdict (APPROVE or DENY) based on the following criteria:
1. Evidence of wildfire damage in the description
2. Location and date match verified wildfire incidents
3. Damage estimate appears reasonable compared to property value
4. Weather conditions support wildfire occurrence
5. Web-based fact-checking confirms the incident details

Respond in the following format:
VERDICT: [APPROVE or DENY]
REASON: [Detailed explanation of decision, referencing all data sources]
CONFIDENCE: [Number between 0 and 1]

Available verification data:
`;

export async function createAgent() {
  const opacityAdapter = new OpacityAdapter({
    apiKey: process.env.OPACITY_OPENAI_KEY!,
    teamId: process.env.OPACITY_TEAM_ID!,
    teamName: process.env.OPACITY_TEAM_NAME!,
    opacityProverUrl: process.env.OPACITY_PROVER_URL!
  });

  const tools = new VerificationTools();

  return {
    verifyInsuranceClaim: async (claim: InsuranceClaim): Promise<ClaimVerificationResponse> => {
      try {
        // Step 1: Generate search query for fact-checking
        const searchQueryPrompt = SEARCH_QUERY_PROMPT + JSON.stringify(claim, null, 2);
        const searchQueryResponse = await opacityAdapter.generateText(searchQueryPrompt);
        const searchQuery = searchQueryResponse.content.trim();

        // Step 2: Gather all verification data
        const [wildfireData, propertyData, weatherData, factCheckData] = await Promise.all([
          tools.checkWildfireHistory(claim.location, claim.claimDate),
          tools.getPropertyValue(claim.location),
          tools.getWeatherHistory(claim.location, claim.claimDate),
          tools.factCheckWithPerplexity(searchQuery)
        ]);

        // Step 3: Make final verification decision
        const verificationDetails = `
Verification Data:
1. Wildfire History: ${JSON.stringify(wildfireData, null, 2)}
2. Property Value: ${JSON.stringify(propertyData, null, 2)}
3. Weather History: ${JSON.stringify(weatherData, null, 2)}
4. Fact-Check Results: ${JSON.stringify(factCheckData, null, 2)}

Search Query Used: "${searchQuery}"

Claim Details:
Claim ID: ${claim.claimId}
Policy Number: ${claim.policyNumber}
Date: ${claim.claimDate}
Location: ${claim.location}
Estimated Damage: $${claim.estimatedDamage.toLocaleString()}
Description: ${claim.description}
`;

        const finalPrompt = FINAL_VERIFICATION_PROMPT + verificationDetails;
        const response = await opacityAdapter.generateText(finalPrompt);

        // Parse the response
        const lines = response.content.split('\n');
        const verdict = lines.find((line: string) => line.startsWith('VERDICT:'))?.split(':')[1].trim() as 'APPROVE' | 'DENY';
        const reason = lines.find((line: string) => line.startsWith('REASON:'))?.split(':')[1].trim() || '';
        const confidence = parseFloat(lines.find((line: string) => line.startsWith('CONFIDENCE:'))?.split(':')[1].trim() || '0');

        return {
          verdict,
          reason,
          confidence,
          proof: response.proof,
          verificationData: {
            wildfireData,
            propertyData,
            weatherData,
            factCheckData
          }
        };
      } catch (error) {
        console.error('Error verifying insurance claim:', error);
        throw error;
      }
    }
  };
} 