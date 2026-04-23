# Principal App

A full-stack **Wealth Command Center** built with:

| Layer    | Stack |
|----------|-------|
| Backend  | [Fastify](https://fastify.dev) + [Prisma](https://prisma.io) + TypeScript |
| Frontend | [Vite](https://vitejs.dev) + React 18 + Tailwind CSS |
| Database | SQLite (dev) – swap `DATABASE_URL` for Postgres in production |
| Deploy   | Docker + Docker Compose |

---

## Quick Start (Docker Compose)

```bash
cd principal-app

# 1. Create backend env file
cp backend/.env.example backend/.env
#    Edit backend/.env – set a strong PRINCIPAL_API_KEY

# 2. Run migrations and start all services
docker compose run --rm backend sh -c "npx prisma migrate deploy"
docker compose up --build
```

Services:
- Backend API: http://localhost:4000
- Web UI:       http://localhost:5173

---

## Local Development (without Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env          # edit .env
npm run prisma:migrate         # creates dev.db
npm run dev                    # starts on :4000
```

### Frontend

```bash
cd web
npm install
npm run dev                    # starts on :5173
```

---

## API Overview

| Method | Path         | Auth  | Description                     |
|--------|--------------|-------|---------------------------------|
| GET    | /health      | –     | Health check                    |
| GET    | /wealth      | –     | Latest wealth snapshot          |
| POST   | /wealth      | ✅    | Record new wealth snapshot      |
| GET    | /activity    | –     | List execution records          |
| POST   | /chat        | ✅    | Chat / NLU command parsing      |
| GET    | /credits     | –     | List credit events              |
| POST   | /credits     | ✅    | Create credit event             |
| WS     | /credits/ws  | –     | Real-time credit alert stream   |

Authentication uses the `x-api-key` header matching `PRINCIPAL_API_KEY`.

---

## Directory Structure

```
principal-app/
├── backend/
│   ├── prisma/schema.prisma   # DB schema
│   ├── src/
│   │   ├── infra/             # db.ts, authz.ts
│   │   ├── models.ts          # shared domain types
│   │   ├── routes/            # chat, wealth, activity, credits
│   │   ├── services/          # wealthService, nluService, commandService, creditService
│   │   └── index.ts           # Fastify app entry point
│   ├── Dockerfile
│   └── package.json
├── web/
│   ├── src/
│   │   ├── api/               # client.ts, types.ts
│   │   ├── components/
│   │   │   ├── chat/          # ChatWindow
│   │   │   ├── dashboard/     # MoneyStrip, ActivityFeed, CreditTicker
│   │   │   └── layout/        # AppLayout, TopBar, SideNav
│   │   ├── pages/             # Home.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```
