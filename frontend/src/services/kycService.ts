import api from './api';
import { KYCDocument } from '../types';

export const kycService = {
  submitKYC: async (data: Partial<KYCDocument>): Promise<KYCDocument> => {
    const response = await api.post('/kyc', data);
    return response.data.data;
  },

  getKYC: async (): Promise<KYCDocument> => {
    const response = await api.get('/kyc');
    return response.data.data;
  },
};
