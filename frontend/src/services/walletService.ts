import api from './api';
import { Wallet, Transaction } from '../types';

export const walletService = {
  createWallet: async (data: {
    walletType: 'crypto' | 'fiat';
    currency: string;
    address?: string;
  }): Promise<Wallet> => {
    const response = await api.post('/wallets', data);
    return response.data.data;
  },

  getWallets: async (): Promise<Wallet[]> => {
    const response = await api.get('/wallets');
    return response.data.data;
  },

  getWallet: async (id: number): Promise<Wallet> => {
    const response = await api.get(`/wallets/${id}`);
    return response.data.data;
  },

  deposit: async (walletId: number, amount: number, description?: string): Promise<any> => {
    const response = await api.post(`/wallets/${walletId}/deposit`, {
      amount,
      description,
    });
    return response.data.data;
  },

  transfer: async (
    fromWalletId: number,
    toWalletId: number,
    amount: number
  ): Promise<any> => {
    const response = await api.post('/wallets/transfer', {
      fromWalletId,
      toWalletId,
      amount,
    });
    return response.data.data;
  },

  getTransactionHistory: async (
    walletId?: number,
    limit?: number,
    offset?: number
  ): Promise<{ transactions: Transaction[]; total: number }> => {
    const response = await api.get('/wallets/transactions/history', {
      params: { walletId, limit, offset },
    });
    return response.data.data;
  },
};
