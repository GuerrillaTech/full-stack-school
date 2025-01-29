import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';

// Zod Schemas for Type Safety
const ScholarshipProgramSchema = z.object({
  title: z.string(),
  code: z.string().unique(),
  description: z.string().optional(),
  
  type: z.enum([
    'MERIT_BASED', 'NEED_BASED', 'DIVERSITY_INCLUSION', 
    'STEM_SUPPORT', 'RESEARCH_GRANT', 
    'ENTREPRENEURIAL_SUPPORT', 'COMMUNITY_SERVICE'
  ]),
  
  fundingSource: z.enum([
    'INSTITUTIONAL', 'CORPORATE_SPONSOR', 'GOVERNMENT_GRANT', 
    'PRIVATE_DONOR', 'ALUMNI_CONTRIBUTION', 'RESEARCH_FOUNDATION'
  ]),
  
  totalFundingAmount: z.number().positive(),
  individualAwardAmount: z.number().positive(),
  
  eligibilityCriteria: z.array(z.enum([
    'ACADEMIC_PERFORMANCE', 'FINANCIAL_NEED', 
    'UNDERREPRESENTED_BACKGROUND', 'COMMUNITY_INVOLVEMENT', 
    'RESEARCH_POTENTIAL', 'INNOVATION_POTENTIAL', 
    'LEADERSHIP_QUALITIES'
  ])),
  
  minimumGPA: z.number().min(0).max(4).optional(),
  
  applicationStartDate: z.date(),
  applicationEndDate: z.date(),
  fundingPeriodStart: z.date(),
  fundingPeriodEnd: z.date(),
  
  totalAwardsAvailable: z.number().int().positive(),
  
  termsAndConditions: z.string().optional(),
  reportingRequirements: z.array(z.string()).optional()
});

const ScholarshipApplicationSchema = z.object({
  studentId: z.string(),
  programId: z.string(),
  applicationDocuments: z.array(z.object({
    documentType: z.string(),
    documentName: z.string(),
    documentPath: z.string()
  })).optional()
});

const ScholarshipPerformanceReviewSchema = z.object({
  scholarshipId: z.string(),
  reviewDate: z.date(),
  reviewPeriod: z.string(),
  
  academicPerformance: z.number().min(0).max(100).optional(),
  researchProgress: z.number().min(0).max(100).optional(),
  communityInvolvement: z.number().min(0).max(100).optional(),
  
  mentorFeedback: z.string().optional()
});

