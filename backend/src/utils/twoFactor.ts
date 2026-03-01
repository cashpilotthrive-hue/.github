import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const generate2FASecret = (email: string): { secret: string; otpauthUrl: string } => {
  const secret = speakeasy.generateSecret({
    name: `Crypto Mining (${email})`,
    issuer: 'Crypto Mining Platform',
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
  };
};

export const generateQRCode = async (otpauthUrl: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

export const verify2FAToken = (token: string, secret: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps before and after
  });
};

export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
};
