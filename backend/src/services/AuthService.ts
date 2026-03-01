import { User } from '../models';
import { generateAccessToken, generateRefreshToken, generateVerificationCode } from '../utils/jwt';
import { sendWelcomeEmail, sendVerificationEmail } from '../utils/email';
import { generate2FASecret, generateQRCode, verify2FAToken } from '../utils/twoFactor';
import redis from '../config/redis';

export class AuthService {
  async register(email: string, password: string, firstName?: string, lastName?: string) {
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'user',
      isEmailVerified: false,
      is2FAEnabled: false,
      kycStatus: 'not_started',
      isActive: true,
    });

    // Send welcome email
    await sendWelcomeEmail(email, firstName || 'User');

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in Redis
    await redis.set(`refresh_token:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        kycStatus: user.kycStatus,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await redis.set(`refresh_token:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        is2FAEnabled: user.is2FAEnabled,
        kycStatus: user.kycStatus,
      },
      accessToken,
      refreshToken,
      requires2FA: user.is2FAEnabled,
    };
  }

  async verify2FA(userId: number, token: string) {
    const user = await User.findByPk(userId);

    if (!user || !user.twoFactorSecret) {
      throw new Error('2FA not enabled');
    }

    const isValid = verify2FAToken(token, user.twoFactorSecret);

    if (!isValid) {
      throw new Error('Invalid 2FA token');
    }

    return true;
  }

  async enable2FA(userId: number) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { secret, otpauthUrl } = generate2FASecret(user.email);
    const qrCode = await generateQRCode(otpauthUrl);

    user.twoFactorSecret = secret;
    await user.save();

    return {
      secret,
      qrCode,
    };
  }

  async confirm2FASetup(userId: number, token: string) {
    const user = await User.findByPk(userId);

    if (!user || !user.twoFactorSecret) {
      throw new Error('2FA setup not initiated');
    }

    const isValid = verify2FAToken(token, user.twoFactorSecret);

    if (!isValid) {
      throw new Error('Invalid 2FA token');
    }

    user.is2FAEnabled = true;
    await user.save();

    return true;
  }

  async disable2FA(userId: number, token: string) {
    const user = await User.findByPk(userId);

    if (!user || !user.is2FAEnabled) {
      throw new Error('2FA not enabled');
    }

    const isValid = verify2FAToken(token, user.twoFactorSecret || '');

    if (!isValid) {
      throw new Error('Invalid 2FA token');
    }

    user.is2FAEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    return true;
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = require('../utils/jwt').verifyRefreshToken(refreshToken);
      const storedToken = await redis.get(`refresh_token:${decoded.id}`);

      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const user = await User.findByPk(decoded.id);

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: number) {
    await redis.del(`refresh_token:${userId}`);
    return true;
  }
}

export default new AuthService();
