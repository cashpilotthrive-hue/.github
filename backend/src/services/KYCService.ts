import { KYCDocument, User } from '../models';
import { sendKYCStatusEmail } from '../utils/email';

export class KYCService {
  async submitKYC(
    userId: number,
    data: {
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
    }
  ) {
    const existingKYC = await KYCDocument.findOne({
      where: { userId, status: 'pending' },
    });

    if (existingKYC) {
      throw new Error('KYC submission already pending review');
    }

    const kycDocument = await KYCDocument.create({
      userId,
      ...data,
      status: 'pending',
    });

    // Update user KYC status
    await User.update(
      { kycStatus: 'pending' },
      { where: { id: userId } }
    );

    return kycDocument;
  }

  async getUserKYC(userId: number) {
    return await KYCDocument.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async getPendingKYCs(limit: number = 50, offset: number = 0) {
    const kycs = await KYCDocument.findAll({
      where: { status: 'pending' },
      limit,
      offset,
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
    });

    const total = await KYCDocument.count({ where: { status: 'pending' } });

    return {
      kycs,
      total,
      limit,
      offset,
    };
  }

  async reviewKYC(
    adminId: number,
    kycId: number,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ) {
    const kyc = await KYCDocument.findByPk(kycId);

    if (!kyc) {
      throw new Error('KYC document not found');
    }

    if (kyc.status !== 'pending') {
      throw new Error('KYC document has already been reviewed');
    }

    kyc.status = status;
    kyc.reviewedBy = adminId;
    kyc.reviewedAt = new Date();
    if (rejectionReason) {
      kyc.rejectionReason = rejectionReason;
    }
    await kyc.save();

    // Update user KYC status
    await User.update(
      { kycStatus: status },
      { where: { id: kyc.userId } }
    );

    // Send email notification
    const user = await User.findByPk(kyc.userId);
    if (user) {
      await sendKYCStatusEmail(user.email, status, rejectionReason);
    }

    return kyc;
  }

  async getKYCStats() {
    const pending = await KYCDocument.count({ where: { status: 'pending' } });
    const approved = await KYCDocument.count({ where: { status: 'approved' } });
    const rejected = await KYCDocument.count({ where: { status: 'rejected' } });

    return {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
    };
  }
}

export default new KYCService();
