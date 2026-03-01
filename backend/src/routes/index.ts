import { Router } from 'express';
import authRoutes from './auth';
import miningRoutes from './mining';
import walletRoutes from './wallets';
import withdrawalRoutes from './withdrawals';
import kycRoutes from './kyc';

const router = Router();

// API version 1 routes
router.use('/auth', authRoutes);
router.use('/mining', miningRoutes);
router.use('/wallets', walletRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/kyc', kycRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
