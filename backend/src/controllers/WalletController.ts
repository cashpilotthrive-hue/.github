import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import WalletService from '../services/WalletService';
import logger from '../config/logger';

export class WalletController {
  async createWallet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { walletType, currency, address } = req.body;

      const wallet = await WalletService.createWallet(userId, walletType, currency, address);

      res.status(201).json({
        message: 'Wallet created successfully',
        data: wallet,
      });
    } catch (error: any) {
      logger.error('Create wallet error:', error);
      res.status(400).json({
        error: error.message || 'Failed to create wallet',
      });
    }
  }

  async getUserWallets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const wallets = await WalletService.getUserWallets(userId);

      res.status(200).json({
        data: wallets,
      });
    } catch (error: any) {
      logger.error('Get wallets error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get wallets',
      });
    }
  }

  async getWalletById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const wallet = await WalletService.getWalletById(userId, parseInt(id));

      res.status(200).json({
        data: wallet,
      });
    } catch (error: any) {
      logger.error('Get wallet error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get wallet',
      });
    }
  }

  async deposit(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { amount, description } = req.body;

      const result = await WalletService.deposit(userId, parseInt(id), amount, description);

      res.status(200).json({
        message: 'Deposit successful',
        data: result,
      });
    } catch (error: any) {
      logger.error('Deposit error:', error);
      res.status(400).json({
        error: error.message || 'Deposit failed',
      });
    }
  }

  async transfer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { fromWalletId, toWalletId, amount } = req.body;

      const result = await WalletService.transfer(
        userId,
        fromWalletId,
        toWalletId,
        amount
      );

      res.status(200).json({
        message: 'Transfer successful',
        data: result,
      });
    } catch (error: any) {
      logger.error('Transfer error:', error);
      res.status(400).json({
        error: error.message || 'Transfer failed',
      });
    }
  }

  async getTransactionHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { walletId, limit, offset } = req.query;

      const result = await WalletService.getTransactionHistory(
        userId,
        walletId ? parseInt(walletId as string) : undefined,
        limit ? parseInt(limit as string) : 50,
        offset ? parseInt(offset as string) : 0
      );

      res.status(200).json({
        data: result,
      });
    } catch (error: any) {
      logger.error('Get transaction history error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get transaction history',
      });
    }
  }
}

export default new WalletController();
