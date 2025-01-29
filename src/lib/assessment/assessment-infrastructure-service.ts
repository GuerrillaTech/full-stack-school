import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { MachineLearningService } from '../ml-support/ml-support-modeling-service';

// Assessment Enums
export enum AssessmentType {
  DIAGNOSTIC = 'DIAGNOSTIC',
  FORMATIVE = 'FORMATIVE',
  SUMMATIVE = 'SUMMATIVE',
  PERFORMANCE_BASED = 'PERFORMANCE_BASED',
  ADAPTIVE = 'ADAPTIVE'
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum LearningDomain {
  COGNITIVE = 'COGNITIVE',
  AFFECTIVE = 'AFFECTIVE',
  PSYCHOMOTOR = 'PSYCHOMOTOR',
  METACOGNITIVE = 'METACOGNITIVE'
}

// Zod Schemas for Type Safety
const AssessmentItemSchema = z.object({
  id: z.string().optional(),
  questionText: z.string(),
  type: z.nativeEnum(AssessmentType),
  difficultyLevel: z.nativeEnum(DifficultyLevel),
  learningDomain: z.nativeEnum(LearningDomain),
  
  // Question Metadata
  subject: z.string(),
  topic: z.string(),
  learningObjective: z.string(),
  
  // Scoring and Evaluation
  maxScore: z.number().min(0),
  scoringRubric: z.record(z.string(), z.number()),
  
  // AI and Adaptive Parameters
  aiGeneratedDistractors: z.array(z.string()).optional(),
  adaptiveParameters: z.object({
    complexityFactor: z.number().min(0).max(1),
    learnerProfileWeight: z.number().min(0).max(1)
  }).optional(),
  
  // Multimedia and Interaction
  multimedia: z.object({
    type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'INTERACTIVE']).optional(),
    url: z.string().optional(),
    description: z.string().optional()
  }).optional()
});

const AssessmentSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  
  // Assessment Configuration
  type: z.nativeEnum(AssessmentType),
  subject: z.string(),
  learningObjectives: z.array(z.string()),
  
  // Temporal and Access Control
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  duration: z.number().min(0).optional(),
  
  // Adaptive and Personalization
  adaptiveMode: z.boolean().default(false),
  personalizationLevel: z.number().min(0).max(1).default(0.5),
  
  // Assessment Items
  assessmentItems: z.array(AssessmentItemSchema),
  
  // Scoring and Evaluation
  scoringMethod: z.enum(['PERCENTAGE', 'POINTS', 'RUBRIC']),
  passingThreshold: z.number().min(0).max(100),
  
  // Metadata and Tracking
  createdBy: z.string(),
  tags: z.array(z.string()).optional()
});

