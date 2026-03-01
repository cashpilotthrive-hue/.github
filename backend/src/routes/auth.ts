import { Router } from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';

const router = Router();

// Registration
router.post(
  '/register',
  authLimiter,
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
  ]),
  AuthController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  AuthController.login
);

// 2FA verification
router.post(
  '/verify-2fa',
  authenticate,
  validate([
    body('token').isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits'),
  ]),
  AuthController.verify2FA
);

// Enable 2FA
router.post('/enable-2fa', authenticate, AuthController.enable2FA);

// Confirm 2FA setup
router.post(
  '/confirm-2fa',
  authenticate,
  validate([
    body('token').isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits'),
  ]),
  AuthController.confirm2FASetup
);

// Disable 2FA
router.post(
  '/disable-2fa',
  authenticate,
  validate([
    body('token').isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits'),
  ]),
  AuthController.disable2FA
);

// Refresh token
router.post(
  '/refresh-token',
  validate([
    body('refreshToken').notEmpty(),
  ]),
  AuthController.refreshToken
);

// Logout
router.post('/logout', authenticate, AuthController.logout);

// Get profile
router.get('/profile', authenticate, AuthController.getProfile);

export default router;
