import User from './User';
import KYCDocument from './KYCDocument';
import KYCVerification from './KYCVerification';
import RiskScore from './RiskScore';
import MiningContract from './MiningContract';
import Wallet from './Wallet';
import Transaction from './Transaction';
import Withdrawal from './Withdrawal';
import Notification from './Notification';
import AuditLog from './AuditLog';

// Define relationships
User.hasMany(KYCDocument, { foreignKey: 'userId', as: 'kycDocuments' });
KYCDocument.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(MiningContract, { foreignKey: 'userId', as: 'miningContracts' });
MiningContract.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Wallet, { foreignKey: 'userId', as: 'wallets' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

User.hasMany(Withdrawal, { foreignKey: 'userId', as: 'withdrawals' });
Withdrawal.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wallet.hasMany(Withdrawal, { foreignKey: 'walletId', as: 'withdrawals' });
Withdrawal.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

KYCDocument.hasMany(KYCVerification, { foreignKey: 'kycDocumentId', as: 'verifications' });
KYCVerification.belongsTo(KYCDocument, { foreignKey: 'kycDocumentId', as: 'kycDocument' });

User.hasOne(RiskScore, { foreignKey: 'userId', as: 'riskScore' });
RiskScore.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  KYCDocument,
  KYCVerification,
  RiskScore,
  MiningContract,
  Wallet,
  Transaction,
  Withdrawal,
  Notification,
  AuditLog,
};
