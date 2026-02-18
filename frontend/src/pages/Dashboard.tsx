import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { walletService } from '../services/walletService';
import { miningService } from '../services/miningService';
import { Wallet as WalletIcon, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [wallets, setWallets] = useState<any[]>([]);
  const [miningStats, setMiningStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletsData, statsData] = await Promise.all([
          walletService.getWallets(),
          miningService.getMiningStats(),
        ]);
        setWallets(walletsData);
        setMiningStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName || user?.email}!</p>
        </div>

        {/* KYC Status Banner */}
        {user?.kycStatus !== 'approved' && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-yellow-800">
              <strong>Action Required:</strong> Complete your KYC verification to access all features.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">${totalBalance.toFixed(2)}</p>
              </div>
              <div className="rounded-full bg-primary-100 p-3">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Wallets</p>
                <p className="text-2xl font-bold text-gray-900">{wallets.length}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <WalletIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mining Contracts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {miningStats?.activeContracts || 0}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${miningStats?.totalEarnings.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Wallets */}
        <Card title="Your Wallets">
          {wallets.length === 0 ? (
            <p className="text-gray-500">No wallets found. Create your first wallet to get started.</p>
          ) : (
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <p className="font-medium text-gray-900">{wallet.currency}</p>
                    <p className="text-sm text-gray-500">{wallet.walletType}</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(wallet.balance, wallet.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
