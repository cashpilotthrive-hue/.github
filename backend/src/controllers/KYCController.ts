import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import KYCService from '../services/KYCService';
import logger from '../config/logger';

export class KYCController {
  async submitKYC(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const kycData = req.body;

      const kyc = await KYCService.submitKYC(userId, kycData);

      res.status(201).json({
        message: 'KYC submitted successfully',
        data: kyc,
      });
    } catch (error: any) {
      logger.error('Submit KYC error:', error);
      res.status(400).json({
        error: error.message || 'Failed to submit KYC',
      });
    }
  }

  async getUserKYC(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const kyc = await KYCService.getUserKYC(userId);

      res.status(200).json({
        data: kyc,
      });
    } catch (error: any) {
      logger.error('Get user KYC error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get KYC',
      });
    }
  }

  async getPendingKYCs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { limit, offset } = req.query;

      const result = await KYCService.getPendingKYCs(
        limit ? parseInt(limit as string) : 50,
        offset ? parseInt(offset as string) : 0
      );

      res.status(200).json({
        data: result,
      });
    } catch (error: any) {
      logger.error('Get pending KYCs error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get pending KYCs',
      });
    }
  }

  async reviewKYC(req: AuthRequest, res: Response): Promise<void> {
    try {
      const adminId = req.user!.id;
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      const kyc = await KYCService.reviewKYC(
        adminId,
        parseInt(id),
        status,
        rejectionReason
      );

      res.status(200).json({
        message: `KYC ${status} successfully`,
        data: kyc,
      });
    } catch (error: any) {
      logger.error('Review KYC error:', error);
      res.status(400).json({
        error: error.message || 'Failed to review KYC',
      });
    }
  }

  async getKYCStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await KYCService.getKYCStats();

      res.status(200).json({
        data: stats,
      });
    } catch (error: any) {
      logger.error('Get KYC stats error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get KYC stats',
      });
    }
  }
}

export default new KYCController();
