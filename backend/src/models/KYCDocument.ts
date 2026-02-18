import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface KYCDocumentAttributes {
  id?: number;
  userId: number;
  documentType: 'passport' | 'drivers_license' | 'national_id';
  documentNumber?: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  fullName?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: number;
  reviewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class KYCDocument extends Model<KYCDocumentAttributes> implements KYCDocumentAttributes {
  public id!: number;
  public userId!: number;
  public documentType!: 'passport' | 'drivers_license' | 'national_id';
  public documentNumber?: string;
  public documentFrontUrl?: string;
  public documentBackUrl?: string;
  public selfieUrl?: string;
  public fullName?: string;
  public dateOfBirth?: Date;
  public address?: string;
  public city?: string;
  public state?: string;
  public country?: string;
  public postalCode?: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public rejectionReason?: string;
  public reviewedBy?: number;
  public reviewedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KYCDocument.init(
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
    documentType: {
      type: DataTypes.ENUM('passport', 'drivers_license', 'national_id'),
      allowNull: false,
    },
    documentNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    documentFrontUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    documentBackUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    selfieUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    fullName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'kyc_documents',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default KYCDocument;
