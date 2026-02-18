import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface WalletAttributes {
  id?: number;
  userId: number;
  walletType: 'crypto' | 'fiat';
  currency: string; // BTC, ETH, LTC, USD, EUR, etc.
  balance: number;
  address?: string; // For crypto wallets
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Wallet extends Model<WalletAttributes> implements WalletAttributes {
  public id!: number;
  public userId!: number;
  public walletType!: 'crypto' | 'fiat';
  public currency!: string;
  public balance!: number;
  public address?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Wallet.init(
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
    walletType: {
      type: DataTypes.ENUM('crypto', 'fiat'),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'wallets',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['currency'],
      },
      {
        unique: true,
        fields: ['userId', 'currency'],
      },
    ],
  }
);

export default Wallet;
