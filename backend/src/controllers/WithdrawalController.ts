import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import WithdrawalService from '../services/WithdrawalService';
import logger from '../config/logger';

export class WithdrawalController {
  async requestWithdrawal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { walletId, amount, destination } = req.body;

      const withdrawal = await WithdrawalService.requestWithdrawal(
        userId,
        walletId,
        amount,
        destination
      );

      res.status(201).json({
        message: 'Withdrawal request created. Please check your email for verification code.',
        data: withdrawal,
      });
    } catch (error: any) {
      logger.error('Request withdrawal error:', error);
      res.status(400).json({
        error: error.message || 'Failed to create withdrawal request',
      });
    }
  }

  async verifyWithdrawal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { code } = req.body;

      const result = await WithdrawalService.verifyWithdrawal(userId, parseInt(id), code);

      res.status(200).json({
        message: result.requiresApproval
          ? 'Withdrawal verified and pending admin approval'
          : 'Withdrawal processed successfully',
        data: result.withdrawal,
      });
    } catch (error: any) {
      logger.error('Verify withdrawal error:', error);
      res.status(400).json({
        error: error.message || 'Withdrawal verification failed',
      });
    }
  }

  async approveWithdrawal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const adminId = req.user!.id;
      const { id } = req.params;

      const result = await WithdrawalService.approveWithdrawal(adminId, parseInt(id));

      res.status(200).json({
        message: 'Withdrawal approved and processed',
        data: result.withdrawal,
      });
    } catch (error: any) {
      logger.error('Approve withdrawal error:', error);
      res.status(400).json({
        error: error.message || 'Failed to approve withdrawal',
      });
    }
  }

  async rejectWithdrawal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const adminId = req.user!.id;
      const { id } = req.params;
      const { reason } = req.body;

      const withdrawal = await WithdrawalService.rejectWithdrawal(
        adminId,
        parseInt(id),
        reason
      );

      res.status(200).json({
        message: 'Withdrawal rejected',
        data: withdrawal,
      });
    } catch (error: any) {
      logger.error('Reject withdrawal error:', error);
      res.status(400).json({
        error: error.message || 'Failed to reject withdrawal',
      });
    }
  }

  async cancelWithdrawal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const withdrawal = await WithdrawalService.cancelWithdrawal(userId, parseInt(id));

      res.status(200).json({
        message: 'Withdrawal cancelled',
        data: withdrawal,
      });
    } catch (error: any) {
      logger.error('Cancel withdrawal error:', error);
      res.status(400).json({
        error: error.message || 'Failed to cancel withdrawal',
      });
    }
  }

  async getWithdrawalHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { limit, offset } = req.query;

      const result = await WithdrawalService.getWithdrawalHistory(
        userId,
        limit ? parseInt(limit as string) : 50,
        offset ? parseInt(offset as string) : 0
      );

      res.status(200).json({
        data: result,
      });
    } catch (error: any) {
      logger.error('Get withdrawal history error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get withdrawal history',
      });
    }
  }

  async getPendingWithdrawals(req: AuthRequest, res: Response): Promise<void> {
    try {
      const withdrawals = await WithdrawalService.getPendingWithdrawals();

      res.status(200).json({
        data: withdrawals,
      });
    } catch (error: any) {
      logger.error('Get pending withdrawals error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get pending withdrawals',
      });
    }
  }
}

export default new WithdrawalController();
