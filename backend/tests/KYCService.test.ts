import KYCService from '../src/services/KYCService';
import { KYCDocument, KYCVerification, RiskScore, User } from '../src/models';

// Mock axios for AI service calls
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('KYCService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitKYC', () => {
    it('should create a KYC document successfully', async () => {
      const mockCreate = jest.spyOn(KYCDocument, 'create').mockResolvedValue({
        id: 1,
        userId: 1,
        documentType: 'passport',
        status: 'processing',
        aiVerified: false,
        requiresManualReview: false,
      } as any);

      const mockAuditLog = jest.spyOn(require('../src/models').AuditLog, 'create').mockResolvedValue({} as any);

      const data = {
        userId: 1,
        documentType: 'passport' as const,
        documentFrontUrl: 'https://example.com/front.jpg',
        selfieUrl: 'https://example.com/selfie.jpg',
        fullName: 'John Doe',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001',
      };

      const result = await KYCService.submitKYC(data);

      expect(result.success).toBe(true);
      expect(result.kycDocumentId).toBe(1);
      expect(result.status).toBe('processing');
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should handle errors during KYC submission', async () => {
      jest.spyOn(KYCDocument, 'create').mockRejectedValue(new Error('Database error'));

      const data = {
        userId: 1,
        documentType: 'passport' as const,
        documentFrontUrl: 'https://example.com/front.jpg',
        selfieUrl: 'https://example.com/selfie.jpg',
        fullName: 'John Doe',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001',
      };

      await expect(KYCService.submitKYC(data)).rejects.toThrow('Failed to submit KYC documents');
    });
  });

  describe('triggerAIVerification', () => {
    it('should successfully trigger AI verification', async () => {
      const mockKYCDocument = {
        id: 1,
        userId: 1,
        documentFrontUrl: 'https://example.com/front.jpg',
        documentBackUrl: 'https://example.com/back.jpg',
        selfieUrl: 'https://example.com/selfie.jpg',
        documentType: 'passport',
        fullName: 'John Doe',
        dateOfBirth: new Date('1990-01-01'),
        country: 'USA',
        update: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(KYCDocument, 'findByPk').mockResolvedValue(mockKYCDocument as any);
      jest.spyOn(KYCVerification, 'create').mockResolvedValue({} as any);
      jest.spyOn(require('../src/models').AuditLog, 'create').mockResolvedValue({} as any);

      mockedAxios.post.mockResolvedValue({
        data: {
          kycId: 1,
          overallResult: 'pass',
          overallConfidence: 0.92,
          requiresManualReview: false,
          verifications: [
            {
              type: 'identity',
              result: 'pass',
              confidence: 0.95,
            },
          ],
          processingTimeMs: 1500,
        },
      });

      await KYCService.triggerAIVerification(1);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/verify/complete'),
        expect.any(Object),
        expect.any(Object)
      );
      expect(mockKYCDocument.update).toHaveBeenCalled();
    });
  });

  describe('getKYCStatus', () => {
    it('should return KYC status for a user', async () => {
      const mockKYCDocument = {
        id: 1,
        status: 'approved',
        aiVerified: true,
        aiConfidence: 0.92,
        requiresManualReview: false,
        createdAt: new Date(),
        reviewedAt: new Date(),
        get: jest.fn().mockReturnValue([]),
      };

      jest.spyOn(KYCDocument, 'findOne').mockResolvedValue(mockKYCDocument as any);

      const result = await KYCService.getKYCStatus(1);

      expect(result.id).toBe(1);
      expect(result.status).toBe('approved');
      expect(result.aiVerified).toBe(true);
    });

    it('should return not_started status when no KYC found', async () => {
      jest.spyOn(KYCDocument, 'findOne').mockResolvedValue(null);

      const result = await KYCService.getKYCStatus(1);

      expect(result.status).toBe('not_started');
      expect(result.message).toBe('No KYC submission found');
    });
  });
});
