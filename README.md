# Crypto Mining & Fintech Platform

A comprehensive, full-stack intelligent crypto mining and fintech platform that allows users to manage cloud mining, crypto wallets, fiat wallets, withdrawals with verification, and KYC document verification.

## 🚀 Features

- **Authentication & User Management** - JWT-based auth, 2FA with TOTP, role-based access control
- **KYC / Document Verification** - Multi-step KYC onboarding with admin review dashboard
- **Mining Dashboard** - Real-time stats, contract management, simulation engine for BTC/ETH/LTC
- **Wallet Management** - Multi-currency crypto and fiat wallets with transaction history
- **Withdrawal System** - Multi-step verification, admin approval workflow, daily limits
- **Security Features** - Rate limiting, input validation, bcrypt hashing, audit logging

## 🛠️ Tech Stack

**Backend**: Node.js 20+ | Express | TypeScript | PostgreSQL | Redis | JWT | Speakeasy

**Frontend**: React 18 | TypeScript | Vite | Tailwind CSS | Zustand | Axios | React Hook Form

**Mobile**: React Native | Expo

**Infrastructure**: Docker | Docker Compose | GitHub Actions | Nginx

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
git clone https://github.com/cashpilotthrive-hue/.github.git
cd .github
docker-compose up -d
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/v1/health

### Manual Setup

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

**Mobile:**
```bash
cd mobile
npm install
npm start
```

## 📚 Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [Architecture Overview](docs/ARCHITECTURE.md) - System architecture
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Security Practices](docs/SECURITY.md) - Security guidelines

## 🔐 Key API Endpoints

**Auth:** `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/enable-2fa`

**Wallets:** `/api/v1/wallets`, `/api/v1/wallets/:id/deposit`, `/api/v1/wallets/transfer`

**Mining:** `/api/v1/mining/contracts`, `/api/v1/mining/stats`

**Withdrawals:** `/api/v1/withdrawals`, `/api/v1/withdrawals/:id/verify`

**KYC:** `/api/v1/kyc`

See [docs/API.md](docs/API.md) for complete documentation.

## 🧪 Development

```bash
# Test
npm test

# Lint
npm run lint

# Build
npm run build
```

## 🚢 Deployment

```bash
docker-compose build
docker-compose up -d
docker-compose logs -f
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment.

## 🔒 Security

- JWT authentication with token rotation
- Rate limiting & input validation
- Password hashing with bcrypt
- 2FA support & audit logging
- HTTPS & CORS configuration

## 📄 License

MIT License

## 📧 Support

Email: support@cryptomining.com
