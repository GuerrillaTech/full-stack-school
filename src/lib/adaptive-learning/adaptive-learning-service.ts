import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { MachineLearningService } from '../ml-support/ml-support-modeling-service';
import { AssessmentInfrastructureService } from '../assessment/assessment-infrastructure-service';

// Adaptive Learning Enums
export enum LearningPathType {
  ACADEMIC_ENRICHMENT = 'ACADEMIC_ENRICHMENT',
  SKILL_DEVELOPMENT = 'SKILL_DEVELOPMENT',
  CAREER_PREPARATION = 'CAREER_PREPARATION',
  PERSONAL_GROWTH = 'PERSONAL_GROWTH'
}

export enum LearningStyle {
  VISUAL = 'VISUAL',
  AUDITORY = 'AUDITORY',
  KINESTHETIC = 'KINESTHETIC',
  READING_WRITING = 'READING_WRITING'
}

export enum LearningProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  MASTERED = 'MASTERED',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT'
}

// Zod Schemas for Type Safety
const LearningResourceSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  type: z.enum(['VIDEO', 'ARTICLE', 'INTERACTIVE', 'PODCAST', 'BOOK']),
  url: z.string().url(),
  
  // Learning Metadata
  subject: z.string(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  learningObjectives: z.array(z.string()),
  
  // Personalization Parameters
  recommendationScore: z.number().min(0).max(1).optional(),
  learningStyles: z.array(z.nativeEnum(LearningStyle)).optional(),
  
  // Engagement Metrics
  averageCompletionTime: z.number().optional(),
  userRating: z.number().min(0).max(5).optional()
});

const LearningPathSchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  
  // Path Configuration
  type: z.nativeEnum(LearningPathType),
  title: z.string(),
  description: z.string().optional(),
  
  // Learning Objectives
  primaryObjective: z.string(),
  secondaryObjectives: z.array(z.string()).optional(),
  
  // Path Composition
  learningResources: z.array(LearningResourceSchema),
  
  // Personalization Metrics
  learningStyle: z.nativeEnum(LearningStyle),
  personalizedRecommendationFactor: z.number().min(0).max(1),
  
  // Progress Tracking
  startDate: z.date(),
  expectedCompletionDate: z.date(),
  actualCompletionDate: z.date().optional(),
  
  // Performance and Progress
  progressStatus: z.nativeEnum(LearningProgressStatus),
  completionPercentage: z.number().min(0).max(100),
  
  // AI and ML Insights
  aiGeneratedInsights: z.object({
    strengthAreas: z.array(z.string()),
    improvementAreas: z.array(z.string()),
    recommendedInterventions: z.array(z.string())
  }).optional()
});

