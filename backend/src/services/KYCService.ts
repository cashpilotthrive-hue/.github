import { KYCDocument, KYCVerification, RiskScore, User, AuditLog } from '../models';
import { Op } from 'sequelize';
import config from '../config';
import axios from 'axios';
import logger from '../config/logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5002';

export interface KYCSubmissionData {
  userId: number;
  documentType: 'passport' | 'drivers_license' | 'national_id';
  documentNumber?: string;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  fullName: string;
  dateOfBirth: Date;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface VerificationResult {
  success: boolean;
  kycDocumentId?: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  requiresManualReview: boolean;
  overallConfidence?: number;
  message: string;
}

class KYCService {
  /**
   * Submit new KYC documents for verification
   */
  async submitKYC(data: KYCSubmissionData): Promise<VerificationResult> {
    try {
      // Create KYC document record
      const kycDocument = await KYCDocument.create({
        userId: data.userId,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        documentFrontUrl: data.documentFrontUrl,
        documentBackUrl: data.documentBackUrl,
        selfieUrl: data.selfieUrl,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        status: 'processing',
        aiVerified: false,
        requiresManualReview: false,
      });

      // Log submission
      await AuditLog.create({
        userId: data.userId,
        action: 'kyc_submitted',
        resource: 'kyc_document',
        resourceId: kycDocument.id,
        details: {
          documentType: data.documentType,
        },
      });

      // Trigger AI verification asynchronously
      this.triggerAIVerification(kycDocument.id).catch(error => {
        logger.error('AI verification failed:', error);
      });

      return {
        success: true,
        kycDocumentId: kycDocument.id,
        status: 'processing',
        requiresManualReview: false,
        message: 'KYC documents submitted successfully. Verification in progress.',
      };
    } catch (error) {
      logger.error('KYC submission error:', error);
      throw new Error('Failed to submit KYC documents');
    }
  }

  /**
   * Trigger AI verification for a KYC document
   */
  async triggerAIVerification(kycDocumentId: number): Promise<void> {
    try {
      const kycDocument = await KYCDocument.findByPk(kycDocumentId);
      if (!kycDocument) {
        throw new Error('KYC document not found');
      }

      // Prepare data for AI service
      const verificationData = {
        kycId: kycDocument.id,
        documentFrontUrl: kycDocument.documentFrontUrl,
        documentBackUrl: kycDocument.documentBackUrl,
        selfieUrl: kycDocument.selfieUrl,
        documentType: kycDocument.documentType,
        documentUrls: [
          kycDocument.documentFrontUrl,
          kycDocument.documentBackUrl,
        ].filter(Boolean),
        userData: {
          fullName: kycDocument.fullName,
          dateOfBirth: kycDocument.dateOfBirth,
          country: kycDocument.country,
          address: kycDocument.address,
          city: kycDocument.city,
          state: kycDocument.state,
          postalCode: kycDocument.postalCode,
        },
      };

      // Call AI service for complete verification
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/verify/complete`,
        verificationData,
        { timeout: 60000 } // 60 second timeout
      );

      const result = response.data;

      // Save verification results
      if (result.verifications && Array.isArray(result.verifications)) {
        for (const verification of result.verifications) {
          await KYCVerification.create({
            kycDocumentId: kycDocument.id,
            verificationType: verification.type,
            aiModel: this.getModelName(verification.type),
            confidence: verification.confidence,
            result: verification.result,
            details: verification.details || {},
            processingTimeMs: result.processingTimeMs,
          });
        }
      }

      // Update KYC document with AI results
      const updateData: any = {
        aiVerified: true,
        aiConfidence: result.overallConfidence,
        aiProcessedAt: new Date(),
        requiresManualReview: result.requiresManualReview,
      };

      // Determine final status
      if (result.overallResult === 'fail') {
        updateData.status = 'rejected';
        updateData.rejectionReason = 'AI verification failed';
      } else if (result.requiresManualReview) {
        updateData.status = 'pending';
      } else if (result.overallResult === 'pass') {
        updateData.status = 'approved';
        // Auto-approve if high confidence and all checks passed
        await this.updateUserKYCStatus(kycDocument.userId, 'approved');
      }

      await kycDocument.update(updateData);

      // Update risk score
      await this.updateRiskScore(kycDocument.userId, result);

      // Log verification completion
      await AuditLog.create({
        userId: kycDocument.userId,
        action: 'ai_verification_completed',
        resource: 'kyc_document',
        resourceId: kycDocument.id,
        details: {
          overallResult: result.overallResult,
          overallConfidence: result.overallConfidence,
          requiresManualReview: result.requiresManualReview,
        },
      });

      logger.info(`AI verification completed for KYC #${kycDocumentId}: ${result.overallResult}`);
    } catch (error) {
      logger.error('AI verification error:', error);
      
      // Update KYC document to require manual review on error
      await KYCDocument.update(
        {
          requiresManualReview: true,
          status: 'pending',
        },
        { where: { id: kycDocumentId } }
      );
    }
  }

