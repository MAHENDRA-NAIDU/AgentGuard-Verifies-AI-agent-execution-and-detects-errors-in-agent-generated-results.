# AgentGuard — AI Agent Execution Monitoring & Error Verification System

AgentGuard is a full-stack web application designed for real-time observability, deterministic trace recording, and automated error verification of autonomous AI agents powered by local LLMs via Ollama.

Unlike traditional AI wrappers that blindly trust model outputs, AgentGuard bridges the gap between autonomous tool calling and deterministic correctness guarantees by capturing every input/output step and running a dual-layer verification engine (8 deterministic behavioral rules + qualitative verifier analysis).

---

## 🏛️ System Architecture

```
USER
  │
  ▼
REACT FRONTEND (Vite + Tailwind + Socket.IO Client)
  │ [HTTP /api/agent/run]
  ▼
NODE.JS / EXPRESS SERVER
  │
  ├─► [Tool Calling Loop] ──► OLLAMA LOCAL API (http://localhost:11434)
  │                                │ (qwen2.5:7b)
  │                                ▼
  │                           AI TOOL DECISION
  │                                │
  │   ┌────────────────────────────┘
  │   ▼
  ├─► CONTROLLED TOOL REGISTRY (backend/tools/)
  │     ├── calculator (safe math parser, no eval)
  │     ├── file_writer (sandboxed in backend/agent_workspace/)
  │     ├── file_reader (sandboxed anti-traversal)
  │     └── database_query (safe read-only MongoDB query)
  │
  ├─► EXECUTION TRACE WRAPPER (backend/services/toolExecutor.js)
  │     ├── Captures input, output, duration, status (SUCCESS/FAILED)
  │     ├── Emits real-time Socket.IO events (agent:step-start, agent:step-complete)
  │     └── Persists traces in MongoDB (ExecutionStep collection)
  │
  ▼
VERIFICATION ENGINE (backend/services/verificationService.js)
  ├── Rule 1: Required Step Check (MISSING_STEP)
  ├── Rule 2: Tool Usage Validity (WRONG_TOOL)
  ├── Rule 3: Tool Execution Health (TOOL_EXECUTION_FAILURE)
  ├── Rule 4: Deterministic Result Validation (INCORRECT_RESULT)
  ├── Rule 5: Parameter Validity (INVALID_PARAMETER)
  ├── Rule 6: False Success Interception (FALSE_SUCCESS)
  ├── Rule 7: Partial Completion Check (PARTIAL_COMPLETION)
  └── Rule 8: Constraint Violation Check (CONSTRAINT_VIOLATION)
  │
  ▼
FINAL VERIFICATION REPORT ──► Broadcast via Socket.IO ──► REACT MONITORING DASHBOARD
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Lucide React, Axios, Socket.IO Client.
- **Backend**: Node.js, Express.js, Socket.IO, Mongoose, Mathjs, Axios, dotenv, CORS, UUID.
- **Database**: MongoDB (Collections: `tasks`, `executions`, `executionsteps`, `verificationreports`, `students`).
- **AI Core**: Local Ollama instance running `qwen2.5:7b` (100% private, zero cloud APIs, zero paid tokens).

---

## 🚀 Prerequisites

1. **Node.js** v18+ & **npm**
2. **MongoDB** running locally on port `27017`
3. **Ollama** installed and running on port `11434`
4. Pulled model: `ollama pull qwen2.5:7b`

---

## ⚙️ Installation & Setup

### 1. Backend Setup
```bash
cd backend
npm install
```
Configure `backend/.env` (pre-configured by default):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/agentguard
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
CLIENT_URL=http://localhost:5173
MAX_AGENT_STEPS=10
```

Start the backend server:
```bash
npm run dev
# Server starts at http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend starts at http://localhost:5173
```

---

## 🔍 The 8 Verification Rules

