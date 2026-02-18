# AI-Driven KYC Verification System Integration

## Overview

This repository now includes a complete AI-driven KYC (Know Your Customer) verification system integrated into the crypto mining and fintech platform. The system autonomously handles document uploads, performs automated verification using machine learning models, and provides real-time feedback.

## New Features

### 1. Python AI Microservice (`/ai-service`)
- **Flask-based REST API** running on port 5002
- **Four AI verification modules:**
  - Identity Verification (face matching)
  - Fraud Detection (document tampering)
  - Document Quality Check (OCR and validation)
  - Compliance Checking (sanctions, PEP, age verification)
- Complete audit logging of all AI decisions
- Configurable confidence thresholds

### 2. Enhanced Backend (`/backend`)
- **New Models:**
  - `KYCDocument` - Enhanced with AI verification fields
  - `KYCVerification` - Records individual AI verification results
  - `RiskScore` - User risk profiles with automated re-verification schedules
  
- **New Services:**
  - `KYCService` - Complete business logic for KYC processing
  
- **New Controllers & Routes:**
  - `KYCController` - HTTP request handlers
  - `/api/kyc/*` - RESTful API endpoints
  
- **Security Enhancements:**
  - Dedicated rate limiters for KYC endpoints
  - Complete input validation
  - Comprehensive audit logging

### 3. API Endpoints

#### User Endpoints
```
POST   /api/kyc/submit       Submit KYC documents (5 per hour)
GET    /api/kyc/status       Check verification status (20 per minute)
```

#### Admin Endpoints
```
GET    /api/kyc/admin/pending          View pending submissions
GET    /api/kyc/status/:userId         Check user KYC status
PUT    /api/kyc/admin/review/:id       Manual review
POST   /api/kyc/admin/verify/:id       Trigger verification
```

## Architecture

```
┌─────────────────┐
│   Frontend      │ (React - to be implemented)
│   (React UI)    │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐       HTTP        ┌──────────────────┐
│   Node.js API   │◄─────────────────►│  Python AI       │
│   (Backend)     │                   │  Service         │
│   Port 5000     │                   │  Port 5002       │
│                 │                   │                  │
│  - KYC Service  │                   │  - Identity AI   │
│  - Controllers  │                   │  - Fraud AI      │
│  - Routes       │                   │  - Document AI   │
│  - Models       │                   │  - Compliance    │
└────────┬────────┘                   └──────────────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   Database      │
│                 │
│  - users        │
│  - kyc_documents│
│  - kyc_verifications
│  - risk_scores  │
│  - audit_logs   │
└─────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- Redis (optional, for caching)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python src/app.py
```

### Environment Configuration

#### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_NAME=crypto_mining_platform
DB_USER=postgres
DB_PASSWORD=your_password

# AI Service
AI_SERVICE_URL=http://localhost:5002

# JWT Secret
JWT_SECRET=your-secret-key
```

#### AI Service (.env)
```env
# Flask Configuration
FLASK_ENV=development
PORT=5002

# Model Thresholds
IDENTITY_CONFIDENCE_THRESHOLD=0.85
FRAUD_CONFIDENCE_THRESHOLD=0.75
DOCUMENT_QUALITY_THRESHOLD=0.80
```

## Verification Workflow

1. **User Submission**
   - User submits documents via API
   - Backend validates and creates record
   - Status set to 'processing'

2. **AI Processing**
   - Backend calls AI service with document URLs
   - AI performs 4 parallel verifications
   - Each verification returns result + confidence

3. **Result Aggregation**
   - Results stored in database
   - Overall confidence calculated
   - Decision logic applied:
     - All pass + high confidence → Approved
     - Any fail → Rejected
     - Low confidence → Manual review

4. **Risk Scoring**
   - Risk score calculated from results
   - Re-verification scheduled based on risk level:
     - Critical (70+): 30 days
     - High (40-69): 90 days
     - Medium (20-39): 180 days
     - Low (<20): 365 days

5. **Notification**
   - User notified of status
   - Admin alerted for manual reviews

## Testing

### Run Backend Tests
```bash
cd backend
npm test
npm test -- --coverage
```

### Test Coverage
- KYCService unit tests
- API integration tests
- Model validation tests

## Security Features

### Authentication & Authorization
- JWT-based authentication on all endpoints
- Role-based access control (user, admin, superadmin)
- Protected admin routes

### Rate Limiting
- KYC Submissions: 5 per hour per IP
- Status Checks: 20 per minute per IP
- Admin Operations: 30 per minute per IP

### Data Protection
- Input validation on all endpoints
- Sequelize ORM prevents SQL injection
- Helmet.js security headers
- CORS configuration

### Audit Trail
- Complete logging of all KYC operations
- AI decision tracking
- Admin action logging

## Documentation

- **[KYC Verification Guide](docs/KYC_VERIFICATION.md)** - Complete system documentation
- **[AI Service README](ai-service/README.md)** - AI service details
- **[Backend README](backend/README.md)** - Backend API documentation

## Production Deployment Checklist

### Before Production
- [ ] Train actual ML models on production data
- [ ] Replace simulated verifiers with real implementations
- [ ] Set up secure cloud storage for documents (S3/Azure Blob)
- [ ] Configure production database with proper backups
- [ ] Set up monitoring and alerting (New Relic/Datadog)
- [ ] Implement proper logging aggregation
- [ ] Configure SSL/TLS certificates
- [ ] Set up CI/CD pipeline
- [ ] Perform security audit
- [ ] Load testing

### Production Configuration
- Use environment-specific `.env` files
- Enable PostgreSQL SSL connections
- Configure Redis for session storage
- Set up separate AI service instances for redundancy
- Implement document retention policies
- Configure backup and disaster recovery

## Maintenance

### Regular Tasks
- **Weekly**: Review pending manual reviews
- **Monthly**: Check AI model performance metrics
- **Quarterly**: Retrain ML models with new data
- **Annually**: Security audit and compliance review

### Monitoring
- API response times
- AI service availability
- Database query performance
- Rate limit hits
- Failed verification rates

## Support & Troubleshooting

### Common Issues

**AI Service Connection Failed**
```bash
# Check if AI service is running
curl http://localhost:5002/health

# Check environment variable
echo $AI_SERVICE_URL
```

**Database Connection Error**
```bash
# Verify PostgreSQL is running
psql -U postgres -d crypto_mining_platform

# Check connection settings in .env
```

**High Manual Review Rate**
- Review confidence thresholds in AI service
- Check document image quality requirements
- Verify training data diversity

## License

MIT License - See LICENSE file for details

## Contributors

This AI-driven KYC verification system was developed to provide autonomous, secure, and compliant identity verification for the crypto mining platform.
