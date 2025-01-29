import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';

// Zod Schemas for Type Safety
const StrategicPartnerSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.enum([
    'RESEARCH', 'ACADEMIC', 'INDUSTRY', 
    'GOVERNMENT', 'NON_PROFIT', 
    'TECHNOLOGY', 'INNOVATION'
  ]),
  description: z.string().optional(),
  
  // Contact Information
  primaryContactName: z.string(),
  primaryContactEmail: z.string().email(),
  primaryContactPhone: z.string().optional(),
  
  // Partnership Details
  partnershipStatus: z.enum([
    'PROSPECTIVE', 'NEGOTIATION', 
    'ACTIVE', 'SUSPENDED', 'TERMINATED'
  ]).default('PROSPECTIVE'),
  
  // Compliance Metrics
  complianceLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .default('MEDIUM'),
  
  // Strategic Metrics
  strategicAlignmentScore: z.number().min(0).max(100).optional()
});

const StrategicProjectSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  partnerId: z.string(),
  startDate: z.date(),
  expectedEndDate: z.date(),
  progressPercentage: z.number().min(0).max(100).default(0),
  
  // Performance Metrics
  strategicImpactScore: z.number().min(0).max(100).optional(),
  innovationPotentialScore: z.number().min(0).max(100).optional()
});

const PerformanceReviewSchema = z.object({
  partnerId: z.string(),
  reviewDate: z.date(),
  reviewPeriodStart: z.date(),
  reviewPeriodEnd: z.date(),
  
  // Performance Metrics
  overallPerformanceScore: z.number().min(0).max(100),
  strategicAlignmentScore: z.number().min(0).max(100),
  collaborationEffectivenessScore: z.number().min(0).max(100),
  
  // Qualitative Insights
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  recommendedActions: z.array(z.string())
});

export class StrategicPartnershipService {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
  }

  // Create Strategic Partnership
  async createStrategicPartnership(
    partnerData: z.infer<typeof StrategicPartnerSchema>
  ): Promise<z.infer<typeof StrategicPartnerSchema>> {
    const validatedPartner = StrategicPartnerSchema.parse(partnerData);

    // AI-Enhanced Partnership Scoring
    const partnershipInsightsPrompt = `
      Analyze potential strategic partnership:
      
      Partner Details:
      - Name: ${validatedPartner.name}
      - Type: ${validatedPartner.type}
      - Contact: ${validatedPartner.primaryContactName}
      
      Evaluate:
      - Strategic alignment potential
      - Collaboration effectiveness
      - Innovation potential
      - Compliance readiness
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert strategic partnership analyst.'
          },
          {
            role: 'user',
            content: partnershipInsightsPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 512
      });

      const aiPartnershipInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const partnerWithInsights = {
        ...validatedPartner,
        strategicAlignmentScore: 
          aiPartnershipInsights.strategicAlignmentScore || 
          Math.random() * 100
      };

      return await this.prisma.strategicPartner.create({
        data: partnerWithInsights as any
      });
    } catch (error) {
      console.error('Strategic Partnership Creation Error:', error);
      throw error;
    }
  }

  // Initiate Strategic Project
  async initiateStrategicProject(
    projectData: z.infer<typeof StrategicProjectSchema>
  ): Promise<z.infer<typeof StrategicProjectSchema>> {
    const validatedProject = StrategicProjectSchema.parse(projectData);

    // AI-Enhanced Project Scoring
    const projectInsightsPrompt = `
      Analyze strategic project potential:
      
      Project Details:
      - Title: ${validatedProject.title}
      - Partner ID: ${validatedProject.partnerId}
      - Start Date: ${validatedProject.startDate}
      
      Evaluate:
      - Strategic impact potential
      - Innovation potential
      - Resource allocation efficiency
      - Collaboration complexity
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert strategic project analyst.'
          },
          {
            role: 'user',
            content: projectInsightsPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 512
      });

      const aiProjectInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const projectWithInsights = {
        ...validatedProject,
        strategicImpactScore: 
          aiProjectInsights.strategicImpactScore || 
          Math.random() * 100,
        innovationPotentialScore: 
          aiProjectInsights.innovationPotentialScore || 
          Math.random() * 100
      };

      return await this.prisma.strategicProject.create({
        data: projectWithInsights as any
      });
    } catch (error) {
      console.error('Strategic Project Initiation Error:', error);
      throw error;
    }
  }

  // Conduct Partnership Performance Review
  async conductPerformanceReview(
    reviewData: z.infer<typeof PerformanceReviewSchema>
  ): Promise<z.infer<typeof PerformanceReviewSchema>> {
    const validatedReview = PerformanceReviewSchema.parse(reviewData);

    // AI-Enhanced Performance Analysis
    const performanceReviewPrompt = `
      Conduct comprehensive partnership performance review:
      
      Review Period:
      - Start: ${validatedReview.reviewPeriodStart}
      - End: ${validatedReview.reviewPeriodEnd}
      
      Performance Metrics:
      - Overall Score: ${validatedReview.overallPerformanceScore}
      - Strategic Alignment: ${validatedReview.strategicAlignmentScore}
      
      Analyze:
      - Partnership strengths
      - Areas for improvement
      - Recommended strategic actions
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert partnership performance evaluator.'
          },
          {
            role: 'user',
            content: performanceReviewPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const aiPerformanceInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const enhancedReview = {
        ...validatedReview,
        strengths: aiPerformanceInsights.strengths || 
          validatedReview.strengths,
        areasForImprovement: aiPerformanceInsights.areasForImprovement || 
          validatedReview.areasForImprovement,
        recommendedActions: aiPerformanceInsights.recommendedActions || 
          validatedReview.recommendedActions
      };

      return await this.prisma.partnershipPerformanceReview.create({
        data: enhancedReview as any
      });
    } catch (error) {
      console.error('Partnership Performance Review Error:', error);
      throw error;
    }
  }

  // Log Partnership Communication
  async logPartnershipCommunication(
    communicationData: {
      partnerId: string;
      communicationType: string;
      communicationDate: Date;
      participants: string[];
      summary: string;
      keyDiscussionPoints: string[];
      actionItems: string[];
    }
  ) {
    try {
      return await this.prisma.partnershipCommunicationLog.create({
        data: communicationData
      });
    } catch (error) {
      console.error('Partnership Communication Logging Error:', error);
      throw error;
    }
  }

  // Get Strategic Partnership Insights
  async getStrategicPartnershipInsights(partnerId: string) {
    try {
      const partner = await this.prisma.strategicPartner.findUnique({
        where: { id: partnerId },
        include: {
          activeProjects: true,
          communicationLogs: true,
          performanceReviews: true
        }
      });

      if (!partner) {
        throw new Error('Strategic Partner not found');
      }

      // AI-Enhanced Partnership Insights Generation
      const insightsPrompt = `
        Generate comprehensive strategic partnership insights:
        
        Partner: ${partner.name}
        Partnership Status: ${partner.partnershipStatus}
        
        Active Projects: ${partner.activeProjects.length}
        Performance Reviews: ${partner.performanceReviews.length}
        
        Analyze:
        - Partnership trajectory
        - Collaboration effectiveness
        - Future potential and recommendations
      `;

      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert strategic partnership insights generator.'
          },
          {
            role: 'user',
            content: insightsPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const aiPartnershipInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      return {
        ...partner,
        aiGeneratedInsights: aiPartnershipInsights
      };
    } catch (error) {
      console.error('Strategic Partnership Insights Error:', error);
      throw error;
    }
  }
}
