import { Router } from 'express';
import { body, param, query } from 'express-validator';
import WithdrawalController from '../controllers/WithdrawalController';
import { authenticate, requireKYC, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { auditLogger } from '../middleware/audit';
import { withdrawalLimiter } from '../middleware/rateLimiter';

const router = Router();

// All withdrawal routes require authentication and KYC
router.use(authenticate);
router.use(requireKYC);

// Request withdrawal
router.post(
  '/',
  withdrawalLimiter,
  validate([
    body('walletId').isInt(),
    body('amount').isFloat({ min: 0.00000001 }),
    body('destination').notEmpty().trim(),
  ]),
  auditLogger('request', 'withdrawal'),
  WithdrawalController.requestWithdrawal
);

// Verify withdrawal
router.post(
  '/:id/verify',
  validate([
    param('id').isInt(),
    body('code').notEmpty().trim(),
  ]),
  auditLogger('verify', 'withdrawal'),
  WithdrawalController.verifyWithdrawal
);

// Cancel withdrawal
router.post(
  '/:id/cancel',
  validate([
    param('id').isInt(),
  ]),
  auditLogger('cancel', 'withdrawal'),
  WithdrawalController.cancelWithdrawal
);

// Get withdrawal history
router.get(
  '/history',
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ]),
  WithdrawalController.getWithdrawalHistory
);

// Admin routes
router.get(
  '/pending',
  authorize('admin', 'superadmin'),
  WithdrawalController.getPendingWithdrawals
);

router.post(
  '/:id/approve',
  authorize('admin', 'superadmin'),
  validate([
    param('id').isInt(),
  ]),
  auditLogger('approve', 'withdrawal'),
  WithdrawalController.approveWithdrawal
);

router.post(
  '/:id/reject',
  authorize('admin', 'superadmin'),
  validate([
    param('id').isInt(),
    body('reason').notEmpty().trim(),
  ]),
  auditLogger('reject', 'withdrawal'),
  WithdrawalController.rejectWithdrawal
);

export default router;
