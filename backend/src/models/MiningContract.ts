import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface MiningContractAttributes {
  id?: number;
  userId: number;
  contractName: string;
  cryptocurrency: 'BTC' | 'ETH' | 'LTC';
  hashRate: number; // in TH/s or MH/s
  duration: number; // in days
  price: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  totalEarnings: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class MiningContract extends Model<MiningContractAttributes> implements MiningContractAttributes {
  public id!: number;
  public userId!: number;
  public contractName!: string;
  public cryptocurrency!: 'BTC' | 'ETH' | 'LTC';
  public hashRate!: number;
  public duration!: number;
  public price!: number;
  public startDate!: Date;
  public endDate!: Date;
  public status!: 'active' | 'expired' | 'cancelled';
  public totalEarnings!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MiningContract.init(
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
    contractName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cryptocurrency: {
      type: DataTypes.ENUM('BTC', 'ETH', 'LTC'),
      allowNull: false,
    },
    hashRate: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'cancelled'),
      defaultValue: 'active',
      allowNull: false,
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'mining_contracts',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['cryptocurrency'],
      },
    ],
  }
);

export default MiningContract;
