# cert-trainer

Gamified web app for studying the **CCA-F (Claude Certified Associate Fundamentals)** certification. Practice questions by domain, run full timed exams, get AI-powered explanations, earn XP and badges — available in English and Portuguese (PT-BR).


## Quick start (Docker)

The fastest way to run the full application locally — no Node or pnpm required on the host.

**1. Fill in your credentials in `docker-compose.yml`:**

```yaml
# docker-compose.yml → backend → environment
ANTHROPIC_AUTH_TOKEN: 'your-token-here'
```

**2. Start everything:**

```bash
docker compose up --build
```

- Frontend → [http://localhost](http://localhost)
- Backend API → [http://localhost:3000](http://localhost:3000)
- pgAdmin → [http://localhost:5050](http://localhost:5050)

The backend automatically runs Prisma migrations on startup. To seed questions and badges:

```bash
docker compose exec backend node -e "
  const { PrismaClient } = require('@prisma/client');
  console.log('Run: docker compose exec backend npx ts-node prisma/seed.ts');
"
# or simply run the seed from the host after installing dependencies (see Development section)
```

> To stop: `docker compose down`. To wipe data: `docker compose down -v`.



## Prerequisites (development)

| Requirement | Version |
|---|---|
| Node.js | **22 LTS** (required — pnpm 11 uses `node:sqlite`) |
| pnpm | 11+ |
| Docker (Rancher Desktop) | any |

> **Note:** Docker Desktop is not supported. Use [Rancher Desktop](https://rancherdesktop.io/).



## Installation

```bash
git clone git@github-ciandt:ciandt-brenodias/claude-cert-trainer.git
cd claude-cert-trainer
pnpm install
```

---

## Configuration

### 1. Backend environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | always | PostgreSQL connection string |
| `ANTHROPIC_AUTH_TOKEN` | for AI features | JWT from CI&T LLM proxy (`flow.ciandt.com`) |
| `ANTHROPIC_BASE_URL` | for AI features | CI&T proxy URL — default: `https://flow.ciandt.com/flow-llm-proxy/` |
| `ANTHROPIC_MODEL` | optional | Model override — default: `claude-haiku-4-5-20251001` |
| `FRONTEND_URL` | optional | CORS origin — default: `http://localhost:5173` |

### 2. Frontend environment

```bash
cp frontend/.env.example frontend/.env
```

`frontend/.env` only needs `VITE_API_URL=http://localhost:3000` (already set in the example).

---

## Running locally

### 1. Start the database

```bash
docker compose up -d
```

Starts PostgreSQL on `localhost:5432` and pgAdmin on `localhost:5050`.

### 2. Run migrations and seed

```bash
cd backend
npm run db:migrate   # applies Prisma migrations
npm run db:seed      # inserts questions and badges (EN + PT-BR)
```

### 3. Start backend and frontend

In separate terminals:

```bash
# Terminal 1 — backend (port 3000)
cd backend && npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Available commands

### Backend (`cd backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start NestJS in watch mode |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run 91 unit tests (Jest) |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Apply pending Prisma migrations |
| `npm run db:seed` | Insert seed data (questions + badges) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run generate-questions` | Generate questions via Claude API (see below) |

### Frontend (`cd frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run test` | Run 26 unit tests (Vitest) |
| `npm run lint` | Run ESLint |

---

## Generating questions via Claude

The `generate-questions` script calls the Claude API to create new questions and inserts them with `isApproved=false`. Review and approve them in Prisma Studio before they appear in practice sessions.

```bash
cd backend

# 5 questions across all domains (default)
npm run generate-questions

# 10 questions, specific domain, English
npm run generate-questions -- --count=10 --domain=PROMPT_ENGINEERING --lang=en

# 5 questions in Portuguese (PT-BR)
npm run generate-questions -- --count=5 --lang=pt-BR
```

**Flags:**

| Flag | Values | Default |
|---|---|---|
| `--count` | 1–20 | `5` |
| `--domain` | `AGENTIC_ARCHITECTURE`, `TOOL_MCP_INTEGRATION`, `CLAUDE_CODE_WORKFLOWS`, `PROMPT_ENGINEERING`, `CONTEXT_MANAGEMENT` | all domains |
| `--difficulty` | `EASY`, `MEDIUM`, `HARD` | mixed |
| `--lang` | `en`, `pt-BR` | `en` |

After generation, open Prisma Studio to review and approve:

```bash
npm run db:studio
```

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind v4 + Framer Motion |
| Backend | NestJS 10 + TypeScript |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 (Docker) |
| State (frontend) | React Query v5 + Zustand v4 |
| i18n | i18next + react-i18next (EN / PT-BR) |
| AI | Claude API via CI&T LLM proxy |

---

## Project structure

```
cert-trainer/
├── backend/
│   ├── prisma/               ← schema, migrations, seed
│   ├── scripts/              ← generate-questions.ts
│   └── src/
│       ├── auth/             ← local credentials (.credentials.json)
│       ├── claude/           ← explain + generate endpoints
│       ├── exams/            ← session management
│       ├── gamification/     ← XP, levels, badge engine
│       ├── questions/        ← question catalog
│       └── users/            ← progress, stats, badges
├── frontend/
│   └── src/
│       ├── api/              ← HTTP layer
│       ├── components/       ← UI components + sections
│       ├── hooks/            ← React Query hooks
│       ├── i18n/             ← en.json, pt-BR.json
│       └── stores/           ← Zustand (session, language)
└── shared/
    └── src/types.ts          ← shared TypeScript enums and interfaces
```

---

## Identity model

The app is single-user per installation. On first request, `GET /auth/me` reads `CURRENT_USER` from the environment (or generates a random name) and creates a `.credentials.json` file in the project root with a UUID. Each developer clones the repo and runs their own instance against their own database.

No login, no OAuth. The leaderboard is local.
