import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../config/logger';

const transporter = nodemailer.createTransporter(config.smtp);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: config.emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    logger.info(`Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    logger.error('Email sending failed:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string): Promise<boolean> => {
  const html = `
    <h1>Welcome to Crypto Mining Platform!</h1>
    <p>Hi ${firstName},</p>
    <p>Thank you for registering with us. Your account has been successfully created.</p>
    <p>To get started, please complete your KYC verification.</p>
    <p>Best regards,<br>Crypto Mining Team</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Crypto Mining Platform',
    html,
    text: `Welcome ${firstName}! Your account has been successfully created.`,
  });
};

export const sendVerificationEmail = async (
  email: string,
  verificationCode: string
): Promise<boolean> => {
  const html = `
    <h1>Email Verification</h1>
    <p>Your verification code is: <strong>${verificationCode}</strong></p>
    <p>This code will expire in 15 minutes.</p>
    <p>Best regards,<br>Crypto Mining Team</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Email Verification Code',
    html,
    text: `Your verification code is: ${verificationCode}`,
  });
};

export const sendWithdrawalConfirmationEmail = async (
  email: string,
  amount: number,
  currency: string,
  verificationCode: string
): Promise<boolean> => {
  const html = `
    <h1>Withdrawal Request Confirmation</h1>
    <p>A withdrawal request has been initiated for your account.</p>
    <p><strong>Amount:</strong> ${amount} ${currency}</p>
    <p><strong>Verification Code:</strong> ${verificationCode}</p>
    <p>Please use this code to complete your withdrawal. This code will expire in 10 minutes.</p>
    <p>If you did not request this withdrawal, please contact support immediately.</p>
    <p>Best regards,<br>Crypto Mining Team</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Withdrawal Confirmation Required',
    html,
    text: `Withdrawal request for ${amount} ${currency}. Verification code: ${verificationCode}`,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset for your account.</p>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Best regards,<br>Crypto Mining Team</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html,
    text: `Reset your password: ${resetUrl}`,
  });
};

export const sendKYCStatusEmail = async (
  email: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<boolean> => {
  const html = status === 'approved'
    ? `
      <h1>KYC Verification Approved</h1>
      <p>Congratulations! Your KYC verification has been approved.</p>
      <p>You can now access all features of the platform.</p>
      <p>Best regards,<br>Crypto Mining Team</p>
    `
    : `
      <h1>KYC Verification Rejected</h1>
      <p>Unfortunately, your KYC verification has been rejected.</p>
      <p><strong>Reason:</strong> ${rejectionReason || 'Please resubmit with correct documents.'}</p>
      <p>Please resubmit your documents for review.</p>
      <p>Best regards,<br>Crypto Mining Team</p>
    `;

  return sendEmail({
    to: email,
    subject: `KYC Verification ${status === 'approved' ? 'Approved' : 'Rejected'}`,
    html,
    text: `Your KYC verification has been ${status}.`,
  });
};
