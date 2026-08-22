# AI Organization - Autonomous Enterprise Multi-Agent Platform

> **Tagline:** *"From AI Assistants to AI Organizations"*

AI Organization is a production-grade multi-agent autonomous enterprise platform where specialized AI agents (CEO, Research, CTO, Development, Marketing) collaborate autonomously to plan, research, architect, implement, and deliver complete strategic business objectives.

---

## 🌟 Core Capabilities

1. **Autonomous Multi-Agent Orchestration**: LangGraph-powered state pipeline coordinating 5 specialized agents with deterministic state transitions.
2. **Goal Decomposition & Delegation**: CEO Agent decomposes high-level user objectives into structured, dependent departmental tasks.
3. **Shared Company Memory Layer**: Async SQLAlchemy ORM persisting research data, architectural blueprints, marketing strategies, code deliverables, and activity streams with PostgreSQL/SQLite compatibility.
4. **Automated Inter-Agent Conflict Resolution**: CEO Agent identifies and arbitrates trade-off disputes (e.g., CTO architecture depth vs Marketing time-to-market).
5. **Real-time Event Streaming (SSE)**: Server-Sent Events stream live status changes, task updates, and log entries directly to the frontend.
6. **Tactile Retro-Modern UI & Graph Visualization**: Interactive 2D Pixel Office floorplan and React Flow node topology graph.
7. **Executive Deliverable Compiler**: Generates comprehensive markdown deliverable reports complete with executive summaries, technical architecture specs, PostgreSQL DDL schemas, REST API contracts, and GTM playbooks.

---

## 🏗️ Architecture & Workflow

```
                  USER OBJECTIVE
                        ↓
            CEO / ORCHESTRATOR AGENT
                        ↓
             TASK DECOMPOSITION & DISPATCH
                        ↓
    ┌──────────────┬──────────────┬──────────────┐
    │              │              │              │
Research Agent  CTO Agent  Marketing Agent  Dev Agent
    │              │              │              │
    └──────────────┴──────┬───────┴──────────────┘
                          ↓
               SHARED COMPANY MEMORY
                          ↓
          INTER-AGENT CONFLICT ARBITRATION
                          ↓
                 CEO BINDING DECISION
                          ↓
             EXECUTIVE DELIVERABLE REPORT
```

---

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- **Framework**: Next.js 15+ (App Router, Standalone output)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS & Framer Motion
- **Topology Graph**: `@xyflow/react` (React Flow)
- **Icons**: Lucide React
- **Audio**: Web Audio API Retro Sound Effects

### Backend (`/backend`)
- **Framework**: Python 3.11 + FastAPI (Async Lifespan)
- **Agent Orchestration**: LangGraph & LangChain
- **Database**: PostgreSQL (with pgvector support) / SQLite async fallback
- **LLM Support**: Provider-agnostic (Google Gemini, OpenAI, Groq, NVIDIA NIM, Local Ollama/vLLM)
- **Real-time Streaming**: `sse-starlette`
- **Testing**: `pytest`, `pytest-asyncio`, `pytest-cov`

---

## 🐳 Quick Start with Docker (Recommended)

Run the entire platform (PostgreSQL + FastAPI Backend + Next.js Frontend) with a single command:

```bash
# 1. Clone the repository and configure environment variables
cp .env.example .env

# 2. Build and start all services
docker compose up --build -d

# 3. View logs
docker compose logs -f
```

- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Interactive API Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

To stop the containers:
```bash
docker compose down
```

---

## 💻 Local Development Setup

### 1. Backend Setup

```bash
cd backend
python -m venv .venv

# Activate Virtualenv:
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend API server
python main.py
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Automated Testing

### Backend Unit & Integration Tests
```bash
# Run full pytest suite
pytest backend/tests -v

# Run with coverage report
pytest backend/tests --cov=backend/app -v
```

### End-to-End Pipeline Test
```bash
python backend/test_pipeline.py
```

### Frontend Typecheck & Build
```bash
npm run build --prefix frontend
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System and database connectivity health check |
| `POST` | `/api/company/create` | Initializes new company organization and registers 5 agents |
| `POST` | `/api/company/{id}/run` | Triggers background LangGraph multi-agent execution pipeline |
| `GET` | `/api/company/{id}` | Fetches company state and final executive report |
| `GET` | `/api/company/{id}/agents` | Fetches agent states, roles, and current tasks |
| `GET` | `/api/company/{id}/tasks` | Lists departmental execution tasks and results |
| `GET` | `/api/company/{id}/memory` | Retrieves shared company memory artifacts |
| `GET` | `/api/company/{id}/decisions`| Retrieves conflict records and CEO rulings |
| `GET` | `/api/company/{id}/activity` | Retrieves chronological activity log events |
| `GET` | `/api/company/{id}/messages` | Retrieves inter-agent message dialogue history |
| `GET` | `/api/company/{id}/search-memory` | Relevance-ranked memory search across artifacts |
| `GET` | `/api/company/{id}/events` | Real-time Server-Sent Events (SSE) streaming endpoint |

---

## 🛡️ Production & Security Considerations

- **Non-root Containers**: Both backend and frontend Dockerfiles run under dedicated non-root users (`appuser` / `nextjs`).
- **Connection Pooling**: Async database engine pool configured for PostgreSQL with automatic reconnects (`pool_pre_ping=True`).
- **Dynamic CORS**: Configurable via `CORS_ORIGINS` environment variable.
- **Failover Heuristics**: Provider-agnostic fallback response generators ensure system stability even during third-party LLM outages.
