import express from 'express';
import cors from 'cors';
import { createAgent, InsuranceClaim } from './agent/createAgent.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

let agent: Awaited<ReturnType<typeof createAgent>>;

// Initialize the agent
createAgent().then(a => {
  agent = a;
  console.log('Agent initialized successfully');
}).catch(error => {
  console.error('Failed to initialize agent:', error);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', agentReady: !!agent });
});

// Verify insurance claim endpoint
app.post('/api/verify-claim', async (req, res) => {
  try {
    if (!agent) {
      return res.status(503).json({ error: 'Agent not ready' });
    }

    const claim: InsuranceClaim = req.body;
    
    // Validate required fields
    const requiredFields: (keyof InsuranceClaim)[] = [
      'claimId',
      'policyNumber',
      'claimDate',
      'location',
      'description',
      'estimatedDamage'
    ];

    const missingFields = requiredFields.filter(field => !claim[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      });
    }

    console.log('Verifying claim:', claim.claimId);
    const result = await agent.verifyInsuranceClaim(claim);
    console.log('Verification result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error verifying claim:', error);
    res.status(500).json({ 
      error: 'Failed to verify claim',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  GET  /         (Frontend UI)');
  console.log('  GET  /health');
  console.log('  POST /api/verify-claim');
}); 