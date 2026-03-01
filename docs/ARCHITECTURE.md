# Architecture Overview

## System Architecture

```
┌─────────────────┐
│   React App     │
│   (Frontend)    │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Nginx Proxy    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Express API    │────▶│  PostgreSQL  │
│   (Backend)     │     │   Database   │
└────────┬────────┘     └──────────────┘
         │
         ├──────────────▶┌──────────────┐
         │               │    Redis     │
         │               │    Cache     │
         │               └──────────────┘
         │
         └──────────────▶┌──────────────┐
                         │   External   │
                         │   Services   │
                         └──────────────┘
                         (SMTP, Stripe,
                          Web3, etc.)
```

## Technology Stack

### Frontend Layer

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast HMR and optimized builds)
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **State Management**: Zustand (lightweight state management)
- **Forms**: React Hook Form + Zod (validation)
- **HTTP Client**: Axios (with interceptors for auth)
- **Routing**: React Router v6

### Backend Layer

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js with TypeScript
- **ORM**: Sequelize (PostgreSQL)
- **Authentication**: JWT (jsonwebtoken)
- **2FA**: Speakeasy (TOTP)
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate-limit

### Data Layer

- **Primary Database**: PostgreSQL 16
  - ACID compliance
  - JSON support for metadata
  - Advanced indexing
  
- **Cache**: Redis 7
  - Session storage
  - Rate limiting
  - Real-time data

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **CI/CD**: GitHub Actions
- **Monitoring**: Winston (logging)

## Application Layers

### Presentation Layer (Frontend)

**Responsibilities:**
- User interface rendering
- Form validation
- State management
- API communication
- Real-time updates

**Key Components:**
- Pages (Dashboard, Wallets, Mining, etc.)
- UI Components (Button, Input, Card)
- Layout & Navigation
- Auth Guards

### API Layer (Backend Routes)

**Responsibilities:**
- HTTP request handling
- Route definition
- Request validation
- Response formatting

**Endpoints:**
- `/api/v1/auth/*` - Authentication
- `/api/v1/wallets/*` - Wallet operations
- `/api/v1/mining/*` - Mining contracts
- `/api/v1/withdrawals/*` - Withdrawal management
- `/api/v1/kyc/*` - KYC verification

### Business Logic Layer (Services)

**Responsibilities:**
- Core business logic
- Complex operations
- Data transformation
- External integrations

**Services:**
- AuthService - User authentication
- WalletService - Wallet management
- MiningService - Mining operations
- WithdrawalService - Withdrawal processing
- KYCService - Document verification

### Data Access Layer (Models)

**Responsibilities:**
- Database interaction
- Data validation
- Relationships
- Hooks (pre/post operations)

**Models:**
- User
- Wallet
- Transaction
- MiningContract
- Withdrawal
- KYCDocument
- Notification
- AuditLog

## Database Schema

### Users Table
```sql
id, email, password, firstName, lastName, role, 
isEmailVerified, is2FAEnabled, twoFactorSecret,
kycStatus, isActive, lastLoginAt
```

### Wallets Table
```sql
id, userId, walletType, currency, balance, 
address, isActive
```

### Transactions Table
```sql
id, userId, walletId, type, amount, currency,
status, description, metadata, transactionHash
```

### MiningContracts Table
```sql
id, userId, contractName, cryptocurrency, hashRate,
duration, price, startDate, endDate, status, totalEarnings
```

### Withdrawals Table
```sql
id, userId, walletId, amount, currency, destination,
verificationCode, codeExpiresAt, status, failureReason,
approvedBy, approvedAt, processedAt, transactionHash
```

### KYCDocuments Table
```sql
id, userId, documentType, documentNumber, 
documentFrontUrl, documentBackUrl, selfieUrl,
fullName, dateOfBirth, address, city, state, 
country, postalCode, status, rejectionReason,
reviewedBy, reviewedAt
```

## Data Flow

### Authentication Flow

```
1. User submits credentials
2. Backend validates credentials
3. Hash password compared
4. JWT tokens generated
5. Tokens stored in Redis
6. Tokens returned to frontend
7. Frontend stores tokens
8. Subsequent requests include token
9. Middleware validates token
10. Request processed
```

### Withdrawal Flow

```
1. User initiates withdrawal
2. System validates balance
3. Verification code generated
4. Email sent with code
5. User enters code
6. 2FA verification (if enabled)
7. Admin approval (if amount > threshold)
8. Transaction processed
9. Blockchain interaction
10. Balance updated
11. Transaction recorded
12. User notified
```

### Mining Rewards Flow

```
1. Cron job triggers (hourly)
2. System fetches active contracts
3. Calculate earnings per contract
4. Update contract total earnings
5. Credit user wallet
6. Create transaction record
7. Update expired contracts
8. Send notifications (if configured)
```

## Security Architecture

### Authentication & Authorization

```
Request → Rate Limiter → JWT Validation → 
Role Check → KYC Check → Handler
```

### Data Protection

- Passwords: bcrypt hashing
- Sensitive data: AES encryption
- Tokens: JWT with expiration
- Sessions: Redis with TTL

### Network Security

- HTTPS only (TLS 1.2+)
- CORS configuration
- Security headers (Helmet)
- DDoS protection

## Scalability Considerations

### Horizontal Scaling

- **Backend**: Stateless API servers
- **Database**: Read replicas
- **Cache**: Redis cluster
- **Load Balancer**: Nginx or cloud LB

### Vertical Scaling

- Increase server resources
- Database optimization
- Query optimization
- Indexing strategy

### Caching Strategy

- **Redis**: Session data, rate limits
- **Application**: Query result caching
- **CDN**: Static assets

## Monitoring & Logging

### Application Logging

- Winston for structured logging
- Log levels: error, warn, info, debug
- Separate files for errors
- Log rotation

### Audit Logging

All critical operations logged:
- Authentication events
- Financial transactions
- Admin actions
- KYC operations

### Metrics

- Request rate
- Response time
- Error rate
- Database query performance
- Cache hit rate

## External Integrations

### Email Service

- Nodemailer for transactional emails
- Templates for different event types
- Retry logic for failures

### Payment Gateway

- Stripe for fiat payments
- Webhook handlers for events
- Idempotency keys

### Blockchain

- Web3.js for Ethereum
- Bitcoin RPC for Bitcoin
- Transaction monitoring
- Gas optimization

## Deployment Architecture

### Development

```
Docker Compose:
- Frontend (port 3000)
- Backend (port 5000)
- PostgreSQL (port 5432)
- Redis (port 6379)
```

### Production

```
Cloud Infrastructure:
- Load Balancer (SSL termination)
- Frontend Servers (multiple instances)
- Backend Servers (auto-scaling)
- Database (managed service)
- Redis Cluster
- CDN for static assets
```

## Performance Optimization

### Backend

- Connection pooling
- Query optimization
- Caching strategy
- Compression (gzip)
- Rate limiting

### Frontend

- Code splitting
- Lazy loading
- Asset optimization
- Service Worker
- CDN delivery

### Database

- Proper indexing
- Query optimization
- Connection pooling
- Regular maintenance

## Future Enhancements

- **WebSocket**: Real-time updates
- **Mobile App**: React Native implementation
- **Advanced Analytics**: Machine learning insights
- **Multi-language**: i18n support
- **Advanced Trading**: Automated trading features
- **Referral System**: User referral program
