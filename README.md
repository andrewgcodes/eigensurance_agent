# opacity-llm-quickstart 🤖

A ready-to-use scaffold that demonstrates how to build verifiable AI inference using Opacity's zkTLS proofs. This project showcases how to generate text from LLMs with cryptographic proofs of the model's outputs.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Layr-Labs/opacity-llm-quickstart.git
   cd opacity-llm-quickstart
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and fill in your API keys and configuration values:
   - `OPACITY_OPENAI_KEY`: Your Opacity API key
   - `OPACITY_TEAM_ID`: Your Opacity team ID
   - `OPACITY_TEAM_NAME`: Your Opacity team name
   - `OPACITY_PROVER_URL`: URL for the Opacity prover service

4. **Run the demo**
   
   CLI Demo:
   ```bash
   npm run build
   npm start
   ```

   Express Server:
   ```bash
   npm run dev
   ```

## 🛠 Project Structure

```
opacity-llm-quickstart/
├── src/
│   ├── agent/
│   │   └── createAgent.ts    # Core agent implementation
│   ├── index.ts             # CLI demo
│   └── server.ts            # Express API
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔧 Usage

### CLI Demo

The CLI demo showcases basic usage of verifiable text generation:
1. Initializes the Opacity agent
2. Generates text with a sample prompt
3. Displays the response and associated proof

Run it with:
```bash
npm start
```

### REST API

The Express server provides the following endpoints:

1. **Generate Verifiable Text**
   ```bash
   curl -X POST http://localhost:3000/api/generate \
     -H "Content-Type: application/json" \
     -d '{"prompt": "What is the capital of France?"}'
   ```

2. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

## 🔍 Core Components

### Agent Creation (`src/agent/createAgent.ts`)

The `createAgent.ts` file is the heart of this project. It:
- Initializes the Opacity adapter
- Provides methods for verifiable text generation
- Handles error cases and proof verification
- Includes proper TypeScript types

### Express Server (`src/server.ts`)

The Express server provides a REST API interface to the agent's capabilities:
- CORS enabled
- JSON request body parsing
- Error handling
- Health check endpoint
- Clear API documentation

## 📝 Next Steps

Here are some ways you can extend this project:

1. **Enhance Functionality**
   - Add rate limiting
   - Implement response caching
   - Add authentication
   - Add proof verification endpoints

2. **Improve Developer Experience**
   - Add tests
   - Add CI/CD
   - Add API documentation (Swagger/OpenAPI)
   - Add monitoring and logging

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
