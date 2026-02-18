import request from 'supertest';
import app from '../src/index';

// Mock authentication middleware
jest.mock('../src/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 1, email: 'test@example.com', role: 'admin' };
    next();
  },
}));

describe('KYC API Endpoints', () => {
  describe('POST /api/kyc/submit', () => {
    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/kyc/submit')
        .send({
          documentType: 'passport',
          // Missing other required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/kyc/status', () => {
    it('should return KYC status for authenticated user', async () => {
      const response = await request(app)
        .get('/api/kyc/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'crypto-mining-backend');
    });
  });
});