export class ScholarshipEquityService {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
  }

  // Create Scholarship Program
  async createScholarshipProgram(
    programData: z.infer<typeof ScholarshipProgramSchema>
  ) {
    const validatedProgram = ScholarshipProgramSchema.parse(programData);

    // AI-Enhanced Scholarship Program Design
    const scholarshipProgramPrompt = `
      Design comprehensive scholarship program:
      
      Program Details:
      - Title: ${validatedProgram.title}
      - Type: ${validatedProgram.type}
      - Funding Source: ${validatedProgram.fundingSource}
      
      Analyze and recommend:
      - Eligibility criteria optimization
      - Funding allocation strategy
      - Potential impact on student development
      - Diversity and inclusion considerations
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert scholarship program designer.'
          },
          {
            role: 'user',
            content: scholarshipProgramPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const aiProgramInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const programWithInsights = {
        ...validatedProgram,
        eligibilityCriteria: [
          ...(validatedProgram.eligibilityCriteria || []),
          ...(aiProgramInsights.additionalEligibilityCriteria || [])
        ],
        reportingRequirements: [
          ...(validatedProgram.reportingRequirements || []),
          ...(aiProgramInsights.additionalReportingRequirements || [])
        ],
        aiGeneratedInsights: aiProgramInsights
      };

      return await this.prisma.scholarshipProgram.create({
        data: programWithInsights as any
      });
    } catch (error) {
      console.error('Scholarship Program Creation Error:', error);
      throw error;
    }
  }

  // Apply for Scholarship
  async applyForScholarship(
    applicationData: z.infer<typeof ScholarshipApplicationSchema>
  ) {
    const validatedApplication = ScholarshipApplicationSchema.parse(applicationData);

    // AI-Enhanced Scholarship Matching
    const scholarshipMatchingPrompt = `
      Analyze scholarship application potential:
      
      Student-Program Matching:
      - Student ID: ${validatedApplication.studentId}
      - Program ID: ${validatedApplication.programId}
      
      Evaluate:
      - Student-program compatibility
      - Potential for success
      - Impact on student development
      - Diversity and inclusion considerations
    `;

    try {
      const scholarshipProgram = await this.prisma.scholarshipProgram.findUnique({
        where: { id: validatedApplication.programId }
      });

      if (!scholarshipProgram) {
        throw new Error('Scholarship Program not found');
      }

      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert scholarship application matcher.'
          },
          {
            role: 'user',
            content: scholarshipMatchingPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 512
      });

      const aiMatchingInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const scholarshipApplication = await this.prisma.scholarship.create({
        data: {
          studentId: validatedApplication.studentId,
          programId: validatedApplication.programId,
          status: 'PENDING',
          awardAmount: scholarshipProgram.individualAwardAmount,
          performanceInsights: aiMatchingInsights,
          applicationDocuments: {
            create: validatedApplication.applicationDocuments?.map(doc => ({
              documentType: doc.documentType,
              documentName: doc.documentName,
              documentPath: doc.documentPath
            })) || []
          }
        }
      });

      return scholarshipApplication;
    } catch (error) {
      console.error('Scholarship Application Error:', error);
      throw error;
    }
  }

  // Conduct Scholarship Performance Review
  async conductScholarshipPerformanceReview(
    reviewData: z.infer<typeof ScholarshipPerformanceReviewSchema>
  ) {
    const validatedReview = ScholarshipPerformanceReviewSchema.parse(reviewData);

    // AI-Enhanced Performance Analysis
    const performanceAnalysisPrompt = `
      Analyze scholarship recipient performance:
      
      Performance Metrics:
      - Academic Performance: ${validatedReview.academicPerformance}%
      - Research Progress: ${validatedReview.researchProgress}%
      - Community Involvement: ${validatedReview.communityInvolvement}%
      
      Generate:
      - Performance category
      - Development recommendations
      - Future support needs
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert scholarship performance analyst.'
          },
          {
            role: 'user',
            content: performanceAnalysisPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 512
      });

      const aiPerformanceInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const performanceReview = await this.prisma.scholarshipPerformanceReview.create({
        data: {
          ...validatedReview,
          performanceCategory: aiPerformanceInsights.performanceCategory,
          developmentRecommendations: 
            aiPerformanceInsights.developmentRecommendations || []
        }
      });

      // Update Scholarship Status Based on Performance
      await this.updateScholarshipStatus(
        validatedReview.scholarshipId, 
        aiPerformanceInsights
      );

      return performanceReview;
    } catch (error) {
      console.error('Scholarship Performance Review Error:', error);
      throw error;
    }
  }

  // Submit Scholarship Progress Report
  async submitScholarshipProgressReport(
    scholarshipId: string,
    reportData: {
      reportPeriod: string;
      academicProgress?: number;
      researchMilestones?: string[];
      communityContributions?: string[];
      nextMilestones?: string[];
      supportNeeds?: string[];
    }
  ) {
    try {
      // AI-Enhanced Progress Analysis
      const progressAnalysisPrompt = `
        Analyze scholarship recipient progress:
        
        Progress Details:
        - Academic Progress: ${reportData.academicProgress}%
        - Research Milestones: ${reportData.researchMilestones?.join(', ') || 'N/A'}
        - Community Contributions: ${reportData.communityContributions?.join(', ') || 'N/A'}
        
        Generate:
        - Progress category
        - Development suggestions
        - Future support recommendations
      `;

      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert scholarship progress analyst.'
          },
          {
            role: 'user',
            content: progressAnalysisPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 512
      });

      const aiProgressInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      return await this.prisma.scholarshipProgressReport.create({
        data: {
          scholarshipId,
          reportDate: new Date(),
          ...reportData,
          progressCategory: aiProgressInsights.progressCategory,
          developmentSuggestions: 
            aiProgressInsights.developmentSuggestions || []
        }
      });
    } catch (error) {
      console.error('Scholarship Progress Report Error:', error);
      throw error;
    }
  }

  // Update Scholarship Status
  private async updateScholarshipStatus(
    scholarshipId: string, 
    performanceInsights: any
  ) {
    const statusUpdateMap = {
      'EXCEPTIONAL': 'ACTIVE',
      'GOOD': 'ACTIVE',
      'NEEDS_IMPROVEMENT': 'PENDING',
      'UNSATISFACTORY': 'REJECTED'
    };

    const recommendedStatus = statusUpdateMap[
      performanceInsights.performanceCategory
    ] || 'PENDING';

    await this.prisma.scholarship.update({
      where: { id: scholarshipId },
      data: { 
        status: recommendedStatus,
        performanceInsights: performanceInsights
      }
    });
  }

  // Get Scholarship Program Insights
  async getScholarshipProgramInsights(programId: string) {
    try {
      const scholarshipProgram = await this.prisma.scholarshipProgram.findUnique({
        where: { id: programId },
        include: {
          awardedScholarships: {
            include: {
              student: true,
              performanceReviews: true,
              progressReports: true
            }
          }
        }
      });

      if (!scholarshipProgram) {
        throw new Error('Scholarship Program not found');
      }

      // AI-Enhanced Program Insights
      const programInsightsPrompt = `
        Generate comprehensive scholarship program insights:
        
        Program: ${scholarshipProgram.title}
        Total Funding: $${scholarshipProgram.totalFundingAmount}
        Awards Available: ${scholarshipProgram.totalAwardsAvailable}
        
        Analyze:
        - Program effectiveness
        - Student impact
        - Diversity and inclusion metrics
        - Future improvement recommendations
      `;

      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert scholarship program performance analyst.'
          },
          {
            role: 'user',
            content: programInsightsPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const aiProgramInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      return {
        ...scholarshipProgram,
        aiGeneratedProgramInsights: aiProgramInsights
      };
    } catch (error) {
      console.error('Scholarship Program Insights Error:', error);
      throw error;
    }
  }
}
