# Eigensurance - Decentralized Wildfire Claims Verifier 🔥
[website](https://eigensurance.vercel.app/)
A decentralized insurance claims verification system that uses AI and cryptographic proofs to automatically verify wildfire damage claims. This project combines Web3 technology with satellite data, weather records, and property information to provide transparent and verifiable insurance claim decisions.

## 🚀 Features

- **Automated Claims Verification**: Processes wildfire insurance claims using multiple data sources
- **Cryptographic Proof Generation**: Uses Opacity's zkTLS for verifiable AI inference
- **Multi-Source Verification**: Checks against:
  - Historical wildfire data
  - Property records
  - Weather conditions
  - Satellite imagery
  - Local fire reports
- **Web3 Integration**: Handles Ethereum wallet addresses and smart contract interactions
- **Real-time Progress Tracking**: Shows detailed verification steps with live updates

## 🛠 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/andrewgcodes/eigensurance_agent.git
   cd eigensurance_agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Configure your `.env` file with:
   - `OPACITY_OPENAI_KEY`: For AI verification with cryptographic proofs
   - `OPACITY_TEAM_ID`: Your Opacity team identifier
   - `OPACITY_TEAM_NAME`: Your Opacity team name
   - `OPACITY_PROVER_URL`: Opacity prover service URL
   - `PERPLEXITY_API_KEY`: For fact-checking and data verification
   - `PORT`: Server port (default: 3002)

4. **Start the server**
   ```bash
   npm run dev
   ```

## 💻 Usage

### Web Interface
Access the UI at `http://localhost:3002` to:
- Submit insurance claims with location coordinates
- View real-time verification progress
- Get detailed verification results with cryptographic proofs

### API Endpoints

1. **Verify Insurance Claim**
   ```bash
   POST /api/verify-claim
   ```
   Example request:
   ```json
   {
     "claimId": "WF-2023-001",
     "policyNumber": "POL-123456",
     "claimDate": "2021-07-20",
     "location": {
       "latitude": 39.7392,
       "longitude": -121.6088
     },
     "description": "Property damage from Dixie Fire...",
     "estimatedDamage": 350000,
     "walletAddress": "0x...",
     "policyContract": "0x..."
   }
   ```

2. **Health Check**
   ```bash
   GET /health
   ```

## 🔍 Verification Process

1. **Initial Verification**
   - Validates claim details
   - Verifies Ethereum wallet and policy contract
   - Generates location verification hash

2. **Data Collection**
   - Retrieves satellite imagery
   - Analyzes burn patterns
   - Cross-references fire reports
   - Validates weather conditions
   - Verifies property records

3. **AI Analysis**
   - Processes claim with Opacity's verifiable AI
   - Generates cryptographic proofs
   - Cross-references with Perplexity for fact-checking

4. **Decision Making**
   - Combines all verification data
   - Generates confidence score
   - Provides detailed reasoning
   - Issues final APPROVE/DENY verdict

## 🏗 Project Structure

```
eigensurance_agent/
├── public/
│   └── index.html          # Web interface
├── src/
│   ├── agent/
│   │   └── createAgent.ts  # Core verification logic
│   ├── index.ts           # CLI interface
│   └── server.ts          # Express server
└── .env.example           # Environment configuration
```

## 🔐 Security

- Environment variables are kept secure through `.gitignore`
- Cryptographic proofs ensure verification transparency
- Location data is verified with SHA-256 hashing
- Web3 integration ensures decentralized claim processing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
