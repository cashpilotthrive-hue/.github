# GoTradePal

GoTradePal is an AI-powered Personal Economic Operating System MVP for mobile and web admin use. It includes an Expo React Native app, FastAPI backend, PostgreSQL schema, Redis-ready caching, AI agent orchestration, Docker, CI, and documentation.

## Apps
- `mobile/`: Expo + React Native + TypeScript app for iOS and Android.
- `backend/`: FastAPI REST API with JWT authentication, SQLAlchemy models, rate limiting hooks, audit logging, and AI agents.
- `admin/`: React + Vite admin dashboard for user management, analytics, content, AI monitoring, and reports.
- `database/migrations/`: SQL database design and seed data.

## Quick Start
```bash
cp .env.example .env
docker compose up --build
```

Mobile development:
```bash
cd mobile
npm install
npm run start
```

Backend tests:
```bash
cd backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
pytest
```

## Compliance Notice
Payment, banking, and investment features are integration-ready only. Do not process real money, provide regulated investment advice, or connect production banking APIs until legal/compliance approval is complete.