  /**
   * Get KYC status for a user
   */
  async getKYCStatus(userId: number): Promise<any> {
    const kycDocument = await KYCDocument.findOne({
      where: { userId },
      include: [
        {
          model: KYCVerification,
          as: 'verifications',
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!kycDocument) {
      return {
        status: 'not_started',
        message: 'No KYC submission found',
      };
    }

    return {
      id: kycDocument.id,
      status: kycDocument.status,
      aiVerified: kycDocument.aiVerified,
      aiConfidence: kycDocument.aiConfidence,
      requiresManualReview: kycDocument.requiresManualReview,
      verifications: kycDocument.get('verifications'),
      submittedAt: kycDocument.createdAt,
      reviewedAt: kycDocument.reviewedAt,
    };
  }

  /**
   * Admin: Get pending KYC submissions
   */
  async getPendingKYCs(limit: number = 50, offset: number = 0): Promise<any[]> {
    const kycDocuments = await KYCDocument.findAll({
      where: { 
        status: 'pending',
        requiresManualReview: true,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
        {
          model: KYCVerification,
          as: 'verifications',
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'ASC']],
    });

    return kycDocuments;
  }

  /**
   * Admin: Manual review and approval/rejection
   */
  async manualReview(
    kycDocumentId: number,
    reviewerId: number,
    decision: 'approved' | 'rejected',
    reason?: string
  ): Promise<void> {
    const kycDocument = await KYCDocument.findByPk(kycDocumentId);
    if (!kycDocument) {
      throw new Error('KYC document not found');
    }

    await kycDocument.update({
      status: decision,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: reason,
    });

    // Update user KYC status
    await this.updateUserKYCStatus(kycDocument.userId, decision);

    // Log manual review
    await AuditLog.create({
      userId: reviewerId,
      action: 'kyc_manual_review',
      resource: 'kyc_document',
      resourceId: kycDocument.id,
      details: {
        decision,
        reason,
        forUserId: kycDocument.userId,
      },
    });

    logger.info(`Manual review completed for KYC #${kycDocumentId}: ${decision}`);
  }

  /**
   * Update user's KYC status
   */
  private async updateUserKYCStatus(
    userId: number,
    status: 'approved' | 'rejected'
  ): Promise<void> {
    await User.update(
      { kycStatus: status },
      { where: { id: userId } }
    );
  }

  /**
   * Update or create risk score for user
   */
  private async updateRiskScore(userId: number, verificationResult: any): Promise<void> {
    try {
      const verifications = verificationResult.verifications || [];
      
      // Extract risk metrics from verifications
      const identityVerif = verifications.find((v: any) => v.type === 'identity');
      const fraudVerif = verifications.find((v: any) => v.type === 'fraud');
      const complianceVerif = verifications.find((v: any) => v.type === 'compliance');
      
      // Calculate risk scores (0-100, higher is more risky)
      const identityRisk = identityVerif 
        ? (1 - identityVerif.confidence) * 100 
        : 50;
      const fraudRisk = fraudVerif 
        ? (fraudVerif.result === 'fail' ? 100 : (1 - fraudVerif.confidence) * 100) 
        : 50;
      const complianceRisk = complianceVerif 
        ? (complianceVerif.result === 'fail' ? 100 : (1 - complianceVerif.confidence) * 100) 
        : 50;
      
      const overallScore = (identityRisk + fraudRisk + complianceRisk) / 3;
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (overallScore < 20) riskLevel = 'low';
      else if (overallScore < 40) riskLevel = 'medium';
      else if (overallScore < 70) riskLevel = 'high';
      else riskLevel = 'critical';
      
      // Calculate next review date (higher risk = sooner review)
      const daysUntilReview = riskLevel === 'critical' ? 30 : 
                             riskLevel === 'high' ? 90 : 
                             riskLevel === 'medium' ? 180 : 365;
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + daysUntilReview);
      
      const [riskScore, created] = await RiskScore.findOrCreate({
        where: { userId },
        defaults: {
          userId,
          overallScore,
          identityRisk,
          fraudRisk,
          complianceRisk,
          transactionRisk: 0,
          riskLevel,
          requiresReview: riskLevel === 'high' || riskLevel === 'critical',
          nextReviewDate,
          factors: { verificationResult },
        },
      });
      
      if (!created) {
        await riskScore.update({
          overallScore,
          identityRisk,
          fraudRisk,
          complianceRisk,
          riskLevel,
          requiresReview: riskLevel === 'high' || riskLevel === 'critical',
          nextReviewDate,
          factors: { verificationResult },
        });
      }
      
      logger.info(`Risk score updated for user #${userId}: ${riskLevel} (${overallScore.toFixed(2)})`);
    } catch (error) {
      logger.error('Error updating risk score:', error);
    }
  }

  /**
   * Get model name based on verification type
   */
  private getModelName(type: string): string {
    const modelMap: Record<string, string> = {
      identity: 'facenet-v1.0',
      fraud: 'fraud-detector-v2.1',
      document_quality: 'docnet-v1.5',
      compliance: 'compliance-checker-v1.0',
    };
    return modelMap[type] || 'unknown';
  }

  /**
   * Scheduled job: Re-verify high-risk users
   */
  async reVerifyHighRiskUsers(): Promise<void> {
    try {
      const today = new Date();
      const highRiskUsers = await RiskScore.findAll({
        where: {
          requiresReview: true,
          nextReviewDate: { [Op.lte]: today },
        },
        include: [
          {
            model: User,
            as: 'user',
          },
        ],
        limit: 10, // Process 10 at a time
      });

      for (const riskScore of highRiskUsers) {
        const user = riskScore.get('user') as any;
        if (!user) continue;

        // Get latest KYC document
        const kycDocument = await KYCDocument.findOne({
          where: { userId: user.id },
          order: [['createdAt', 'DESC']],
        });

        if (kycDocument) {
          logger.info(`Re-verifying high-risk user #${user.id}`);
          await this.triggerAIVerification(kycDocument.id);
        }
      }

      logger.info(`Re-verification completed for ${highRiskUsers.length} high-risk users`);
    } catch (error) {
      logger.error('Error in re-verification job:', error);
    }
  }
}

export default new KYCService();
