export default {
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  
  minWithdrawalAmount: parseFloat(process.env.MIN_WITHDRAWAL_AMOUNT || '0.001'),
  maxWithdrawalAmount: parseFloat(process.env.MAX_WITHDRAWAL_AMOUNT || '10'),
  dailyWithdrawalLimit: parseFloat(process.env.DAILY_WITHDRAWAL_LIMIT || '50'),
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
  },
  
  emailFrom: process.env.EMAIL_FROM || 'noreply@cryptomining.com',
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  
  web3ProviderUrl: process.env.WEB3_PROVIDER_URL || '',
  ethPrivateKey: process.env.ETH_PRIVATE_KEY || '',
  btcNetwork: process.env.BTC_NETWORK || 'testnet',
};
