# EvoOwl 🦉

An interactive genetic algorithm platform for evolving text-based solutions to complex problems. Use AI-powered evolution to iteratively improve methodologies, strategies, and approaches through natural selection.

## ✨ Features

- **Interactive Evolution**: Real-time genetic algorithm visualization
- **AI-Powered Operators**: LLM-driven crossover, mutation, and evaluation
- **Problem Setup**: Define criteria and constraints for your specific domain
- **Evolution History**: Save, restore, and compare different evolution runs
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Real-time Feedback**: Live activity feed and fitness tracking

## 🚀 Quick Start

### Prerequisites

- **Node.js** `^18.0.0 || >=20.0.0` (use `.nvmrc` for version management)
- **Python 3.8+** (for backend API)
- **Optional**: [Ollama](https://ollama.ai/) for local LLM integration

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mikhail99/EVOOwl.git
   cd EVOOwl
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies** (FastAPI backend)
   ```bash
   pip install fastapi uvicorn httpx pydantic
   ```

4. **Optional: Set up Ollama** (for enhanced AI features)
   ```bash
   # Install Ollama from https://ollama.ai/
   ollama pull gemma3:latest
   ollama pull nomic-embed-text
   ```

### Running the Application

#### Development Mode (Frontend + Backend)

1. **Start the backend API** (Terminal 1)
   ```bash
   npm run dev:api
   ```
   This runs the FastAPI server on `http://localhost:8000`

2. **Start the frontend** (Terminal 2)
   ```bash
   npm run dev
   ```
   This runs the Vite dev server on `http://localhost:5173`

3. **Open your browser** to `http://localhost:5173`

#### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the backend**
   ```bash
   npm run dev:api
   ```

3. **Serve the frontend**
   ```bash
   node serve.js
   ```
   This serves the built app on `http://localhost:3000`

## 🎯 How to Use

1. **Setup Phase**: Define your problem statement and evaluation criteria
2. **Evolution Phase**: Watch the genetic algorithm evolve solutions
3. **Analysis**: Review the population, fitness charts, and evolution history
4. **Snapshots**: Save checkpoints and restore previous states

### Example Use Cases

- **Research Methodology**: Evolve experimental designs
- **Business Strategy**: Develop market approaches
- **Technical Architecture**: Design system architectures
- **Creative Writing**: Generate story structures

## 🏗️ Project Structure

```
EVOOwl/
├── app/                    # Frontend React application
│   ├── api/               # API client and types
│   ├── components/        # UI components
│   │   ├── evolution/     # Evolution-specific components
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utilities
│   └── pages/            # Main application pages
├── backend/              # Python FastAPI backend
│   ├── api_server.py    # Main API server
│   ├── shinka/          # Evolution engine (advanced)
│   └── *.py             # Backend utilities
├── dist/                # Built frontend (after npm run build)
├── results/             # Evolution run outputs
└── *.config.*          # Build configurations
```

## 📋 Available Scripts

### Frontend Scripts
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts
- `npm run dev:api` - Start FastAPI backend with auto-reload
- `python backend/run.py` - Run standalone evolution (advanced)

## ⚙️ Configuration

### Environment Variables

#### Frontend
No specific environment variables required for basic operation.

#### Backend
This repo has **two** places that call an LLM:

- **Web API server** (`backend/api_server.py`) uses `EVOLVE_LLM_*`
- **Offline evaluator** (`backend/evaluate.py`, used by `backend/run.py`) uses `EVAL_LLM_*`

Both talk to an **OpenAI-compatible** HTTP endpoint (Ollama works out of the box).

##### 1) Web API LLM (`EVOLVE_LLM_*`)

```bash
# Ollama (default)
export EVOLVE_LLM_BASE_URL="http://localhost:11434/v1"
export EVOLVE_LLM_MODEL="ollama:gemma3:latest"
export EVOLVE_LLM_API_KEY="ollama"

# OpenAI (alternative)
export EVOLVE_LLM_BASE_URL="https://api.openai.com/v1"
export EVOLVE_LLM_MODEL="gpt-4"
export EVOLVE_LLM_API_KEY="your-openai-api-key"
```

##### 2) Evaluator LLM (`EVAL_LLM_*`)

This is only needed if you run the advanced pipeline (`python backend/run.py`) or call the evaluator directly.

```bash
# Ollama (default)
export EVAL_LLM_BASE_URL="http://localhost:11434/v1"
export EVAL_LLM_MODEL="ollama:gemma3:latest"
export EVAL_LLM_API_KEY="ollama"

# Optional tuning
export EVAL_LLM_TEMPERATURE="0.3"
export EVAL_LLM_MAX_TOKENS="512"
export EVAL_LLM_TIMEOUT="15.0"

# Debug: skip network calls and use deterministic output
export EVAL_LLM_DRY_RUN="false"
```

##### Quick: pick a different Ollama model

```bash
ollama pull llama3.2:3b
export EVOLVE_LLM_MODEL="ollama:llama3.2:3b"
export EVAL_LLM_MODEL="ollama:llama3.2:3b"
```

### Evolution Parameters

Configure genetic algorithm settings in the UI:
- **Population Size**: Number of solutions per generation (4-20)
- **Generations**: Number of evolution cycles (3-20)
- **Mutation Rate**: Probability of random changes (10-50%)
- **Crossover Rate**: Probability of solution combination (50-90%)

## 🧬 Evolution Process

1. **Initialization**: Generate initial population of solutions
2. **Evaluation**: Score solutions against your criteria
3. **Selection**: Choose best solutions as parents
4. **Crossover**: Combine parent solutions to create children
5. **Mutation**: Introduce random variations
6. **Repeat**: Continue for specified generations

## 🔧 Development

### Adding New Components

1. Create component in `app/components/`
2. Add TypeScript interfaces in `app/api/types.ts`
3. Import and use in pages

### Backend Development

The FastAPI backend provides REST endpoints for:
- `/api/evolution/initial` - Generate initial population
- `/api/evolution/evaluate` - Score individual solutions
- `/api/evolution/crossover` - Combine parent solutions
- `/api/evolution/mutate` - Apply mutations
- `/api/snapshots` - Manage evolution snapshots

### Building for Production

```bash
npm run build
npm run dev:api  # Backend runs separately
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source. See LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**"npm run build" fails with TypeScript errors**
- Ensure Node.js version matches `.nvmrc`
- Run `npm ci` to reinstall dependencies

**Backend API not responding**
- Check that `npm run dev:api` is running
- Verify port 8000 is not blocked
- Check backend logs for errors

**Ollama integration not working**
- Ensure Ollama is installed and running
- Verify model is pulled: `ollama pull gemma3:latest`
- Check environment variables match your setup

**Performance issues**
- Reduce population size for faster evolution
- Lower mutation/crossover rates for more stable results
- Use local Ollama instead of external APIs

## 📊 Advanced Features

For advanced evolution capabilities, explore the `backend/shinka/` directory which includes:
- Multi-model LLM support
- Distributed evaluation
- Advanced mutation operators
- Visualization tools
- Database persistence

Run with: `python backend/run.py`
