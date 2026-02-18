import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface RiskScoreAttributes {
  id?: number;
  userId: number;
  overallScore: number;
  identityRisk: number;
  fraudRisk: number;
  complianceRisk: number;
  transactionRisk: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors?: Record<string, any>;
  requiresReview: boolean;
  nextReviewDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class RiskScore extends Model<RiskScoreAttributes> implements RiskScoreAttributes {
  public id!: number;
  public userId!: number;
  public overallScore!: number;
  public identityRisk!: number;
  public fraudRisk!: number;
  public complianceRisk!: number;
  public transactionRisk!: number;
  public riskLevel!: 'low' | 'medium' | 'high' | 'critical';
  public factors?: Record<string, any>;
  public requiresReview!: boolean;
  public nextReviewDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RiskScore.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    overallScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    identityRisk: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    fraudRisk: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    complianceRisk: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    transactionRisk: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
    },
    factors: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    requiresReview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    nextReviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'risk_scores',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId'],
      },
      {
        fields: ['riskLevel'],
      },
      {
        fields: ['requiresReview'],
      },
      {
        fields: ['nextReviewDate'],
      },
    ],
  }
);

export default RiskScore;
