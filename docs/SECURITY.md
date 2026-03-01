# Security Practices

## Overview

This document outlines the security practices implemented in the Crypto Mining & Fintech Platform.

## Authentication & Authorization

### JWT Implementation

- **Access Tokens**: Short-lived (15 minutes) tokens for API requests
- **Refresh Tokens**: Long-lived (7 days) tokens stored in Redis
- **Token Rotation**: Automatic token refresh before expiration
- **Secure Storage**: Tokens stored in httpOnly cookies (recommended) or localStorage

### Two-Factor Authentication (2FA)

- TOTP-based 2FA using Speakeasy library
- QR code generation for easy setup
- Backup codes for account recovery
- Time-based token validation with 2-step window

### Password Security

- **Hashing**: bcrypt with configurable rounds (default: 12)
- **Minimum Length**: 8 characters required
- **Complexity**: Recommended to include uppercase, lowercase, numbers, and symbols
- **Reset Flow**: Secure password reset with time-limited tokens

## Input Validation & Sanitization

### express-validator

All endpoints use express-validator for:
- Type validation
- Format validation
- Sanitization
- Custom validation rules

Example:
```typescript
validate([
  body('email').isEmail().normalizeEmail(),
  body('amount').isFloat({ min: 0.00000001 }),
  body('address').trim().notEmpty()
])
```

## Rate Limiting

### Endpoint-Specific Limits

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Password Reset**: 3 requests per hour
- **Withdrawals**: 10 requests per hour

### Implementation

Uses express-rate-limit with Redis store for distributed rate limiting.

## Database Security

### SQL Injection Prevention

- **ORM Usage**: Sequelize ORM with parameterized queries
- **Input Validation**: All inputs validated before database operations
- **Least Privilege**: Database user has minimal required permissions

### Data Encryption

- **Passwords**: bcrypt hashed with salt
- **Sensitive Data**: AES encryption for stored sensitive information
- **Environment Secrets**: Never committed to repository

## API Security

### CORS Configuration

```typescript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

### Security Headers (Helmet.js)

- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- X-XSS-Protection

## Audit Logging

All critical operations are logged:

- User authentication (login/logout)
- KYC submissions and reviews
- Wallet transactions
- Withdrawal requests and approvals
- Admin actions

Log format:
```typescript
{
  userId: number,
  action: string,
  resource: string,
  ipAddress: string,
  userAgent: string,
  timestamp: Date,
  details: Object
}
```

## File Upload Security

### Validation

- File type verification (MIME type + extension)
- File size limits (default: 5MB)
- Malware scanning (recommended)
- Secure filename sanitization

### Storage

- Files stored outside web root
- Unique filenames (UUID)
- Access controlled via API endpoints

## Withdrawal Security

### Multi-Layer Verification

1. **Email Verification**: Code sent to registered email
2. **2FA Verification**: Required if enabled
3. **Admin Approval**: For withdrawals above threshold
4. **Daily Limits**: Configurable per-user limits
5. **IP Verification**: Compare with registration IP (optional)

### Withdrawal Flow

```
Request → Email Code → 2FA (if enabled) → Admin Review (if >threshold) → Process
```

## Network Security

### HTTPS/TLS

- TLS 1.2+ required
- Strong cipher suites
- HSTS enabled
- Certificate pinning (mobile apps)

### Firewall Rules

- Only expose necessary ports (80, 443)
- Rate limiting at network level
- DDoS protection (Cloudflare recommended)

## Monitoring & Alerts

### Security Events to Monitor

- Failed login attempts
- Multiple 2FA failures
- Large withdrawal requests
- KYC document uploads
- Admin actions
- API rate limit violations

### Recommended Tools

- Winston for application logging
- PM2 for process monitoring
- Sentry for error tracking
- Datadog or New Relic for APM

## Environment Variables

### Required Security Variables

```env
# JWT Secrets (minimum 32 characters)
JWT_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<strong-random-string>

# Database Password
DB_PASSWORD=<strong-password>

# Redis Password
REDIS_PASSWORD=<strong-password>

# Encryption Key
ENCRYPTION_KEY=<strong-random-string>

# SMTP Credentials
SMTP_PASSWORD=<secure-password>

# API Keys
STRIPE_SECRET_KEY=<secret-key>
WEB3_PROVIDER_URL=<provider-url>
```

### Secrets Management

- Use environment variables, never hardcode
- Use secrets management tools (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly
- Restrict access to production secrets

## Best Practices

### Development

- [ ] Never commit secrets to repository
- [ ] Use `.env.example` for templates
- [ ] Enable security linters (ESLint security plugins)
- [ ] Run security audits (`npm audit`)
- [ ] Keep dependencies updated
- [ ] Use Dependabot for automated updates

### Production

- [ ] Use HTTPS everywhere
- [ ] Enable all security headers
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Backup strategy implemented
- [ ] Incident response plan
- [ ] Regular security updates
- [ ] Access control and least privilege

### Code Review Checklist

- [ ] Input validation present
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF tokens (if applicable)
- [ ] Authentication checks
- [ ] Authorization checks
- [ ] Rate limiting applied
- [ ] Audit logging present
- [ ] Error handling without data leakage
- [ ] Secure session management

## Incident Response

### Steps

1. **Detect**: Monitor logs and alerts
2. **Contain**: Isolate affected systems
3. **Investigate**: Determine scope and impact
4. **Eradicate**: Remove threat
5. **Recover**: Restore normal operations
6. **Review**: Post-incident analysis

### Contact

Security issues: security@cryptomining.com

## Compliance

### Data Protection

- GDPR compliance (EU users)
- Data encryption at rest and in transit
- User data deletion requests
- Privacy policy

### Financial Regulations

- KYC/AML compliance
- Transaction monitoring
- Suspicious activity reporting
- Record retention

## Regular Security Tasks

### Daily

- Monitor logs for anomalies
- Check system health
- Review failed authentication attempts

### Weekly

- Review audit logs
- Update dependencies with security patches
- Check for suspicious transactions

### Monthly

- Full security audit
- Review and update security policies
- Test backup and recovery procedures
- Rotate credentials

### Quarterly

- Penetration testing
- Third-party security audit
- Update incident response plan
- Security training for team

## Security Updates Log

### 2026-02-18: Critical Dependency Updates

**Fixed Vulnerabilities:**
- **Multer**: Updated from 1.4.5-lts.1 to 2.0.2
  - Fixed multiple DoS vulnerabilities
  - Fixed memory leak issues
  - Improved error handling
  
- **Nodemailer**: Updated from 6.9.7 to 7.0.11
  - Fixed DoS via recursive calls
  - Fixed email routing issues
  - Improved address parsing

**Action Taken**: All vulnerable dependencies updated to patched versions.

**Verification**: Run `npm audit` to verify all vulnerabilities are resolved.

See [SECURITY-FIXES-2026-02-18.md](SECURITY-FIXES-2026-02-18.md) for detailed information.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
