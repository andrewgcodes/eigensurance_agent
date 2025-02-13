import { OpacityAdapter } from '@layr-labs/agentkit-opacity';
import { EigenDAAdapter } from '@layr-labs/agentkit-eigenda';
import { WitnesschainAdapter } from '@layr-labs/agentkit-witnesschain';
import dotenv from 'dotenv';

dotenv.config();

export interface VerifiableResponse {
  content: string;
  proof: any;
}

export interface LocationVerification {
  isValid: boolean;
  proof: any;
}

export class Agent {
  private opacity: OpacityAdapter;
  private eigenDA: EigenDAAdapter;
  private witnesschain: WitnesschainAdapter;

  constructor() {
    // Initialize Opacity adapter for verifiable AI inference
    this.opacity = new OpacityAdapter({
      apiKey: process.env.OPACITY_API_KEY!,
      teamId: process.env.OPACITY_TEAM_ID!,
      teamName: process.env.OPACITY_TEAM_NAME!,
      proverUrl: process.env.OPACITY_PROVER_URL!,
    });

    // Initialize EigenDA adapter for data availability logging
    this.eigenDA = new EigenDAAdapter({
      privateKey: process.env.EIGENDA_PRIVATE_KEY!,
      apiUrl: process.env.EIGENDA_API_URL!,
      baseRpcUrl: process.env.EIGENDA_BASE_RPC_URL!,
      creditsContract: process.env.EIGENDA_CREDITS_CONTRACT!,
      flushIntervalMs: 5000, // Flush logs every 5 seconds
      maxBufferSize: 100, // Maximum number of logs to buffer
    });

    // Initialize Witnesschain adapter for location verification
    this.witnesschain = new WitnesschainAdapter({
      apiKey: process.env.WITNESSCHAIN_API_KEY!,
      apiUrl: process.env.WITNESSCHAIN_API_URL!,
      privateKey: process.env.WITNESSCHAIN_PRIVATE_KEY!,
    });
  }

  /**
   * Generate verifiable text using Opacity and log to EigenDA
   */
  async generateVerifiableText(prompt: string): Promise<VerifiableResponse> {
    try {
      // Generate text with proof using Opacity
      const result = await this.opacity.generateText(prompt);
      
      // Log the generation to EigenDA
      await this.eigenDA.info('Text Generation', {
        prompt,
        result: result.content,
        hasProof: !!result.proof,
      });

      return result;
    } catch (error) {
      await this.eigenDA.error('Text Generation Failed', { prompt, error });
      throw error;
    }
  }

  /**
   * Verify location using Witnesschain and log to EigenDA
   */
  async verifyLocation(latitude: number, longitude: number): Promise<LocationVerification> {
    try {
      // Verify location using Witnesschain
      const verification = await this.witnesschain.verifyLocation(latitude, longitude);
      
      // Log the verification to EigenDA
      await this.eigenDA.info('Location Verification', {
        coordinates: { latitude, longitude },
        verification,
      });

      return verification;
    } catch (error) {
      await this.eigenDA.error('Location Verification Failed', {
        coordinates: { latitude, longitude },
        error,
      });
      throw error;
    }
  }

  /**
   * Utility method to log information directly to EigenDA
   */
  async logInfo(message: string, metadata: any): Promise<void> {
    await this.eigenDA.info(message, metadata);
  }
}

// Export a factory function to create new agent instances
export const createAgent = (): Agent => {
  return new Agent();
}; 