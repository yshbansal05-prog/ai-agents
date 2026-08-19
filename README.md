# AI Organization

> **Tagline:** *"From AI Assistants to AI Organizations"*

AI Organization is a virtual company platform where multiple specialized AI agents (CEO, Research, CTO, Development, Marketing) collaborate autonomously like an enterprise organization to achieve a common strategic objective.

---

## 🌟 Key Features

1. **Autonomous Multi-Agent Orchestration**: LangGraph-powered state pipeline coordinating 5 specialized agents.
2. **Goal Decomposition & Task Delegation**: The CEO Agent breaks high-level user goals into structured tasks.
3. **Shared Company Memory System**: PostgreSQL database persisting research findings, system architectures, marketing strategies, code deliverables, and activity logs.
4. **Inter-Agent Conflict Detection & Decision Resolution**: CEO Agent automatically identifies trade-off disputes between agents (e.g., CTO architecture depth vs Marketing launch speed) and records binding decisions.
5. **Real-time Activity Stream (SSE)**: Server-Sent Events stream live status changes, task updates, and log entries directly to the frontend.
6. **Interactive Organization Topology Graph**: Visual React Flow graph representing agent states (`Working`, `Completed`, `Waiting`, `Failed`) with an interactive Agent Details panel.
7. **Final Executive Deliverable Report**: Compiles a comprehensive markdown report complete with executive summary, tech architecture, database SQL DDL, API endpoints, GTM strategy, and decisions.

---

## 🏗️ Architecture & Core Workflow

```
                  USER GOAL
                      ↓
             CEO / ORCHESTRATOR
                      ↓
              TASK DECOMPOSITION
                      ↓
    --------------------------------------
    |            |           |           |
 Research       CTO      Marketing   Development
    |            |           |           |
    --------------------------------------
                      ↓
            SHARED COMPANY MEMORY
                      ↓
        INTER-AGENT CONFLICT RESOLUTION
                      ↓
               CEO FINAL DECISION
                      ↓
         EXECUTIVE DELIVERABLE REPORT
```

---

## 🛠️ Technology Stack

### Frontend (`/frontend`)
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: React Flow (`@xyflow/react`)
- **Icons**: Lucide Icons
- **Real-time Connection**: Server-Sent Events (SSE) `EventSource`

### Backend (`/backend`)
- **Framework**: Python 3.11 + FastAPI
- **Agent Orchestration**: LangGraph & LangChain
- **Database**: Supabase PostgreSQL (SQLAlchemy Async ORM) with local SQLite fallback
- **LLM Engine**: Provider-agnostic (Google Gemini, OpenAI, Groq, Anthropic, or Fallback Engine)
- **Real-time Streaming**: `sse-starlette`
- **Web Search**: DuckDuckGo Search API

---

## 🤖 Specialized AI Agents

1. **CEO / Orchestrator Agent**: Decomposes company goals, delegates tasks, monitors agent execution, resolves inter-agent conflicts, and synthesizes final company report.
2. **Research Agent**: Conducts market research, competitor benchmarking, user persona discovery, and risk assessment.
3. **Strategy / CTO Agent**: Architects system design, selects tech stack, models database schema, and defines technical roadmaps.
4. **Marketing Agent**: Establishes target audience, value proposition, competitive positioning, and go-to-market launch strategies.
5. **Development Agent**: Converts requirements into technical code deliverables, SQL schema DDLs, and REST API endpoint definitions.

---

## 📊 Database Schema (PostgreSQL / Supabase)

- `companies`: Tracks company metadata, goal, status, and final report.
- `agents`: Stores agent specifications, roles, status, current task, and capabilities.
- `tasks`: Manages task title, description, assigned agent, priority, and result.
- `messages`: Records inter-agent messaging communications.
- `memories`: Shared company memory storing key-value agent artifacts by category (`RESEARCH`, `ARCHITECTURE`, `MARKETING`, `CODE`, `DECISION`).
- `decisions`: Records conflict titles, opposing agent inputs, CEO decisions, and rationales.
- `activity_logs`: Timestamped log events for live activity timeline.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ and npm
- Python 3.11+

### 1. Clone & Set Up Environment

Copy `.env.example` to `.env` inside `/backend`:

```bash
cp .env.example backend/.env
```

Set your preferred LLM provider and API key in `backend/.env`:
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_api_key_here
```

### 2. Start the Backend API Server

```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python main.py
```

Backend API server will run at: `http://localhost:8000`  
Interactive API Docs: `http://localhost:8000/docs`

### 3. Start the Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

Frontend application will run at: `http://localhost:3000`

---

## 🎬 Demo Scenario Instructions

1. Open `http://localhost:3000` in your browser.
2. The default goal is pre-filled: `"Build an AI-powered internship platform for college students."`
3. Click **START ORGANIZATION**.
4. Watch real-time execution live on the **Organization Topology Graph** and **Realtime Activity Stream**.
5. Inspect the **Company Memory** tab to browse research findings, CTO tech stack, and code deliverables.
6. View the **Conflicts & Decisions** tab to see how the CEO resolved trade-offs between CTO and Marketing.
7. Open the **Final Outcome Report** tab to copy or download the generated Executive Company Plan.

---

## 🔮 Future Improvements

- Add vector search embeddings (`pgvector`) for semantic memory retrieval across large agent histories.
- Expand agent capabilities to perform automated GitHub repository PR generation.
- Enable custom agent creation with user-defined system prompts and custom tools.
