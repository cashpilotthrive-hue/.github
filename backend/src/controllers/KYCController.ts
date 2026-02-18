import { Request, Response } from 'express';
import KYCService from '../services/KYCService';
import logger from '../config/logger';

class KYCController {
  /**
   * Submit KYC documents
   * POST /api/kyc/submit
   */
  async submitKYC(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id; // From auth middleware
      
      const {
        documentType,
        documentNumber,
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
        fullName,
        dateOfBirth,
        address,
        city,
        state,
        country,
        postalCode,
      } = req.body;

      // Validate required fields
      if (!documentType || !documentFrontUrl || !selfieUrl || !fullName || !dateOfBirth || !country) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: documentType, documentFrontUrl, selfieUrl, fullName, dateOfBirth, country',
        });
        return;
      }

      const result = await KYCService.submitKYC({
        userId,
        documentType,
        documentNumber,
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        address,
        city,
        state,
        country,
        postalCode,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('KYC submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit KYC documents',
      });
    }
  }

  /**
   * Get KYC status for current user
   * GET /api/kyc/status
   */
  async getKYCStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id; // From auth middleware
      
      const status = await KYCService.getKYCStatus(userId);
      
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error('Get KYC status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve KYC status',
      });
    }
  }

  /**
   * Get KYC status by user ID (admin only)
   * GET /api/kyc/status/:userId
   */
  async getKYCStatusByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const status = await KYCService.getKYCStatus(parseInt(userId));
      
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error('Get KYC status by user ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve KYC status',
      });
    }
  }

  /**
   * Get pending KYC submissions (admin only)
   * GET /api/kyc/admin/pending
   */
  async getPendingKYCs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const pendingKYCs = await KYCService.getPendingKYCs(limit, offset);
      
      res.status(200).json({
        success: true,
        data: pendingKYCs,
        pagination: {
          limit,
          offset,
          count: pendingKYCs.length,
        },
      });
    } catch (error) {
      logger.error('Get pending KYCs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending KYCs',
      });
    }
  }

  /**
   * Manual review of KYC (admin only)
   * PUT /api/kyc/admin/review/:id
   */
  async manualReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reviewerId = (req as any).user.id; // From auth middleware
      const { decision, reason } = req.body;

      if (!decision || !['approved', 'rejected'].includes(decision)) {
        res.status(400).json({
          success: false,
          message: 'Invalid decision. Must be "approved" or "rejected"',
        });
        return;
      }

      if (decision === 'rejected' && !reason) {
        res.status(400).json({
          success: false,
          message: 'Rejection reason is required',
        });
        return;
      }

      await KYCService.manualReview(
        parseInt(id),
        reviewerId,
        decision,
        reason
      );

      res.status(200).json({
        success: true,
        message: `KYC ${decision} successfully`,
      });
    } catch (error) {
      logger.error('Manual review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete manual review',
      });
    }
  }

  /**
   * Trigger AI verification manually (admin only)
   * POST /api/kyc/admin/verify/:id
   */
  async triggerVerification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Trigger verification asynchronously
      KYCService.triggerAIVerification(parseInt(id)).catch(error => {
        logger.error('AI verification trigger error:', error);
      });

      res.status(200).json({
        success: true,
        message: 'AI verification triggered',
      });
    } catch (error) {
      logger.error('Trigger verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger verification',
      });
    }
  }
}

export default new KYCController();
