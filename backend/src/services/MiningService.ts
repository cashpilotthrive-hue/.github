import { MiningContract, Wallet, Transaction } from '../models';
import { Op } from 'sequelize';

export class MiningService {
  // Simulate mining earnings based on hash rate and market conditions
  private calculateDailyEarnings(
    cryptocurrency: 'BTC' | 'ETH' | 'LTC',
    hashRate: number
  ): number {
    // Simplified calculation - in production, use real-time difficulty and prices
    const baseEarnings = {
      BTC: 0.00001, // per TH/s per day
      ETH: 0.0001, // per MH/s per day
      LTC: 0.001, // per MH/s per day
    };

    return hashRate * baseEarnings[cryptocurrency];
  }

  async purchaseContract(
    userId: number,
    contractName: string,
    cryptocurrency: 'BTC' | 'ETH' | 'LTC',
    hashRate: number,
    duration: number,
    price: number
  ) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const contract = await MiningContract.create({
      userId,
      contractName,
      cryptocurrency,
      hashRate,
      duration,
      price,
      startDate,
      endDate,
      status: 'active',
      totalEarnings: 0,
    });

    return contract;
  }

  async getActiveContracts(userId: number) {
    return await MiningContract.findAll({
      where: {
        userId,
        status: 'active',
        endDate: {
          [Op.gt]: new Date(),
        },
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async getMiningStats(userId: number) {
    const contracts = await this.getActiveContracts(userId);

    let totalHashRate = 0;
    let totalEarnings = 0;
    const earningsByCrypto: Record<string, number> = {
      BTC: 0,
      ETH: 0,
      LTC: 0,
    };

    contracts.forEach(contract => {
      totalHashRate += Number(contract.hashRate);
      totalEarnings += Number(contract.totalEarnings);
      earningsByCrypto[contract.cryptocurrency] += Number(contract.totalEarnings);
    });

    return {
      totalHashRate,
      totalEarnings,
      activeContracts: contracts.length,
      earningsByCrypto,
      contracts,
    };
  }

  async processMiningSessions() {
    const activeContracts = await MiningContract.findAll({
      where: {
        status: 'active',
        endDate: {
          [Op.gt]: new Date(),
        },
      },
    });

    for (const contract of activeContracts) {
      const dailyEarnings = this.calculateDailyEarnings(
        contract.cryptocurrency,
        Number(contract.hashRate)
      );

      // Calculate earnings since last update (hourly distribution)
      const hourlyEarnings = dailyEarnings / 24;

      contract.totalEarnings = Number(contract.totalEarnings) + hourlyEarnings;
      await contract.save();

      // Update user wallet
      const wallet = await Wallet.findOne({
        where: {
          userId: contract.userId,
          currency: contract.cryptocurrency,
        },
      });

      if (wallet) {
        wallet.balance = Number(wallet.balance) + hourlyEarnings;
        await wallet.save();

        // Create transaction record
        await Transaction.create({
          userId: contract.userId,
          walletId: wallet.id,
          type: 'mining_reward',
          amount: hourlyEarnings,
          currency: contract.cryptocurrency,
          status: 'completed',
          description: `Mining reward from ${contract.contractName}`,
        });
      }
    }
  }

  async cancelContract(userId: number, contractId: number) {
    const contract = await MiningContract.findOne({
      where: {
        id: contractId,
        userId,
      },
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status !== 'active') {
      throw new Error('Contract is not active');
    }

    contract.status = 'cancelled';
    await contract.save();

    return contract;
  }

  async updateExpiredContracts() {
    await MiningContract.update(
      { status: 'expired' },
      {
        where: {
          status: 'active',
          endDate: {
            [Op.lt]: new Date(),
          },
        },
      }
    );
  }
}

export default new MiningService();