| Rule | Error Code | Description | Severity |
| :--- | :--- | :--- | :--- |
| **Rule 1** | `MISSING_STEP` | Compares required task operations against the trace to catch skipped actions. | **CRITICAL** |
| **Rule 2** | `WRONG_TOOL` | Detects when the model used an inappropriate tool (e.g. reading file instead of db query). | **HIGH** |
| **Rule 3** | `TOOL_EXECUTION_FAILURE` | Traps unhandled tool exceptions and non-zero exit statuses. | **HIGH** |
| **Rule 4** | `INCORRECT_RESULT` | Independently recalculates arithmetic to detect numeric hallucinations. | **HIGH** |
| **Rule 5** | `INVALID_PARAMETER` | Validates parameter schema, non-empty filenames, and sanitized inputs. | **HIGH** |
| **Rule 6** | `FALSE_SUCCESS` | Flags cases where the agent declared success while a critical tool failed. | **CRITICAL** |
| **Rule 7** | `PARTIAL_COMPLETION` | Identifies compound tasks where only preliminary steps were performed. | **HIGH** |
| **Rule 8** | `CONSTRAINT_VIOLATION` | Guards against unauthorized side-effects (e.g., extra file creations). | **MEDIUM** |

---

## 🎯 College Presentation & Demo Test Scenarios

The dashboard includes a dedicated **Demo Task Selector** dropdown for live demonstrations:

1. **Standard Calculation + File Write**:
   - Prompt: `Calculate 50 × 20 and save the result in result.txt`
   - Flow: Agent runs `calculator` (Step 1: 1000) &rarr; `file_writer` (Step 2: created `result.txt`).
   - Verifier Output: **VERIFIED** (Score: 100%).

2. **Complex Math Evaluation**:
   - Prompt: `Calculate (150 * 4) / 5 + sqrt(144)`
   - Flow: Agent runs `calculator` &rarr; Output `132`.
   - Verifier Output: **VERIFIED** (Score: 100%).

3. **Database Collection Query**:
   - Prompt: `Query the database collection "students" to find students in the "CSE" department.`
   - Flow: Sandboxed read-only query on MongoDB `students` collection.
   - Verifier Output: **VERIFIED**.

4. **Error Detection Demo (Corrupted Math)**:
   - Select `⚠️ Demo Error: Corrupted Calculation Output`
   - Flow: Agent receives calculation, but output is intentionally misaligned.
   - Verifier Output: **FAILED** (`INCORRECT_RESULT` at Step 1, with explanation & recommendation).

5. **Error Detection Demo (Tool Failure)**:
   - Select `⚠️ Demo Error: Tool Execution Failure`
   - Flow: Tool encounters a simulated error.
   - Verifier Output: **FAILED** (`TOOL_EXECUTION_FAILURE`, `FALSE_SUCCESS` intercepted).

---

## 🔒 Security Sandbox Principles

- **Zero Arbitrary Code**: The LLM cannot execute raw bash, shell, PowerShell, or `eval()`.
- **Path Traversal Protection**: All filesystem access is strictly locked inside `backend/agent_workspace/`. Any attempts to use `../` or access system directories are rejected.
- **Read-Only Database Queries**: The `database_query` tool only allows safe read operations on whitelisted collections.
- **Safety Step Limiter**: Execution hard-stops at `MAX_AGENT_STEPS=10` to eliminate runaway token loops.

---

## 📡 REST APIs

- `POST /api/agent/run` — Dispatches a new agent task with real-time Socket.IO broadcasting.
- `GET /api/executions` — Returns paginated history with status and verification score filters.
- `GET /api/executions/:executionId` — Returns full execution record with all steps and verification report.
- `GET /api/executions/:executionId/steps` — Returns step trace list.
- `GET /api/executions/:executionId/verification` — Returns verification report.
- `POST /api/executions/:executionId/reverify` — Re-runs verification engine on existing traces.
- `GET /api/health` — Checks backend and MongoDB connection status.
- `GET /api/ollama/health` — Checks Ollama availability and model status.
