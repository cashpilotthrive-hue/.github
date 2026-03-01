export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin' | 'superadmin';
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requires2FA?: boolean;
}

export interface Wallet {
  id: number;
  userId: number;
  walletType: 'crypto' | 'fiat';
  currency: string;
  balance: number;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  userId: number;
  walletId: number;
  type: 'deposit' | 'withdrawal' | 'mining_reward' | 'transfer' | 'purchase';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MiningContract {
  id: number;
  userId: number;
  contractName: string;
  cryptocurrency: 'BTC' | 'ETH' | 'LTC';
  hashRate: number;
  duration: number;
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface MiningStats {
  totalHashRate: number;
  totalEarnings: number;
  activeContracts: number;
  earningsByCrypto: {
    BTC: number;
    ETH: number;
    LTC: number;
  };
  contracts: MiningContract[];
}

export interface Withdrawal {
  id: number;
  userId: number;
  walletId: number;
  amount: number;
  currency: string;
  destination: string;
  status: 'pending' | 'verifying' | 'processing' | 'completed' | 'failed' | 'cancelled';
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KYCDocument {
  id: number;
  userId: number;
  documentType: 'passport' | 'drivers_license' | 'national_id';
  documentNumber?: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  fullName?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
