import { Withdrawal, Wallet, Transaction, User } from '../models';
import { generateVerificationCode } from '../utils/jwt';
import { sendWithdrawalConfirmationEmail } from '../utils/email';
import config from '../config';
import redis from '../config/redis';
import { Op } from 'sequelize';

export class WithdrawalService {
  async requestWithdrawal(
    userId: number,
    walletId: number,
    amount: number,
    destination: string
  ) {
    const wallet = await Wallet.findOne({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (Number(wallet.balance) < amount) {
      throw new Error('Insufficient balance');
    }

    if (amount < config.minWithdrawalAmount) {
      throw new Error(`Minimum withdrawal amount is ${config.minWithdrawalAmount}`);
    }

    if (amount > config.maxWithdrawalAmount) {
      throw new Error(`Maximum withdrawal amount is ${config.maxWithdrawalAmount}`);
    }

    // Check daily withdrawal limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayWithdrawals = await Withdrawal.sum('amount', {
      where: {
        userId,
        createdAt: {
          [Op.gte]: today,
        },
        status: {
          [Op.in]: ['completed', 'processing'],
        },
      },
    });

    if ((todayWithdrawals || 0) + amount > config.dailyWithdrawalLimit) {
      throw new Error('Daily withdrawal limit exceeded');
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date();
    codeExpiresAt.setMinutes(codeExpiresAt.getMinutes() + 10);

    const withdrawal = await Withdrawal.create({
      userId,
      walletId,
      amount,
      currency: wallet.currency,
      destination,
      verificationCode,
      codeExpiresAt,
      status: 'pending',
    });

    // Send verification email
    const user = await User.findByPk(userId);
    if (user) {
      await sendWithdrawalConfirmationEmail(
        user.email,
        amount,
        wallet.currency,
        verificationCode
      );
    }

    return withdrawal;
  }

  async verifyWithdrawal(userId: number, withdrawalId: number, code: string) {
    const withdrawal = await Withdrawal.findOne({
      where: { id: withdrawalId, userId },
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new Error('Withdrawal cannot be verified');
    }

    if (!withdrawal.codeExpiresAt || new Date() > withdrawal.codeExpiresAt) {
      throw new Error('Verification code expired');
    }

    if (withdrawal.verificationCode !== code) {
      throw new Error('Invalid verification code');
    }

    withdrawal.status = 'verifying';
    await withdrawal.save();

    // For large amounts, require admin approval
    if (withdrawal.amount > 5) {
      withdrawal.status = 'processing';
      await withdrawal.save();
      return { withdrawal, requiresApproval: true };
    }

    // Process withdrawal immediately for small amounts
    return this.processWithdrawal(withdrawalId);
  }

  async processWithdrawal(withdrawalId: number) {
    const withdrawal = await Withdrawal.findByPk(withdrawalId, {
      include: [{ model: Wallet, as: 'wallet' }],
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    const wallet = await Wallet.findByPk(withdrawal.walletId);

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (Number(wallet.balance) < withdrawal.amount) {
      withdrawal.status = 'failed';
      withdrawal.failureReason = 'Insufficient balance';
      await withdrawal.save();
      throw new Error('Insufficient balance');
    }

    // Deduct from wallet
    wallet.balance = Number(wallet.balance) - withdrawal.amount;
    await wallet.save();

    // Create transaction
    await Transaction.create({
      userId: withdrawal.userId,
      walletId: withdrawal.walletId,
      type: 'withdrawal',
      amount: -withdrawal.amount,
      currency: withdrawal.currency,
      status: 'completed',
      description: `Withdrawal to ${withdrawal.destination}`,
      metadata: {
        withdrawalId: withdrawal.id,
      },
    });

    // Update withdrawal status
    withdrawal.status = 'completed';
    withdrawal.processedAt = new Date();
    // In production, integrate with blockchain API to get transaction hash
    withdrawal.transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    await withdrawal.save();

    return { withdrawal, requiresApproval: false };
  }

  async approveWithdrawal(adminId: number, withdrawalId: number) {
    const withdrawal = await Withdrawal.findByPk(withdrawalId);

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== 'processing') {
      throw new Error('Withdrawal is not awaiting approval');
    }

    withdrawal.approvedBy = adminId;
    withdrawal.approvedAt = new Date();
    await withdrawal.save();

    return this.processWithdrawal(withdrawalId);
  }

  async rejectWithdrawal(adminId: number, withdrawalId: number, reason: string) {
    const withdrawal = await Withdrawal.findByPk(withdrawalId);

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== 'processing') {
      throw new Error('Withdrawal is not awaiting approval');
    }

    withdrawal.status = 'failed';
    withdrawal.failureReason = reason;
    withdrawal.approvedBy = adminId;
    withdrawal.approvedAt = new Date();
    await withdrawal.save();

    return withdrawal;
  }

  async cancelWithdrawal(userId: number, withdrawalId: number) {
    const withdrawal = await Withdrawal.findOne({
      where: { id: withdrawalId, userId },
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (!['pending', 'verifying'].includes(withdrawal.status)) {
      throw new Error('Withdrawal cannot be cancelled');
    }

    withdrawal.status = 'cancelled';
    await withdrawal.save();

    return withdrawal;
  }

  async getWithdrawalHistory(userId: number, limit: number = 50, offset: number = 0) {
    const withdrawals = await Withdrawal.findAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const total = await Withdrawal.count({ where: { userId } });

    return {
      withdrawals,
      total,
      limit,
      offset,
    };
  }

  async getPendingWithdrawals() {
    return await Withdrawal.findAll({
      where: {
        status: 'processing',
      },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
    });
  }
}

export default new WithdrawalService();
