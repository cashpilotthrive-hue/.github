import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface KYCVerificationAttributes {
  id?: number;
  kycDocumentId: number;
  verificationType: 'identity' | 'fraud' | 'compliance' | 'document_quality';
  aiModel: string;
  confidence: number;
  result: 'pass' | 'fail' | 'manual_review';
  details?: Record<string, any>;
  processingTimeMs?: number;
  createdAt?: Date;
}

class KYCVerification extends Model<KYCVerificationAttributes> implements KYCVerificationAttributes {
  public id!: number;
  public kycDocumentId!: number;
  public verificationType!: 'identity' | 'fraud' | 'compliance' | 'document_quality';
  public aiModel!: string;
  public confidence!: number;
  public result!: 'pass' | 'fail' | 'manual_review';
  public details?: Record<string, any>;
  public processingTimeMs?: number;
  public readonly createdAt!: Date;
}

KYCVerification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    kycDocumentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'kyc_documents',
        key: 'id',
      },
    },
    verificationType: {
      type: DataTypes.ENUM('identity', 'fraud', 'compliance', 'document_quality'),
      allowNull: false,
    },
    aiModel: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    confidence: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    result: {
      type: DataTypes.ENUM('pass', 'fail', 'manual_review'),
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    processingTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'kyc_verifications',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['kycDocumentId'],
      },
      {
        fields: ['verificationType'],
      },
      {
        fields: ['result'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default KYCVerification;
