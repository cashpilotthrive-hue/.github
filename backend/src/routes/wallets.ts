import { Router } from 'express';
import { body, param, query } from 'express-validator';
import WalletController from '../controllers/WalletController';
import { authenticate, requireKYC } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { auditLogger } from '../middleware/audit';

const router = Router();

// All wallet routes require authentication
router.use(authenticate);

// Create wallet
router.post(
  '/',
  validate([
    body('walletType').isIn(['crypto', 'fiat']),
    body('currency').notEmpty().trim(),
    body('address').optional().trim(),
  ]),
  auditLogger('create', 'wallet'),
  WalletController.createWallet
);

// Get user wallets
router.get('/', WalletController.getUserWallets);

// Get wallet by ID
router.get(
  '/:id',
  validate([
    param('id').isInt(),
  ]),
  WalletController.getWalletById
);

// Deposit to wallet (requires KYC)
router.post(
  '/:id/deposit',
  requireKYC,
  validate([
    param('id').isInt(),
    body('amount').isFloat({ min: 0.00000001 }),
    body('description').optional().trim(),
  ]),
  auditLogger('deposit', 'wallet'),
  WalletController.deposit
);

// Transfer between wallets (requires KYC)
router.post(
  '/transfer',
  requireKYC,
  validate([
    body('fromWalletId').isInt(),
    body('toWalletId').isInt(),
    body('amount').isFloat({ min: 0.00000001 }),
  ]),
  auditLogger('transfer', 'wallet'),
  WalletController.transfer
);

// Get transaction history
router.get(
  '/transactions/history',
  validate([
    query('walletId').optional().isInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ]),
  WalletController.getTransactionHistory
);

export default router;
