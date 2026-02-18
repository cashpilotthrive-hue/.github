# AI-Driven KYC Verification System

## Overview

The AI-driven KYC verification system autonomously processes identity documents, performs fraud detection, compliance checks, and maintains risk scores for all users.

## Key Features

- Autonomous AI verification with identity recognition, fraud detection, and compliance checks
- Multi-layer security with 4 verification types
- Real-time processing and feedback
- Dynamic risk scoring with automated re-verification
- Complete audit trail of all AI decisions
- Manual review support for edge cases
- RPA integration for high-risk workflows

## Architecture

```
Frontend (React) → Backend (Node.js) → AI Service (Python)
                         ↓
                   PostgreSQL Database
```

## API Endpoints

### User Endpoints
- `POST /api/kyc/submit` - Submit KYC documents
- `GET /api/kyc/status` - Check verification status

### Admin Endpoints
- `GET /api/kyc/admin/pending` - View pending submissions
- `PUT /api/kyc/admin/review/:id` - Manual review
- `POST /api/kyc/admin/verify/:id` - Trigger verification

## Verification Process

1. User submits documents
2. AI performs 4 verifications (identity, fraud, quality, compliance)
3. Results aggregated with confidence scores
4. Final decision: approved/rejected/manual_review
5. Risk score calculated and updated

## Risk Levels

- **Low** (< 20): Annual review
- **Medium** (20-39): Review every 180 days
- **High** (40-69): Review every 90 days
- **Critical** (70+): Review every 30 days

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
python src/app.py
```

## Testing

```bash
cd backend
npm test
```
