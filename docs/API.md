# API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response

```json
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": [ /* validation errors if applicable */ ]
}
```

## Endpoints

### Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "kycStatus": "not_started"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Enable 2FA

```http
POST /auth/enable-2fa
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "2FA setup initiated",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

### Wallets

#### Create Wallet

```http
POST /wallets
Authorization: Bearer <token>
Content-Type: application/json

{
  "walletType": "crypto",
  "currency": "BTC",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```

#### Get User Wallets

```http
GET /wallets
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "walletType": "crypto",
      "currency": "BTC",
      "balance": "0.05234",
      "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Deposit to Wallet

```http
POST /wallets/:id/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 0.001,
  "description": "Test deposit"
}
```

### Mining

#### Purchase Contract

```http
POST /mining/contracts
Authorization: Bearer <token>
Content-Type: application/json

{
  "contractName": "BTC Standard",
  "cryptocurrency": "BTC",
  "hashRate": 100,
  "duration": 365,
  "price": 1000
}
```

#### Get Mining Stats

```http
GET /mining/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "totalHashRate": 250.5,
    "totalEarnings": 0.052,
    "activeContracts": 3,
    "earningsByCrypto": {
      "BTC": 0.02,
      "ETH": 0.25,
      "LTC": 1.5
    }
  }
}
```

### Withdrawals

#### Request Withdrawal

```http
POST /withdrawals
Authorization: Bearer <token>
Content-Type: application/json

{
  "walletId": 1,
  "amount": 0.01,
  "destination": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```

**Response:**
```json
{
  "message": "Withdrawal request created. Please check your email for verification code.",
  "data": {
    "id": 1,
    "userId": 1,
    "walletId": 1,
    "amount": "0.01",
    "currency": "BTC",
    "destination": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "status": "pending"
  }
}
```

#### Verify Withdrawal

```http
POST /withdrawals/:id/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "ABC123"
}
```

### KYC

#### Submit KYC Documents

```http
POST /kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentType": "passport",
  "documentNumber": "AB1234567",
  "documentFrontUrl": "https://...",
  "selfieUrl": "https://...",
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "postalCode": "10001"
}
```

#### Get KYC Status

```http
GET /kyc
Authorization: Bearer <token>
```

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Password Reset: 3 requests per hour
- Withdrawals: 10 requests per hour

## Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
