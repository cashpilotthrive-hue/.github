import api from './api';
import { MiningContract, MiningStats } from '../types';

export const miningService = {
  purchaseContract: async (data: {
    contractName: string;
    cryptocurrency: 'BTC' | 'ETH' | 'LTC';
    hashRate: number;
    duration: number;
    price: number;
  }): Promise<MiningContract> => {
    const response = await api.post('/mining/contracts', data);
    return response.data.data;
  },

  getActiveContracts: async (): Promise<MiningContract[]> => {
    const response = await api.get('/mining/contracts');
    return response.data.data;
  },

  getMiningStats: async (): Promise<MiningStats> => {
    const response = await api.get('/mining/stats');
    return response.data.data;
  },

  cancelContract: async (id: number): Promise<MiningContract> => {
    const response = await api.post(`/mining/contracts/${id}/cancel`);
    return response.data.data;
  },
};
