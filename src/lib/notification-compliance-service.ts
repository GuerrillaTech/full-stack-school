import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';

export class NotificationComplianceService {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
  }

  // Consent Management Schema
  private ConsentSchema = z.object({
    userId: z.string(),
    globalConsentStatus: z.enum([
      'PENDING', 'GRANTED', 'REVOKED', 'EXPIRED'
    ]),
    applicableRegulations: z.array(z.enum([
      'GDPR', 'CCPA', 'HIPAA', 'FERPA', 'COPPA'
    ])),
    purposeConsents: z.array(z.object({
      purpose: z.enum([
        'COMMUNICATION', 'PERSONALIZATION', 'ANALYTICS', 
        'MARKETING', 'RESEARCH', 'PERFORMANCE_TRACKING'
      ]),
      status: z.enum([
        'PENDING', 'GRANTED', 'REVOKED', 'EXPIRED'
      ]),
      allowPersonalization: z.boolean().optional(),
      allowThirdPartySharing: z.boolean().optional()
    }))
  });

  // Initialize User Consent Profile
  async initializeUserConsentProfile(
    userData: z.infer<typeof this.ConsentSchema>
  ) {
    const validatedData = this.ConsentSchema.parse(userData);

    // AI-Enhanced Consent Recommendation
    const consentRecommendationPrompt = `
      Analyze user consent profile:
      
      User Context:
      - Applicable Regulations: ${validatedData.applicableRegulations.join(', ')}
      
      Purpose Consents:
      ${validatedData.purposeConsents.map(
        pc => `- ${pc.purpose}: ${pc.status}`
      ).join('\n')}
      
      Generate:
      - Recommended consent strategy
      - Potential compliance risks
      - Personalization recommendations
    `;

    const aiConsentInsights = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in data privacy and consent management.'
        },
        {
          role: 'user',
          content: consentRecommendationPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 512
    });

    const consentInsights = JSON.parse(
      aiConsentInsights.choices[0].message.content || '{}'
    );

    // Create Consent Profile
    return await this.prisma.userConsentProfile.create({
      data: {
        userId: validatedData.userId,
        globalConsentStatus: validatedData.globalConsentStatus,
        applicableRegulations: validatedData.applicableRegulations,
        purposeConsents: {
          create: validatedData.purposeConsents.map(pc => ({
            purpose: pc.purpose,
            status: pc.status,
            allowPersonalization: pc.allowPersonalization,
            allowThirdPartySharing: pc.allowThirdPartySharing,
            consentVersion: consentInsights.recommendedConsentVersion
          }))
        },
        consentChangeLog: {
          create: {
            changeType: 'INITIAL_SETUP',
            changedPurposes: validatedData.purposeConsents.map(pc => pc.purpose),
            changeReason: 'User consent profile initialization'
          }
        },
        aiGeneratedInsights: consentInsights
      }
    });
  }

  // Update Consent Preferences
  async updateConsentPreferences(
    userId: string,
    updatedConsent: {
      globalConsentStatus?: 'PENDING' | 'GRANTED' | 'REVOKED' | 'EXPIRED';
      purposeConsents?: {
        purpose: string;
        status?: 'PENDING' | 'GRANTED' | 'REVOKED' | 'EXPIRED';
        allowPersonalization?: boolean;
        allowThirdPartySharing?: boolean;
      }[];
    }
  ) {
    const existingProfile = await this.prisma.userConsentProfile.findUnique({
      where: { userId },
      include: { purposeConsents: true }
    });

    if (!existingProfile) {
      throw new Error('Consent profile not found');
    }

    // AI-Enhanced Consent Update Analysis
    const consentUpdatePrompt = `
      Analyze consent preference updates:
      
      Current Global Status: ${existingProfile.globalConsentStatus}
      Proposed Updates: ${JSON.stringify(updatedConsent)}
      
      Evaluate:
      - Compliance implications
      - Potential privacy risks
      - Recommended consent modifications
    `;

    const aiConsentUpdateInsights = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in data privacy compliance.'
        },
        {
          role: 'user',
          content: consentUpdatePrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 512
    });

    const consentUpdateInsights = JSON.parse(
      aiConsentUpdateInsights.choices[0].message.content || '{}'
    );

    // Update Consent Profile
    const updatedProfile = await this.prisma.userConsentProfile.update({
      where: { userId },
      data: {
        globalConsentStatus: 
          updatedConsent.globalConsentStatus || 
          existingProfile.globalConsentStatus,
        
        purposeConsents: {
          updateMany: updatedConsent.purposeConsents?.map(pc => ({
            where: { purpose: pc.purpose },
            data: {
              status: pc.status,
              allowPersonalization: pc.allowPersonalization,
              allowThirdPartySharing: pc.allowThirdPartySharing,
              lastUpdated: new Date()
            }
          })) || []
        },
        
        consentChangeLog: {
          create: {
            changeType: 'UPDATED',
            changedPurposes: 
              updatedConsent.purposeConsents?.map(pc => pc.purpose) || [],
            changeReason: consentUpdateInsights.updateRationale,
            ipAddress: consentUpdateInsights.ipAddress,
            userAgent: consentUpdateInsights.userAgent
          }
        },
        
        aiGeneratedInsights: consentUpdateInsights
      },
      include: { 
        purposeConsents: true,
        consentChangeLog: true 
      }
    });

    return updatedProfile;
  }

  // Verify Notification Compliance
  async verifyNotificationCompliance(
    notification: {
      recipientId: string;
      category: string;
      processingPurpose: string;
    }
  ) {
    const userConsentProfile = await this.prisma.userConsentProfile.findUnique({
      where: { userId: notification.recipientId },
      include: { purposeConsents: true }
    });

    if (!userConsentProfile) {
      throw new Error('User consent profile not found');
    }

    // Check Global Consent Status
    if (userConsentProfile.globalConsentStatus !== 'GRANTED') {
      return {
        isCompliant: false,
        reason: 'Global consent not granted'
      };
    }

    // Check Purpose-Specific Consent
    const purposeConsent = userConsentProfile.purposeConsents.find(
      pc => pc.purpose === notification.processingPurpose
    );

    if (!purposeConsent || purposeConsent.status !== 'GRANTED') {
      return {
        isCompliant: false,
        reason: `Consent not granted for ${notification.processingPurpose}`
      };
    }

    // AI Compliance Verification
    const complianceVerificationPrompt = `
      Verify notification compliance:
      
      Notification Context:
      - Category: ${notification.category}
      - Processing Purpose: ${notification.processingPurpose}
      
      Consent Profile:
      - Global Status: ${userConsentProfile.globalConsentStatus}
      - Applicable Regulations: ${userConsentProfile.applicableRegulations.join(', ')}
      
      Assess:
      - Regulatory compliance
      - Potential privacy risks
      - Recommended actions
    `;

    const aiComplianceInsights = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in data privacy compliance and risk assessment.'
        },
        {
          role: 'user',
          content: complianceVerificationPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 512
    });

    const complianceInsights = JSON.parse(
      aiComplianceInsights.choices[0].message.content || '{}'
    );

    // Update Notification with Compliance Metadata
    await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        complianceMetadata: complianceInsights,
        consentVerified: true,
        consentVersion: userConsentProfile.id
      }
    });

    return {
      isCompliant: true,
      insights: complianceInsights
    };
  }

  // Data Retention and Deletion
  async scheduleDataDeletion(userId: string) {
    const userConsentProfile = await this.prisma.userConsentProfile.findUnique({
      where: { userId }
    });

    if (!userConsentProfile) {
      throw new Error('User consent profile not found');
    }

    const deletionDate = new Date();
    deletionDate.setDate(
      deletionDate.getDate() + userConsentProfile.dataRetentionPeriod
    );

    return await this.prisma.userConsentProfile.update({
      where: { userId },
      data: { 
        scheduledDeletionDate: deletionDate,
        globalConsentStatus: 'REVOKED'
      }
    });
  }

  // Perform Scheduled Data Deletion
  async performScheduledDeletion() {
    const now = new Date();
    
    const profilesToDelete = await this.prisma.userConsentProfile.findMany({
      where: {
        scheduledDeletionDate: { lte: now },
        globalConsentStatus: 'REVOKED'
      }
    });

    for (const profile of profilesToDelete) {
      // Implement comprehensive data deletion across all systems
      await this.deleteUserData(profile.userId);
    }
  }

  private async deleteUserData(userId: string) {
    // Comprehensive user data deletion across all models
    await this.prisma.$transaction([
      this.prisma.notification.deleteMany({ where: { recipientId: userId } }),
      this.prisma.userConsentProfile.delete({ where: { userId } }),
      // Add deletions for other user-related models
    ]);
  }
}
