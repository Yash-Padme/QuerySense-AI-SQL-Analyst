<div align="center">

# QuerySense - AI SQL Analyst


### Intelligent Database Analytics Platform

![CI/CD Pipeline](https://github.com/hirdeshds/ai-sql-analyst/actions/workflows/ci.yml/badge.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?logo=langchain&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

*An enterprise-grade, AI-powered natural language interface for SQL databases. Ask questions in plain English — receive instant, contextual insights backed by autonomous query generation, execution plan analysis, and chart-ready data formatting.*

---

[Features](#features) · [Architecture](#system-architecture) · [Quick Start](#quick-start) · [API Reference](#api-reference) · [Deployment](#deployment) · [Contributing](#contributing)

</div>

---

## Features

| Category | Capability | Description |
|----------|-----------|-------------|
| **AI Agent** | Natural Language to SQL | Converts plain English questions into validated SQL queries via a LangChain ReAct agent |
| **Authentication** | Clerk Integration | Secure user authentication and session management via Clerk (OAuth & Email magic links). |
| **Interactive Schema** | Visual ER Diagram | Canvas-based relational database graph built with `@xyflow/react` (React Flow), highlighting Primary Keys, column data types, and connecting foreign key edges. |
| **Markdown & Code UI**| Rich Responses | Parses outputs via `react-markdown` and `remark-gfm` with built-in SQL code copy buttons and tabular formatting. |
| **Memory** | Session-Aware Context | Maintains per-session conversational memory for multi-turn analytical dialogues |
| **Query Optimizer** | EXPLAIN QUERY PLAN | Automated execution plan analysis with index optimization recommendations |
| **Chart Engine** | Visualization Specs | Generates chart configuration JSON payloads from query results |
| **Chat Persistence** | User-Scoped History | Per-user chat session storage with full CRUD operations |
| **User Identity** | Email-Based Sessions | Login-gated experience with session isolation per user |
| **Visualization** | Chart Engine | Generates chart configuration JSON payloads from query execution results. |
| **Containerized** | Docker Compose | One-command multi-service deployment with network isolation |

---

## System Architecture

```mermaid
flowchart TB
    subgraph CLIENT["CLIENT LAYER"]
        direction TB
        subgraph NEXTJS["Next.js 14 — App Router"]
            direction LR
            LOGIN["LoginModal\n(Auth Gate)"]
            SIDEBAR["Sidebar\n(Sessions + Schema)"]
            CHAT["ChatInterface\n(Message Stream)"]
        end
        SERVICE["Service Layer — analysisService.ts\nAxios Client → /api/v1/analyst/*"]
        LOGIN & SIDEBAR & CHAT --> SERVICE
    end

    SERVICE -- "HTTP / JSON" --> FASTAPI

    subgraph SERVER["API GATEWAY LAYER"]
        direction TB
        FASTAPI["FastAPI Application — Uvicorn"]
        subgraph ROUTES["Route Handlers"]
            direction LR
            R1["POST /chat"]
            R2["GET /schema"]
            R3["GET | DEL /history"]
        end
        FASTAPI --> R1 & R2 & R3
    end

    R1 & R2 & R3 --> AGENT

    subgraph INTELLIGENCE["INTELLIGENCE LAYER"]
        direction TB
        AGENT["LangChain AgentExecutor — ReAct\nLLM: Groq Llama 3.3 70B"]
        subgraph TOOLS["Tool Registry"]
            direction LR
            T1["SQL Toolkit\nlist · info · query · check"]
            T2["Query Optimizer\nEXPLAIN QUERY PLAN\nIndex Recommendations"]
            T3["Chart Generator\nJSON Spec · Type Selection"]
        end
        AGENT --> T1 & T2 & T3
        subgraph MEMORY["Session Memory"]
            direction LR
            M1["InMemoryChatMessageHistory"]
            M2["RunnableWithMessageHistory\n(Per-Session Context)"]
        end
        AGENT --> M1 & M2
    end

    T1 & T2 --> DB_BIZ
    R3 --> DB_HIST

    subgraph DATA["DATA PERSISTENCE LAYER"]
        direction LR
        DB_BIZ["Business Database\nSQLite · company.db\n\ncustomers · categories\nproducts · orders · order_items"]
        DB_HIST["Chat History Database\nuser_chat_sessions\nchat_messages\n\nIndexed by: user_email, session_id"]
    end
```

---

## Core Architecture & Innovations

### Multi-Agent Tool Orchestration

The intelligence layer uses a **LangChain ReAct agent** backed by **Groq's Llama 3.3 70B** model. Rather than a single monolithic prompt, the system decomposes queries across specialized tools:

```
User Query → Agent Reasoning → Tool Selection → Execution → Response Synthesis
```

| Tool | Source | Purpose |
|------|--------|---------|
| `sql_db_list_tables` | LangChain SQLToolkit | Enumerate available database tables |
| `sql_db_schema` | LangChain SQLToolkit | Retrieve DDL and sample rows for specified tables |
| `sql_db_query` | LangChain SQLToolkit | Execute validated SELECT queries against the database |
| `sql_db_query_checker` | LangChain SQLToolkit | Pre-validate SQL syntax before execution |
| `analyze_query_performance` | Custom (`tools/optimizer.py`) | Run `EXPLAIN QUERY PLAN` and recommend index optimizations |
| `suggest_chart_json` | Custom (`tools/chart_generator.py`) | Generate chart specification JSON from query results |

### Session Memory Architecture

Each user session maintains an isolated conversation context through `RunnableWithMessageHistory`:

```python
# Session isolation — each session_id gets independent memory
RunnableWithMessageHistory(
    agent_executor,
    get_chat_session_history,         # In-memory store keyed by session_id
    input_messages_key="input",
    history_messages_key="history"
)
```

**Dual-layer persistence:**
- **Runtime Memory** — `InMemoryChatMessageHistory` for fast agent context during active sessions
- **Persistent Storage** — SQLite `chat_messages` table for cross-session user history retrieval

### Safety Guardrails

| Layer | Protection |
|-------|-----------|
| **Prompt Engineering** | System prompt enforces read-only `SELECT` queries; refuses `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER` |
| **Query Optimizer** | Regex validation rejects non-SELECT statements before `EXPLAIN QUERY PLAN` execution |
| **Agent Executor** | `max_iterations=10` prevents infinite tool-call loops; `handle_parsing_errors=True` provides graceful degradation |

---

## Project Structure

```
ai-sql-analyst/
│
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI/CD pipeline
│
├── backend/                                # FastAPI Python Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                         # Application entry point, CORS, router mount
│   │   │
│   │   ├── agent/                          # AI Agent Core
│   │   │   ├── __init__.py
│   │   │   ├── analyst.py                  # Agent initialization, tool binding, singleton runtime
│   │   │   ├── memory.py                   # In-memory session history store
│   │   │   └── prompts.py                  # System prompt templates (ChatPromptTemplate)
│   │   │
│   │   ├── api/                            # REST API Layer
│   │   │   ├── __init__.py
│   │   │   ├── router.py                   # APIRouter configuration and prefix mounting
│   │   │   └── endpoints.py               # Route handlers: /chat, /schema, /history
│   │   │
│   │   ├── database/                       # Data Access Layer
│   │   │   ├── __init__.py
│   │   │   ├── connection.py               # SQLAlchemy/LangChain database URI management
│   │   │   ├── schema_viewer.py            # SQLAlchemy Inspector — table/column introspection
│   │   │   ├── chat_history_db.py          # User chat session CRUD (SQLite)
│   │   │   └── seed_db.py                  # Demo dataset seeder (customers, orders, products)
│   │   │
│   │   └── tools/                          # Custom LangChain Tools
│   │       ├── __init__.py
│   │       ├── optimizer.py                # EXPLAIN QUERY PLAN analysis + index recommendations
│   │       └── chart_generator.py          # Chart specification JSON generator
│   │
│   ├── .env                                # Environment variables (GROQ_API_KEY, DATABASE_URL)
│   ├── requirements.txt                    # Python dependency manifest
│   └── Dockerfile                          # Backend container specification
│
├── frontend/                               # Next.js 14 TypeScript Frontend
│   ├── src/
│   │   ├── app/                            # Next.js App Router
│   │   │   ├── layout.tsx                  # Root HTML layout, metadata, font preloading
│   │   │   ├── page.tsx                    # Main application page (composition root)
│   │   │   ├── page.module.css             # Page-level styles
│   │   │   └── globals.css                 # Global CSS variables, resets, theme tokens
│   │   │
│   │   ├── components/                     # React UI Components
│   │   │   ├── ChatInterface.tsx           # Message input, send handler, chat stream display
│   │   │   ├── ChatInterface.module.css
│   │   │   ├── ChatMessage.tsx             # Individual message bubble with Markdown rendering
│   │   │   ├── ChatMessage.module.css
│   │   │   ├── LoginModal.tsx              # Email authentication modal
│   │   │   ├── LoginModal.module.css
│   │   │   ├── Sidebar.tsx                 # Session list, schema tree, navigation
│   │   │   ├── Sidebar.module.css
│   │   │   ├── StatusIndicator.tsx         # Backend connectivity status badge
│   │   │   └── StatusIndicator.module.css
│   │   │
│   │   └── lib/                            # Shared Utilities
│   │       ├── api.ts                      # Axios client instance (base URL, headers)
│   │       ├── analysisService.ts          # Service layer — chat, schema, history, health API calls
│   │       ├── hooks.ts                    # Custom React hooks (useAnalystChat, useDatabaseSchema, useBackendHealth)
│   │       └── types.ts                    # TypeScript interface definitions
│   │
│   ├── package.json                        # Node.js dependency manifest
│   ├── tsconfig.json                       # TypeScript compiler configuration
│   └── Dockerfile                          # Frontend container specification
│
├── data/
│   └── company.db                          # SQLite demo database (seeded business data)
│
├── tests/
│   └── test_main.py                        # API endpoint test suite (FastAPI TestClient)
│
├── docker-compose.yml                      # Multi-service orchestration
├── setup.bat                               # Windows dependency installer
├── setup.sh                                # Unix/macOS dependency installer
├── FULLSTACK_SETUP.md                      # Extended setup and troubleshooting guide
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **LLM Provider** | Groq (Llama 3.3 70B) | Latest | Ultra-fast inference for SQL agent reasoning |
| **Agent Framework** | LangChain | 0.3.0 | ReAct agent, tool orchestration, memory management |
| **Backend Framework** | FastAPI | 0.111.0 | Async REST API with automatic OpenAPI documentation |
| **ASGI Server** | Uvicorn | 0.30.1 | Production-grade async HTTP server |
| **ORM / DB Toolkit** | SQLAlchemy | 2.0.30 | Database connection pooling and schema introspection |
| **Frontend Framework** | Next.js (App Router) | 14.x | Server-side rendering, file-based routing |
| **UI Language** | TypeScript | 5.3+ | Type-safe component development |
| **HTTP Client** | Axios | 1.6+ | Promise-based API communication layer |
| **Database** | SQLite | 3.x | Embedded relational database (zero-config) |
| **Diagram Engine** | [@xyflow/react](https://reactflow.dev/) (React Flow) | Latest | Interactive, draggable ER diagram nodes and relationship edges |
| **Markdown Engine** | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) | Latest | Markdown table formatting and code snippet parsing |
| **Database & ORM** | SQLAlchemy / SQLite | 2.0+ / 3.x | Relational storage, schema reflection, and session tracking |
| **Containerization** | Docker / Compose | 3.8 | Multi-service deployment orchestration |
| **CI/CD** | GitHub Actions | — | Automated lint, test, build, and container verification |

---

## Quick Start

### Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| Python | 3.10+ |
| Node.js | 22+ |
| npm | 9+ |
| Groq API Key | [Get one free →](https://console.groq.com/keys) |

### 1 · Clone the Repository

```bash
git clone https://github.com/hirdeshds/ai-sql-analyst.git
cd ai-sql-analyst
```

### 2 · Configure Environment

Create `backend/.env` with your credentials:

```env
GROQ_API_KEY="gsk_your_groq_api_key_here"
DATABASE_URL="sqlite:///absolute/path/to/ai-sql-analyst/data/company.db"
```

### 3 · Install Dependencies

**Automated Setup (Recommended):**

```bash
# Windows
setup.bat

# macOS / Linux
chmod +x setup.sh && ./setup.sh
```

**Manual Setup:**

```bash
# Backend
cd backend
python -m pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 4 · Seed Demo Database (Optional)

```bash
cd backend
python -m app.database.seed_db
```

This populates `data/company.db` with a realistic e-commerce dataset: **10 customers**, **5 categories**, **12 products**, and **~35 orders** with line items.

### 5 · Start the Application

**Terminal 1 — Backend API Server:**

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend Development Server:**

```bash
cd frontend
npm run dev
```

### 6 · Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application interface |
| **Backend API** | http://localhost:8000 | REST API base URL |
| **API Documentation** | http://localhost:8000/docs | Interactive Swagger UI |
| **ReDoc** | http://localhost:8000/redoc | Alternative API documentation |

---

## API Reference

All endpoints are served under the `/api/v1/analyst` prefix.

### `POST /api/v1/analyst/chat`

Send a natural language query to the AI analyst.

**Request Body:**
```json
{
  "message": "What are the top 5 customers by total order value?",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_email": "analyst@company.com"
}
```

**Response:**
```json
{
  "response": "Based on the data analysis...\n\n| Rank | Customer | Total Spend |\n|------|----------|-------------|\n| 1 | Alice Smith | $8,249.95 |\n| ... | ... | ... |"
}
```

| Status Code | Condition |
|-------------|-----------|
| `200` | Query processed successfully |
| `500` | Agent execution error (details in response body) |

---

### `GET /api/v1/analyst/schema`

Retrieve the full database schema (tables, columns, types).

**Response:**
```json
{
  "customers": [
    { "name": "customer_id", "type": "INTEGER" },
    { "name": "first_name", "type": "TEXT" },
    { "name": "email", "type": "TEXT" }
  ],
  "orders": [
    { "name": "order_id", "type": "INTEGER" },
    { "name": "customer_id", "type": "INTEGER" },
    { "name": "total_amount", "type": "REAL" }
  ]
}
```

---

### `GET /api/v1/analyst/history?user_email={email}`

Fetch all chat sessions for a specific user.

**Response:**
```json
[
  {
    "session_id": "550e8400-...",
    "title": "What are the top 5 customers by total...",
    "created_at": "2024-06-15T10:30:00",
    "updated_at": "2024-06-15T10:35:00",
    "messages": [
      { "id": "1", "sender": "user", "content": "...", "timestamp": "..." },
      { "id": "2", "sender": "assistant", "content": "...", "timestamp": "..." }
    ]
  }
]
```

---

### `DELETE /api/v1/analyst/history/{session_id}?user_email={email}`

Delete a specific chat session.

**Response:**
```json
{
  "status": "success",
  "message": "Session 550e8400-... deleted"
}
```

---

### `GET /`

Health check endpoint.

**Response:**
```json
{
  "status": "online",
  "engine": "AI SQL Analyst Core v1.0.0"
}
```

---

## Database Schema (Demo Dataset)

```sql
┌──────────────┐       ┌──────────────┐
│  customers   │       │  categories  │
├──────────────┤       ├──────────────┤
│ customer_id  │──┐    │ category_id  │──┐
│ first_name   │  │    │ category_name│  │
│ last_name    │  │    └──────────────┘  │
│ email        │  │                      │
│ city         │  │    ┌──────────────┐  │
│ country      │  │    │   products   │  │
│ created_at   │  │    ├──────────────┤  │
└──────────────┘  │    │ product_id   │  │
                  │    │ product_name │  │
                  │    │ category_id  │◄─┘
                  │    │ price        │──┐
                  │    └──────────────┘  │
                  │                      │
┌──────────────┐  │    ┌──────────────┐  │
│    orders    │  │    │ order_items  │  │
├──────────────┤  │    ├──────────────┤  │
│ order_id     │──┼──►│ order_item_id│  │
│ customer_id  │◄─┘    │ order_id     │  │
│ order_date   │       │ product_id   │◄─┘
│ total_amount │       │ quantity     │
│ status       │       │ unit_price   │
└──────────────┘       └──────────────┘
```

---

## Deployment

### Docker Compose (Recommended)

```bash
docker-compose up --build
```

This starts both services on an isolated bridge network:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

### Container Specifications

| Service | Base Image | Exposed Port |
|---------|-----------|-------------|
| `backend` | `python:3.11-slim` | 8000 |
| `frontend` | `node:22-alpine` | 3000 |

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | ✅ | — | Groq API key for LLM inference |
| `DATABASE_URL` | ❌ | `sqlite:///data/company.db` | SQLAlchemy database connection URI |
| `NEXT_PUBLIC_API_URL` | ❌ | `http://localhost:8000` | Backend API base URL for the frontend |

---

## Testing & CI/CD

### Local Test Execution

```bash
# Backend — lint and test
cd backend
pip install flake8
flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
cd ..
pytest

# Frontend — lint and build verification
cd frontend
npm run lint
npm run build
```

### GitHub Actions Pipeline

The CI/CD pipeline (`.github/workflows/ci.yml`) runs automatically on every push and pull request to `main`, `master`, and `develop` branches:

| Job | Matrix | Steps |
|-----|--------|-------|
| **Backend CI** | Python 3.10, 3.11 | Install → Flake8 lint → Pytest |
| **Frontend CI** | Node.js 22, 24 | Install → ESLint → Next.js build |
| **Docker CI** | — | Buildx → Build backend image → Build frontend image |

---

## Configuration

### Connecting Your Own Database

Replace the `DATABASE_URL` in `backend/.env` with any SQLAlchemy-compatible connection string:

```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# MySQL
DATABASE_URL="mysql+pymysql://user:password@host:3306/dbname"

# SQLite (default)
DATABASE_URL="sqlite:///path/to/your/database.db"
```

> **Note:** Additional driver packages (e.g., `psycopg2`, `pymysql`) must be added to `backend/requirements.txt` for non-SQLite databases.

### Swapping the LLM Provider

The agent is initialized in `backend/app/agent/analyst.py`. To use a different Groq model:

```python
llm = ChatGroq(
    model="llama-3.3-70b-versatile",   # Change model here
    temperature=0,                      # Adjust creativity (0 = deterministic)
    groq_api_key=groq_api_key
)
```

---

## Contributing

### Development Workflow

1. **Fork** the repository and create a feature branch
2. **Install** dependencies using the setup scripts
3. **Implement** changes following existing code patterns
4. **Test** — ensure `pytest` passes and `npm run lint && npm run build` succeeds
5. **Submit** a pull request against `develop`

### Code Standards

| Area | Standard |
|------|----------|
| Python | PEP 8 via Flake8 (max line length: 120) |
| TypeScript | ESLint with `eslint-config-next` |
| Commits | Conventional Commits (`feat:`, `fix:`, `docs:`, `ci:`) |
| Components | CSS Modules with co-located `*.module.css` files |

### Adding New Agent Tools

1. Create a new function in `backend/app/tools/` decorated with `@tool`
2. Register the tool in the `all_tools` list in `backend/app/agent/analyst.py`
3. The agent will automatically discover and use the tool based on its docstring

```python
from langchain_core.tools import tool

@tool
def your_custom_tool(input_param: str) -> str:
    """Clear docstring describing when and how the agent should use this tool."""
    # Implementation
    return result
```

---

## Troubleshooting

For common issues and detailed setup instructions, see [FULLSTACK_SETUP.md](./FULLSTACK_SETUP.md).

| Issue | Resolution |
|-------|-----------|
| `ModuleNotFoundError: langchain_groq` | Run `pip install -r backend/requirements.txt` |
| `GROQ_API_KEY not set` | Create `backend/.env` with your API key |
| Frontend can't reach backend | Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local` |
| `npm ci` fails in CI | Lock file is OS-specific; CI uses `npm install` instead |
| Database not found | Run `python -m app.database.seed_db` from `backend/` |

---

## License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with LangChain, FastAPI, Next.js, and Groq**


[Report Bug](https://github.com/hirdeshds/ai-sql-analyst/issues) · [Request Feature](https://github.com/hirdeshds/ai-sql-analyst/issues)

</div>
