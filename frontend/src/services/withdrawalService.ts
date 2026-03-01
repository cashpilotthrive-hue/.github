import api from './api';
import { Withdrawal } from '../types';

export const withdrawalService = {
  requestWithdrawal: async (data: {
    walletId: number;
    amount: number;
    destination: string;
  }): Promise<Withdrawal> => {
    const response = await api.post('/withdrawals', data);
    return response.data.data;
  },

  verifyWithdrawal: async (id: number, code: string): Promise<Withdrawal> => {
    const response = await api.post(`/withdrawals/${id}/verify`, { code });
    return response.data.data;
  },

  cancelWithdrawal: async (id: number): Promise<Withdrawal> => {
    const response = await api.post(`/withdrawals/${id}/cancel`);
    return response.data.data;
  },

  getWithdrawalHistory: async (
    limit?: number,
    offset?: number
  ): Promise<{ withdrawals: Withdrawal[]; total: number }> => {
    const response = await api.get('/withdrawals/history', {
      params: { limit, offset },
    });
    return response.data.data;
  },
};
