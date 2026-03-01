import { Router } from 'express';
import { body, param, query } from 'express-validator';
import KYCController from '../controllers/KYCController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { auditLogger } from '../middleware/audit';

const router = Router();

// All KYC routes require authentication
router.use(authenticate);

// Submit KYC
router.post(
  '/',
  validate([
    body('documentType').isIn(['passport', 'drivers_license', 'national_id']),
    body('documentNumber').optional().trim(),
    body('documentFrontUrl').optional().isURL(),
    body('documentBackUrl').optional().isURL(),
    body('selfieUrl').optional().isURL(),
    body('fullName').optional().trim(),
    body('dateOfBirth').optional().isDate(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('country').optional().trim(),
    body('postalCode').optional().trim(),
  ]),
  auditLogger('submit', 'kyc'),
  KYCController.submitKYC
);

// Get user's KYC
router.get('/', KYCController.getUserKYC);

// Admin routes
router.get(
  '/pending',
  authorize('admin', 'superadmin'),
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ]),
  KYCController.getPendingKYCs
);

router.post(
  '/:id/review',
  authorize('admin', 'superadmin'),
  validate([
    param('id').isInt(),
    body('status').isIn(['approved', 'rejected']),
    body('rejectionReason').optional().trim(),
  ]),
  auditLogger('review', 'kyc'),
  KYCController.reviewKYC
);

router.get(
  '/stats',
  authorize('admin', 'superadmin'),
  KYCController.getKYCStats
);

export default router;
