import express from 'express';
import cors from 'cors';
import { createAgent } from './agent/createAgent';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize the agent
const agent = createAgent();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Generate verifiable text endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await agent.generateVerifiableText(prompt);
    res.json(result);
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// Verify location endpoint
app.post('/api/verify-location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const result = await agent.verifyLocation(latitude, longitude);
    res.json(result);
  } catch (error) {
    console.error('Error verifying location:', error);
    res.status(500).json({ error: 'Failed to verify location' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/generate');
  console.log('  POST /api/verify-location');
}); 