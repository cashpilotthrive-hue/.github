import { Router } from 'express';
import KYCController from '../controllers/KYCController';
import { authenticate } from '../middleware/auth';
import { validateKYCSubmission } from '../middleware/validator';

const router = Router();

// User routes (authenticated users only)
router.post('/submit', authenticate, validateKYCSubmission, KYCController.submitKYC);
router.get('/status', authenticate, KYCController.getKYCStatus);

// Admin routes (admin/superadmin only)
router.get('/admin/pending', authenticate, KYCController.getPendingKYCs);
router.get('/status/:userId', authenticate, KYCController.getKYCStatusByUserId);
router.put('/admin/review/:id', authenticate, KYCController.manualReview);
router.post('/admin/verify/:id', authenticate, KYCController.triggerVerification);

export default router;
