import { Wallet, Transaction } from '../models';
import { Op } from 'sequelize';

export class WalletService {
  async createWallet(userId: number, walletType: 'crypto' | 'fiat', currency: string, address?: string) {
    const existingWallet = await Wallet.findOne({
      where: { userId, currency },
    });

    if (existingWallet) {
      throw new Error('Wallet already exists for this currency');
    }

    const wallet = await Wallet.create({
      userId,
      walletType,
      currency,
      balance: 0,
      address,
      isActive: true,
    });

    return wallet;
  }

  async getUserWallets(userId: number) {
    return await Wallet.findAll({
      where: { userId, isActive: true },
      order: [['createdAt', 'DESC']],
    });
  }

  async getWalletById(userId: number, walletId: number) {
    const wallet = await Wallet.findOne({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    return wallet;
  }

  async getWalletBalance(userId: number, walletId: number) {
    const wallet = await this.getWalletById(userId, walletId);
    return Number(wallet.balance);
  }

  async deposit(userId: number, walletId: number, amount: number, description?: string) {
    const wallet = await this.getWalletById(userId, walletId);

    if (!wallet.isActive) {
      throw new Error('Wallet is not active');
    }

    wallet.balance = Number(wallet.balance) + amount;
    await wallet.save();

    const transaction = await Transaction.create({
      userId,
      walletId,
      type: 'deposit',
      amount,
      currency: wallet.currency,
      status: 'completed',
      description: description || 'Deposit',
    });

    return { wallet, transaction };
  }

  async transfer(
    fromUserId: number,
    fromWalletId: number,
    toWalletId: number,
    amount: number
  ) {
    const fromWallet = await this.getWalletById(fromUserId, fromWalletId);
    const toWallet = await Wallet.findByPk(toWalletId);

    if (!toWallet) {
      throw new Error('Destination wallet not found');
    }

    if (fromWallet.currency !== toWallet.currency) {
      throw new Error('Currency mismatch');
    }

    if (Number(fromWallet.balance) < amount) {
      throw new Error('Insufficient balance');
    }

    // Deduct from sender
    fromWallet.balance = Number(fromWallet.balance) - amount;
    await fromWallet.save();

    // Add to receiver
    toWallet.balance = Number(toWallet.balance) + amount;
    await toWallet.save();

    // Create transaction records
    await Transaction.create({
      userId: fromUserId,
      walletId: fromWalletId,
      type: 'transfer',
      amount: -amount,
      currency: fromWallet.currency,
      status: 'completed',
      description: `Transfer to wallet ${toWalletId}`,
    });

    await Transaction.create({
      userId: toWallet.userId,
      walletId: toWalletId,
      type: 'transfer',
      amount,
      currency: toWallet.currency,
      status: 'completed',
      description: `Transfer from wallet ${fromWalletId}`,
    });

    return { fromWallet, toWallet };
  }

  async getTransactionHistory(
    userId: number,
    walletId?: number,
    limit: number = 50,
    offset: number = 0
  ) {
    const where: any = { userId };
    if (walletId) {
      where.walletId = walletId;
    }

    const transactions = await Transaction.findAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Wallet,
          as: 'wallet',
          attributes: ['currency', 'walletType'],
        },
      ],
    });

    const total = await Transaction.count({ where });

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }
}

export default new WalletService();
