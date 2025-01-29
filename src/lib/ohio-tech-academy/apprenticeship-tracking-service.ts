import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';

// Zod Schemas for Type Safety
const ApprenticeshipPartnerSchema = z.object({
  name: z.string(),
  industry: z.string(),
  description: z.string().optional(),
  contactPerson: z.string(),
  email: z.string().email(),
  phone: z.string(),
  complianceCertifications: z.array(z.string()).optional()
});

const ApprenticeshipProgramSchema = z.object({
  title: z.string(),
  code: z.string().unique(),
  description: z.string().optional(),
  partnerId: z.string(),
  category: z.enum([
    'TECHNICAL', 'PROFESSIONAL', 'CREATIVE', 
    'RESEARCH', 'ENTREPRENEURIAL', 'SOCIAL_IMPACT'
  ]),
  duration: z.number().int().default(6),
  learningObjectives: z.array(z.string()),
  requiredSkills: z.array(z.string())
});

const ApprenticeshipSchema = z.object({
  studentId: z.string(),
  programId: z.string(),
  startDate: z.date(),
  expectedEndDate: z.date(),
  mentorName: z.string(),
  mentorEmail: z.string().email()
});

const ApprenticeshipSkillAssessmentSchema = z.object({
  apprenticeshipId: z.string(),
  skillName: z.string(),
  category: z.string(),
  initialProficiencyLevel: z.enum([
    'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'
  ]),
  currentProficiencyLevel: z.enum([
    'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'
  ])
});

const ApprenticeshipProjectSchema = z.object({
  apprenticeshipId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startDate: z.date(),
  expectedEndDate: z.date(),
  skillsApplied: z.array(z.string())
});

