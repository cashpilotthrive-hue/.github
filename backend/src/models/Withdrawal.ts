import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface WithdrawalAttributes {
  id?: number;
  userId: number;
  walletId: number;
  amount: number;
  currency: string;
  destination: string;
  verificationCode?: string;
  codeExpiresAt?: Date;
  status: 'pending' | 'verifying' | 'processing' | 'completed' | 'failed' | 'cancelled';
  failureReason?: string;
  approvedBy?: number;
  approvedAt?: Date;
  processedAt?: Date;
  transactionHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Withdrawal extends Model<WithdrawalAttributes> implements WithdrawalAttributes {
  public id!: number;
  public userId!: number;
  public walletId!: number;
  public amount!: number;
  public currency!: string;
  public destination!: string;
  public verificationCode?: string;
  public codeExpiresAt?: Date;
  public status!: 'pending' | 'verifying' | 'processing' | 'completed' | 'failed' | 'cancelled';
  public failureReason?: string;
  public approvedBy?: number;
  public approvedAt?: Date;
  public processedAt?: Date;
  public transactionHash?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Withdrawal.init(
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
    amount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    verificationCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    codeExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'verifying', 'processing', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    transactionHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'withdrawals',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default Withdrawal;
