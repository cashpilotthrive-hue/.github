import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  register: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  verify2FA: async (token: string): Promise<void> => {
    await api.post('/auth/verify-2fa', { token });
  },

  enable2FA: async (): Promise<{ secret: string; qrCode: string }> => {
    const response = await api.post('/auth/enable-2fa');
    return response.data.data;
  },

  confirm2FASetup: async (token: string): Promise<void> => {
    await api.post('/auth/confirm-2fa', { token });
  },

  disable2FA: async (token: string): Promise<void> => {
    await api.post('/auth/disable-2fa', { token });
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },
};
