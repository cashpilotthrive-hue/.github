import { Router } from 'express';
import { body } from 'express-validator';
import MiningController from '../controllers/MiningController';
import { authenticate, requireKYC } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { auditLogger } from '../middleware/audit';

const router = Router();

// All mining routes require authentication and KYC
router.use(authenticate);
router.use(requireKYC);

// Purchase mining contract
router.post(
  '/contracts',
  validate([
    body('contractName').notEmpty().trim(),
    body('cryptocurrency').isIn(['BTC', 'ETH', 'LTC']),
    body('hashRate').isFloat({ min: 0.1 }),
    body('duration').isInt({ min: 1 }),
    body('price').isFloat({ min: 0 }),
  ]),
  auditLogger('purchase', 'mining_contract'),
  MiningController.purchaseContract
);

// Get active contracts
router.get('/contracts', MiningController.getActiveContracts);

// Get mining stats
router.get('/stats', MiningController.getMiningStats);

// Cancel contract
router.post(
  '/contracts/:id/cancel',
  auditLogger('cancel', 'mining_contract'),
  MiningController.cancelContract
);

export default router;
