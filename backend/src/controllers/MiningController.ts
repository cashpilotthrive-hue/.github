import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MiningService from '../services/MiningService';
import logger from '../config/logger';

export class MiningController {
  async purchaseContract(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { contractName, cryptocurrency, hashRate, duration, price } = req.body;

      const contract = await MiningService.purchaseContract(
        userId,
        contractName,
        cryptocurrency,
        hashRate,
        duration,
        price
      );

      res.status(201).json({
        message: 'Mining contract purchased successfully',
        data: contract,
      });
    } catch (error: any) {
      logger.error('Purchase contract error:', error);
      res.status(400).json({
        error: error.message || 'Failed to purchase contract',
      });
    }
  }

  async getActiveContracts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const contracts = await MiningService.getActiveContracts(userId);

      res.status(200).json({
        data: contracts,
      });
    } catch (error: any) {
      logger.error('Get active contracts error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get contracts',
      });
    }
  }

  async getMiningStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const stats = await MiningService.getMiningStats(userId);

      res.status(200).json({
        data: stats,
      });
    } catch (error: any) {
      logger.error('Get mining stats error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get mining stats',
      });
    }
  }

  async cancelContract(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const contract = await MiningService.cancelContract(userId, parseInt(id));

      res.status(200).json({
        message: 'Contract cancelled successfully',
        data: contract,
      });
    } catch (error: any) {
      logger.error('Cancel contract error:', error);
      res.status(400).json({
        error: error.message || 'Failed to cancel contract',
      });
    }
  }
}

export default new MiningController();
