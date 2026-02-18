import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import AuthService from '../services/AuthService';
import logger from '../config/logger';

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      const result = await AuthService.register(email, password, firstName, lastName);

      res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      res.status(400).json({
        error: error.message || 'Registration failed',
      });
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({
        error: error.message || 'Login failed',
      });
    }
  }

  async verify2FA(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      const userId = req.user!.id;

      await AuthService.verify2FA(userId, token);

      res.status(200).json({
        message: '2FA verification successful',
      });
    } catch (error: any) {
      logger.error('2FA verification error:', error);
      res.status(400).json({
        error: error.message || '2FA verification failed',
      });
    }
  }

  async enable2FA(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const result = await AuthService.enable2FA(userId);

      res.status(200).json({
        message: '2FA setup initiated',
        data: result,
      });
    } catch (error: any) {
      logger.error('2FA enable error:', error);
      res.status(400).json({
        error: error.message || '2FA setup failed',
      });
    }
  }

  async confirm2FASetup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      const userId = req.user!.id;

      await AuthService.confirm2FASetup(userId, token);

      res.status(200).json({
        message: '2FA enabled successfully',
      });
    } catch (error: any) {
      logger.error('2FA confirmation error:', error);
      res.status(400).json({
        error: error.message || '2FA confirmation failed',
      });
    }
  }

  async disable2FA(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      const userId = req.user!.id;

      await AuthService.disable2FA(userId, token);

      res.status(200).json({
        message: '2FA disabled successfully',
      });
    } catch (error: any) {
      logger.error('2FA disable error:', error);
      res.status(400).json({
        error: error.message || '2FA disable failed',
      });
    }
  }

  async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        error: error.message || 'Token refresh failed',
      });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      await AuthService.logout(userId);

      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(400).json({
        error: error.message || 'Logout failed',
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      res.status(200).json({
        data: req.user,
      });
    } catch (error: any) {
      logger.error('Get profile error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get profile',
      });
    }
  }
}

export default new AuthController();
