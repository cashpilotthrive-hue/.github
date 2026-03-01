import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface TransactionAttributes {
  id?: number;
  userId: number;
  walletId: number;
  type: 'deposit' | 'withdrawal' | 'mining_reward' | 'transfer' | 'purchase';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  metadata?: Record<string, any>;
  transactionHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Transaction extends Model<TransactionAttributes> implements TransactionAttributes {
  public id!: number;
  public userId!: number;
  public walletId!: number;
  public type!: 'deposit' | 'withdrawal' | 'mining_reward' | 'transfer' | 'purchase';
  public amount!: number;
  public currency!: string;
  public status!: 'pending' | 'completed' | 'failed' | 'cancelled';
  public description?: string;
  public metadata?: Record<string, any>;
  public transactionHash?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'wallets',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('deposit', 'withdrawal', 'mining_reward', 'transfer', 'purchase'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    transactionHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['walletId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default Transaction;