export class AssessmentInfrastructureService {
  private prisma: PrismaClient;
  private openai: OpenAI;
  private mlService: MachineLearningService;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
    this.mlService = new MachineLearningService();
  }

  // Create Adaptive Assessment
  async createAdaptiveAssessment(
    assessmentData: z.infer<typeof AssessmentSchema>
  ): Promise<z.infer<typeof AssessmentSchema>> {
    // Validate input
    const validatedAssessment = AssessmentSchema.parse(assessmentData);

    // AI-Enhanced Assessment Item Generation
    const enhancedAssessmentItems = await this.generateAIAssessmentItems(
      validatedAssessment
    );

    // Update assessment items with AI-generated content
    validatedAssessment.assessmentItems = enhancedAssessmentItems;

    // Create assessment in database
    const assessment = await this.prisma.assessment.create({
      data: validatedAssessment as any
    });

    return assessment;
  }

  // AI-Powered Assessment Item Generation
  private async generateAIAssessmentItems(
    assessment: z.infer<typeof AssessmentSchema>
  ): Promise<z.infer<typeof AssessmentItemSchema>[]> {
    const itemGenerationPrompt = `
      Generate adaptive assessment items for:
      Subject: ${assessment.subject}
      Learning Objectives: ${assessment.learningObjectives.join(', ')}
      
      Assessment Type: ${assessment.type}
      Personalization Level: ${assessment.personalizationLevel}
      
      Generate ${assessment.assessmentItems.length} unique, challenging, 
      and contextually relevant assessment items with:
      - Varied difficulty levels
      - Multiple learning domains
      - Engaging multimedia elements
      - AI-generated distractors
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational assessment designer.'
          },
          {
            role: 'user',
            content: itemGenerationPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2048
      });

      const generatedItems = JSON.parse(
        aiResponse.choices[0].message.content || '[]'
      );

      // Validate and enhance generated items
      return generatedItems.map((item: any) => 
        AssessmentItemSchema.parse({
          ...item,
          adaptiveParameters: {
            complexityFactor: Math.random(),
            learnerProfileWeight: assessment.personalizationLevel
          }
        })
      );
    } catch (error) {
      console.error('Assessment Item Generation Error:', error);
      return assessment.assessmentItems;
    }
  }

  // Adaptive Assessment Execution
  async executeAdaptiveAssessment(
    assessmentId: string, 
    studentId: string
  ): Promise<{
    assessmentResults: any;
    personalizedFeedback: string;
    recommendedLearningPath: any;
  }> {
    // Retrieve assessment and student details
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { assessmentItems: true }
    });

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { 
        studentGrowthProfile: true,
        mlSupportModels: true 
      }
    });

    if (!assessment || !student) {
      throw new Error('Assessment or Student not found');
    }

    // ML-Powered Assessment Execution
    const assessmentResults = await this.mlService.predictAssessmentPerformance(
      assessment, 
      student
    );

    // AI-Generated Personalized Feedback
    const personalizedFeedback = await this.generatePersonalizedFeedback(
      assessment, 
      student, 
      assessmentResults
    );

    // Recommended Learning Path
    const recommendedLearningPath = await this.generateRecommendedLearningPath(
      student, 
      assessmentResults
    );

    return {
      assessmentResults,
      personalizedFeedback,
      recommendedLearningPath
    };
  }

  // Generate Personalized Feedback
  private async generatePersonalizedFeedback(
    assessment: any, 
    student: any, 
    assessmentResults: any
  ): Promise<string> {
    const feedbackPrompt = `
      Generate personalized, constructive, and motivational feedback for a student:
      
      Assessment: ${assessment.title}
      Student Performance: ${JSON.stringify(assessmentResults)}
      
      Provide:
      - Specific strengths and areas for improvement
      - Learning strategy recommendations
      - Motivational insights
      - Growth mindset encouragement
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate and insightful educational coach.'
          },
          {
            role: 'user',
            content: feedbackPrompt
          }
        ],
        temperature: 0.6,
        max_tokens: 512
      });

      return aiResponse.choices[0].message.content || '';
    } catch (error) {
      console.error('Personalized Feedback Generation Error:', error);
      return 'Great effort! Keep learning and growing.';
    }
  }

  // Generate Recommended Learning Path
  private async generateRecommendedLearningPath(
    student: any, 
    assessmentResults: any
  ): Promise<any> {
    const learningPathPrompt = `
      Design a personalized learning path based on:
      
      Student Profile: ${JSON.stringify(student.studentGrowthProfile)}
      Assessment Performance: ${JSON.stringify(assessmentResults)}
      
      Generate:
      - Targeted learning resources
      - Skill development recommendations
      - Intervention strategies
      - Motivational milestones
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
        max_tokens: 1024
      });

      return JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );
    } catch (error) {
      console.error('Learning Path Generation Error:', error);
      return {};
    }
  }

  // Advanced Analytics and Insights
  async generateAssessmentInsights(
    assessmentId: string
  ): Promise<{
    overallPerformance: any;
    learningGapAnalysis: any;
    recommendedInterventions: any[];
  }> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { 
        assessmentItems: true,
        studentResults: true 
      }
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    const insightsPrompt = `
      Perform comprehensive assessment insights analysis:
      
      Assessment: ${assessment.title}
      Total Students: ${assessment.studentResults.length}
      
      Generate:
      - Overall performance metrics
      - Learning gap identification
      - Targeted intervention recommendations
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational data analyst.'
          },
          {
            role: 'user',
            content: insightsPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 1024
      });

      return JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );
    } catch (error) {
      console.error('Assessment Insights Generation Error:', error);
      return {
        overallPerformance: {},
        learningGapAnalysis: {},
        recommendedInterventions: []
      };
    }
  }
}
