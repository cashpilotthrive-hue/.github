import { Router } from 'express';
import KYCController from '../controllers/KYCController';
import { authenticate } from '../middleware/auth';
import { validateKYCSubmission } from '../middleware/validator';
import { kycSubmissionLimiter, kycStatusLimiter, adminLimiter } from '../middleware/rateLimiter';

const router = Router();

// User routes (authenticated users only)
router.post('/submit', kycSubmissionLimiter, authenticate, validateKYCSubmission, KYCController.submitKYC);
router.get('/status', kycStatusLimiter, authenticate, KYCController.getKYCStatus);

// Admin routes (admin/superadmin only)
router.get('/admin/pending', adminLimiter, authenticate, KYCController.getPendingKYCs);
router.get('/status/:userId', adminLimiter, authenticate, KYCController.getKYCStatusByUserId);
router.put('/admin/review/:id', adminLimiter, authenticate, KYCController.manualReview);
router.post('/admin/verify/:id', adminLimiter, authenticate, KYCController.triggerVerification);

export default router;