export class ApprenticeshipTrackingService {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
  }

  // Register Apprenticeship Partner
  async registerApprenticeshipPartner(
    partnerData: z.infer<typeof ApprenticeshipPartnerSchema>
  ) {
    const validatedPartner = ApprenticeshipPartnerSchema.parse(partnerData);

    // AI-Enhanced Partner Verification
    const partnerVerificationPrompt = `
      Analyze potential apprenticeship partner:
      
      Partner Details:
      - Name: ${validatedPartner.name}
      - Industry: ${validatedPartner.industry}
      
      Evaluate:
      - Partnership potential
      - Industry alignment
      - Compliance readiness
      - Potential apprenticeship opportunities
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert apprenticeship partnership evaluator.'
          },
          {
            role: 'user',
            content: partnerVerificationPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 512
      });

      const aiPartnerInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const partnerWithInsights = {
        ...validatedPartner,
        legalDocuments: aiPartnerInsights.legalDocumentRecommendations,
        successRate: aiPartnerInsights.estimatedSuccessRate
      };

      return await this.prisma.apprenticeshipPartner.create({
        data: partnerWithInsights as any
      });
    } catch (error) {
      console.error('Apprenticeship Partner Registration Error:', error);
      throw error;
    }
  }

  // Create Apprenticeship Program
  async createApprenticeshipProgram(
    programData: z.infer<typeof ApprenticeshipProgramSchema>
  ) {
    const validatedProgram = ApprenticeshipProgramSchema.parse(programData);

    // AI-Enhanced Program Design
    const programDesignPrompt = `
      Design comprehensive apprenticeship program:
      
      Program Details:
      - Title: ${validatedProgram.title}
      - Category: ${validatedProgram.category}
      - Duration: ${validatedProgram.duration} months
      
      Analyze and recommend:
      - Learning objectives optimization
      - Skill development strategy
      - Industry relevance
      - Potential learning challenges
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert apprenticeship program designer.'
          },
          {
            role: 'user',
            content: programDesignPrompt
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
        learningObjectives: [
          ...(validatedProgram.learningObjectives || []),
          ...(aiProgramInsights.additionalLearningObjectives || [])
        ],
        requiredSkills: [
          ...(validatedProgram.requiredSkills || []),
          ...(aiProgramInsights.additionalRequiredSkills || [])
        ],
        successRate: aiProgramInsights.estimatedSuccessRate,
        averageCompletionTime: aiProgramInsights.estimatedCompletionTime
      };

      return await this.prisma.apprenticeshipProgram.create({
        data: programWithInsights as any
      });
    } catch (error) {
      console.error('Apprenticeship Program Creation Error:', error);
      throw error;
    }
  }

  // Initiate Apprenticeship
  async initiateApprenticeship(
    apprenticeshipData: z.infer<typeof ApprenticeshipSchema>
  ) {
    const validatedApprenticeship = ApprenticeshipSchema.parse(apprenticeshipData);

    // AI-Enhanced Apprenticeship Matching
    const apprenticeshipMatchingPrompt = `
      Analyze apprenticeship potential:
      
      Student-Program Matching:
      - Student ID: ${validatedApprenticeship.studentId}
      - Program ID: ${validatedApprenticeship.programId}
      
      Evaluate:
      - Student-program compatibility
      - Skill alignment
      - Learning potential
      - Success probability
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert apprenticeship matching specialist.'
          },
          {
            role: 'user',
            content: apprenticeshipMatchingPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 512
      });

      const aiMatchingInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const apprenticeshipWithInsights = {
        ...validatedApprenticeship,
        status: 'ACTIVE',
        progressPercentage: 0,
        mentorRating: null,
        performanceInsights: aiMatchingInsights
      };

      return await this.prisma.apprenticeship.create({
        data: apprenticeshipWithInsights as any
      });
    } catch (error) {
      console.error('Apprenticeship Initiation Error:', error);
      throw error;
    }
  }

  // Assess Apprenticeship Skills
  async assessApprenticeshipSkills(
    skillAssessmentData: z.infer<typeof ApprenticeshipSkillAssessmentSchema>
  ) {
    const validatedSkillAssessment = ApprenticeshipSkillAssessmentSchema.parse(
      skillAssessmentData
    );

    // AI-Enhanced Skill Assessment
    const skillAssessmentPrompt = `
      Analyze skill development:
      
      Skill Details:
      - Skill Name: ${validatedSkillAssessment.skillName}
      - Initial Level: ${validatedSkillAssessment.initialProficiencyLevel}
      - Current Level: ${validatedSkillAssessment.currentProficiencyLevel}
      
      Evaluate:
      - Skill improvement rate
      - Learning efficiency
      - Potential learning paths
      - Skill mastery recommendations
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert skill development analyst.'
          },
          {
            role: 'user',
            content: skillAssessmentPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 512
      });

      const aiSkillInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const skillAssessmentWithInsights = {
        ...validatedSkillAssessment,
        improvementRate: 
          this.calculateImprovementRate(
            validatedSkillAssessment.initialProficiencyLevel, 
            validatedSkillAssessment.currentProficiencyLevel
          ),
        timeToMastery: aiSkillInsights.estimatedTimeToMastery,
        learningRecommendations: 
          aiSkillInsights.learningRecommendations || []
      };

      return await this.prisma.apprenticeshipSkillAssessment.create({
        data: skillAssessmentWithInsights as any
      });
    } catch (error) {
      console.error('Apprenticeship Skill Assessment Error:', error);
      throw error;
    }
  }

  // Create Apprenticeship Project
  async createApprenticeshipProject(
    projectData: z.infer<typeof ApprenticeshipProjectSchema>
  ) {
    const validatedProject = ApprenticeshipProjectSchema.parse(projectData);

    // AI-Enhanced Project Design
    const projectDesignPrompt = `
      Design comprehensive apprenticeship project:
      
      Project Details:
      - Title: ${validatedProject.title}
      - Skills Applied: ${validatedProject.skillsApplied.join(', ')}
      
      Analyze and recommend:
      - Project complexity
      - Skill application strategy
      - Learning potential
      - Performance expectations
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert apprenticeship project designer.'
          },
          {
            role: 'user',
            content: projectDesignPrompt
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
        status: 'IN_PROGRESS',
        completionPercentage: 0,
        projectInsights: aiProjectInsights
      };

      return await this.prisma.apprenticeshipProject.create({
        data: projectWithInsights as any
      });
    } catch (error) {
      console.error('Apprenticeship Project Creation Error:', error);
      throw error;
    }
  }

  // Update Apprenticeship Project Progress
  async updateApprenticeshipProjectProgress(
    projectId: string, 
    progressData: {
      completionPercentage: number;
      mentorEvaluation?: string;
    }
  ) {
    try {
      const updatedProject = await this.prisma.apprenticeshipProject.update({
        where: { id: projectId },
        data: {
          completionPercentage: progressData.completionPercentage,
          mentorEvaluation: progressData.mentorEvaluation,
          status: progressData.completionPercentage === 100 
            ? 'COMPLETED' 
            : 'IN_PROGRESS'
        }
      });

      // AI Performance Scoring
      const performanceScoringPrompt = `
        Evaluate project performance:
        
        Project Details:
        - Completion Percentage: ${progressData.completionPercentage}%
        - Mentor Evaluation: ${progressData.mentorEvaluation || 'N/A'}
        
        Generate:
        - Performance score
        - Skill application effectiveness
        - Learning achievement
      `;

      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project performance evaluator.'
          },
          {
            role: 'user',
            content: performanceScoringPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 512
      });

      const aiPerformanceInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      return await this.prisma.apprenticeshipProject.update({
        where: { id: projectId },
        data: {
          performanceScore: aiPerformanceInsights.performanceScore,
          projectInsights: aiPerformanceInsights
        }
      });
    } catch (error) {
      console.error('Apprenticeship Project Progress Update Error:', error);
      throw error;
    }
  }

  // Helper method to calculate skill improvement rate
  private calculateImprovementRate(
    initialLevel: string, 
    currentLevel: string
  ): number {
    const levelOrder = [
      'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'
    ];

    const initialIndex = levelOrder.indexOf(initialLevel);
    const currentIndex = levelOrder.indexOf(currentLevel);

    return ((currentIndex - initialIndex) / (levelOrder.length - 1)) * 100;
  }
}
