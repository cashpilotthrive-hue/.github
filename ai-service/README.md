# AI-Driven KYC Verification Service

Python-based AI microservice for autonomous KYC (Know Your Customer) verification using machine learning models.

## Features

- **Identity Verification**: Face recognition comparing document photo with selfie
- **Fraud Detection**: Document tampering and pattern analysis
- **Document Quality Check**: Image quality, OCR, and format validation
- **Compliance Checking**: Sanctions lists, age verification, PEP checks
- **Audit Logging**: Complete audit trail of AI decisions
- **RESTful API**: Easy integration with Node.js backend

## Architecture

- **Flask**: Lightweight web framework
- **TensorFlow**: Machine learning models (placeholder for production)
- **OpenCV**: Image processing
- **Tesseract OCR**: Text extraction from documents
- **Redis/Celery**: Async task processing (optional)

## Installation

```bash
cd ai-service
pip install -r requirements.txt
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key environment variables:
- `PORT`: Service port (default: 5002)
- `IDENTITY_CONFIDENCE_THRESHOLD`: Min confidence for identity verification (0-1)
- `FRAUD_CONFIDENCE_THRESHOLD`: Min confidence for fraud detection (0-1)
- `DOCUMENT_QUALITY_THRESHOLD`: Min confidence for document quality (0-1)

## Running the Service

### Development
```bash
python src/app.py
```

### Production
```bash
gunicorn -w 4 -b 0.0.0.0:5002 src.app:app
```

## API Endpoints

### Health Check
```
GET /health
```

### Identity Verification
```
POST /api/verify/identity
Content-Type: application/json

{
  "kycId": 123,
  "documentFrontUrl": "https://...",
  "selfieUrl": "https://..."
}
```

### Fraud Detection
```
POST /api/verify/fraud
Content-Type: application/json

{
  "kycId": 123,
  "documentUrls": ["https://..."],
  "userData": {
    "fullName": "John Doe",
    "country": "US"
  }
}
```

### Document Verification
```
POST /api/verify/document
Content-Type: application/json

{
  "kycId": 123,
  "documentUrl": "https://...",
  "documentType": "passport"
}
```

### Compliance Check
```
POST /api/verify/compliance
Content-Type: application/json

{
  "kycId": 123,
  "userData": {
    "fullName": "John Doe",
    "dateOfBirth": "1990-01-01",
    "country": "US",
    "address": "123 Main St"
  }
}
```

### Complete Verification
Runs all verifications in sequence:
```
POST /api/verify/complete
Content-Type: application/json

{
  "kycId": 123,
  "documentFrontUrl": "https://...",
  "documentBackUrl": "https://...",
  "selfieUrl": "https://...",
  "documentType": "passport",
  "documentUrls": ["https://..."],
  "userData": {...}
}
```

## Response Format

All verification endpoints return:

```json
{
  "kycId": 123,
  "verificationType": "identity",
  "result": "pass|fail|manual_review",
  "confidence": 0.9234,
  "details": {
    "checksPassed": {...},
    "metrics": {...}
  },
  "processingTimeMs": 1234,
  "aiModel": "model-name-v1.0"
}
```

## Security

- All AI decisions are logged in `audit.log`
- API endpoints should be protected with authentication (implement in production)
- Sensitive data should be encrypted in transit (HTTPS)
- Consider rate limiting for production use

## Production Deployment

For production:
1. Train and deploy actual ML models
2. Implement proper authentication/authorization
3. Set up model monitoring and retraining pipeline
4. Configure proper logging and monitoring
5. Use cloud ML services for better performance
6. Implement caching for repeated verifications

## Model Training

To train production models:
1. Collect diverse training datasets
2. Preprocess and label data
3. Train models using TensorFlow/PyTorch
4. Validate on test set
5. Deploy models to `./models/` directory
6. Update model paths in `.env`

## Testing

```bash
pytest tests/
```

## Integration with Backend

The Node.js backend should call these endpoints during KYC submission:
1. User submits KYC documents
2. Backend calls `/api/verify/complete`
3. AI service processes and returns results
4. Backend updates KYC status based on results
5. Manual review triggered if `requiresManualReview: true`