export class AdaptiveLearningService {
  private prisma: PrismaClient;
  private openai: OpenAI;
  private mlService: MachineLearningService;
  private assessmentService: AssessmentInfrastructureService;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
    this.mlService = new MachineLearningService();
    this.assessmentService = new AssessmentInfrastructureService();
  }

  // Generate Personalized Learning Path
  async generateLearningPath(
    studentId: string,
    pathType: LearningPathType
  ): Promise<z.infer<typeof LearningPathSchema>> {
    // Retrieve student profile and performance data
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        studentGrowthProfile: true,
        assessmentResults: true,
        mlSupportModels: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Determine Learning Style and Recommendation Factor
    const learningStyle = await this.determineLearningStyle(student);
    const recommendationFactor = await this.calculatePersonalizationFactor(student);

    // AI-Powered Learning Path Generation
    const learningPathPrompt = `
      Generate a personalized learning path for a student:
      
      Student Profile:
      - Learning Style: ${learningStyle}
      - Path Type: ${pathType}
      
      Recent Performance:
      ${student.assessmentResults.map(result => 
        `Assessment: ${result.assessment.title}, Score: ${result.percentageScore}`
      ).join('\n')}
      
      Generate a comprehensive learning path with:
      - Tailored learning resources
      - Adaptive difficulty progression
      - Engagement-focused recommendations
      - Clear learning objectives
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert personalized learning path designer.'
          },
          {
            role: 'user',
            content: learningPathPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2048
      });

      const generatedLearningPath = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      // Validate and enhance learning path
      const validatedLearningPath = LearningPathSchema.parse({
        studentId,
        type: pathType,
        learningStyle,
        personalizedRecommendationFactor: recommendationFactor,
        startDate: new Date(),
        expectedCompletionDate: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 days
        ),
        progressStatus: LearningProgressStatus.NOT_STARTED,
        completionPercentage: 0,
        ...generatedLearningPath
      });

      // Save learning path to database
      const savedLearningPath = await this.prisma.learningPath.create({
        data: validatedLearningPath as any
      });

      return savedLearningPath;
    } catch (error) {
      console.error('Learning Path Generation Error:', error);
      throw error;
    }
  }

  // Determine Student's Learning Style
  private async determineLearningStyle(student: any): Promise<LearningStyle> {
    const learningStylePrompt = `
      Analyze student's learning characteristics and determine primary learning style:
      
      Student Assessment History:
      ${student.assessmentResults.map(result => 
        `Assessment: ${result.assessment.title}, Performance: ${result.performanceLevel}`
      ).join('\n')}
      
      Student Growth Profile:
      ${JSON.stringify(student.studentGrowthProfile)}
      
      Identify the most suitable learning style: 
      VISUAL, AUDITORY, KINESTHETIC, or READING_WRITING
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational psychologist specializing in learning styles.'
          },
          {
            role: 'user',
            content: learningStylePrompt
          }
        ],
        temperature: 0.6,
        max_tokens: 128
      });

      const learningStyle = aiResponse.choices[0].message.content?.trim() as LearningStyle;
      return Object.values(LearningStyle).includes(learningStyle) 
        ? learningStyle 
        : LearningStyle.VISUAL; // Default
    } catch (error) {
      console.error('Learning Style Determination Error:', error);
      return LearningStyle.VISUAL; // Default
    }
  }

  // Calculate Personalization Recommendation Factor
  private async calculatePersonalizationFactor(student: any): Promise<number> {
    // ML-Powered Personalization Calculation
    const personalizationFactors = await this.mlService.predictPersonalizationFactor(
      student
    );

    // Combine multiple personalization signals
    const recommendationFactor = 
      (personalizationFactors.assessmentPerformance +
       personalizationFactors.growthPotential +
       personalizationFactors.learningAgility) / 3;

    return recommendationFactor;
  }

  // Track and Update Learning Path Progress
  async updateLearningPathProgress(
    learningPathId: string,
    progressData: {
      completedResources?: string[];
      performanceMetrics?: any;
    }
  ): Promise<z.infer<typeof LearningPathSchema>> {
    const learningPath = await this.prisma.learningPath.findUnique({
      where: { id: learningPathId }
    });

    if (!learningPath) {
      throw new Error('Learning Path not found');
    }

    // Calculate progress and generate insights
    const updatedLearningPath = await this.calculateLearningPathProgress(
      learningPath, 
      progressData
    );

    // Update learning path in database
    const savedLearningPath = await this.prisma.learningPath.update({
      where: { id: learningPathId },
      data: updatedLearningPath as any
    });

    return savedLearningPath;
  }

  // Calculate Learning Path Progress and Insights
  private async calculateLearningPathProgress(
    learningPath: any, 
    progressData: any
  ): Promise<any> {
    const progressPrompt = `
      Analyze learning path progress and generate insights:
      
      Current Learning Path:
      ${JSON.stringify(learningPath)}
      
      Progress Data:
      ${JSON.stringify(progressData)}
      
      Generate:
      - Updated completion percentage
      - Progress status
      - AI-powered learning insights
      - Recommended next steps
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning progress analyst.'
          },
          {
            role: 'user',
            content: progressPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 1024
      });

      const progressInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      return {
        ...learningPath,
        ...progressInsights,
        completionPercentage: progressInsights.completionPercentage || 
          learningPath.completionPercentage,
        progressStatus: progressInsights.progressStatus || 
          learningPath.progressStatus,
        aiGeneratedInsights: progressInsights.aiGeneratedInsights
      };
    } catch (error) {
      console.error('Learning Path Progress Calculation Error:', error);
      return learningPath;
    }
  }

  // Recommend Additional Learning Resources
  async recommendLearningResources(
    studentId: string,
    currentLearningPath: z.infer<typeof LearningPathSchema>
  ): Promise<z.infer<typeof LearningResourceSchema>[]> {
    const resourceRecommendationPrompt = `
      Recommend additional learning resources for a student:
      
      Current Learning Path:
      ${JSON.stringify(currentLearningPath)}
      
      Recommendation Criteria:
      - Complement existing learning resources
      - Match student's learning style
      - Address potential learning gaps
      - Provide diverse learning experiences
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational resource curator.'
          },
          {
            role: 'user',
            content: resourceRecommendationPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const recommendedResources = JSON.parse(
        aiResponse.choices[0].message.content || '[]'
      );

      // Validate recommended resources
      return recommendedResources.map((resource: any) => 
        LearningResourceSchema.parse({
          ...resource,
          recommendationScore: Math.random(),
          learningStyles: [currentLearningPath.learningStyle]
        })
      );
    } catch (error) {
      console.error('Learning Resource Recommendation Error:', error);
      return [];
    }
  }
}
