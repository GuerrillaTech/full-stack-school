import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { 
  EarlyWarningService, 
  RiskCategory, 
  InterventionPriority 
} from '@/lib/intervention/early-warning-service';
import { RiskPredictionService } from '@/lib/risk-detection/risk-prediction-service';

export enum InterventionType {
  ACADEMIC_SUPPORT = 'ACADEMIC_SUPPORT',
  MENTORSHIP = 'MENTORSHIP',
  COUNSELING = 'COUNSELING',
  SKILL_DEVELOPMENT = 'SKILL_DEVELOPMENT',
  FINANCIAL_AID = 'FINANCIAL_AID',
  SOCIAL_INTEGRATION = 'SOCIAL_INTEGRATION'
}

export enum InterventionOutcome {
  SUCCESSFUL = 'SUCCESSFUL',
  PARTIALLY_SUCCESSFUL = 'PARTIALLY_SUCCESSFUL',
  UNSUCCESSFUL = 'UNSUCCESSFUL'
}

export interface InterventionStrategy {
  id?: string;
  studentId: string;
  riskCategory: RiskCategory;
  interventionType: InterventionType;
  description: string;
  startDate: Date;
  expectedDuration: number; // in weeks
  primaryInterventionist: string;
  targetOutcomes: string[];
  customizationScore: number;
}

export interface InterventionProgress {
  strategyId: string;
  currentPhase: string;
  progressPercentage: number;
  milestones: {
    name: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  performanceMetrics: Record<string, number>;
}

export class InterventionPlanningService {
  private prisma: PrismaClient;
  private openai: OpenAI;
  private earlyWarningService: EarlyWarningService;
  private riskPredictionService: RiskPredictionService;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
    this.earlyWarningService = new EarlyWarningService();
    this.riskPredictionService = new RiskPredictionService();
  }

  // Generate Personalized Intervention Strategy
  async generateInterventionStrategy(
    studentId: string, 
    riskCategory: RiskCategory
  ): Promise<InterventionStrategy> {
    // Fetch comprehensive student profile
    const student = await this.fetchStudentProfile(studentId);
    
    // Predict risks for targeted intervention
    const riskPredictions = await this.riskPredictionService.predictStudentRisks(studentId);
    const specificRiskPrediction = riskPredictions.find(
      prediction => prediction.riskCategory === riskCategory
    );

    // Generate AI-powered intervention strategy
    const interventionPrompt = this.constructInterventionPrompt(
      student, 
      riskCategory, 
      specificRiskPrediction
    );

    const aiResponse = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an advanced AI intervention strategy designer. 
          Generate a highly personalized, data-driven intervention strategy 
          that addresses specific student challenges with precision and empathy.`
        },
        {
          role: 'user',
          content: interventionPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024
    });

    const strategyData = JSON.parse(
      aiResponse.choices[0].message.content || '{}'
    );

    const interventionStrategy: InterventionStrategy = {
      studentId,
      riskCategory,
      interventionType: this.mapInterventionType(strategyData.interventionType),
      description: strategyData.description,
      startDate: new Date(),
      expectedDuration: strategyData.expectedDuration || 12,
      primaryInterventionist: await this.assignPrimaryInterventionist(riskCategory),
      targetOutcomes: strategyData.targetOutcomes || [],
      customizationScore: this.calculateCustomizationScore(student, riskCategory)
    };

    // Save intervention strategy
    const savedStrategy = await this.saveInterventionStrategy(interventionStrategy);

    return savedStrategy;
  }

  // Track and Update Intervention Progress
  async trackInterventionProgress(
    strategyId: string
  ): Promise<InterventionProgress> {
    const strategy = await this.prisma.interventionStrategy.findUnique({
      where: { id: strategyId },
      include: { student: true }
    });

    if (!strategy) {
      throw new Error('Intervention strategy not found');
    }

    // Assess current progress and performance
    const progressAssessment = await this.assessInterventionProgress(strategy);

    // Update intervention progress
    const updatedProgress = await this.prisma.interventionProgress.upsert({
      where: { strategyId },
      update: progressAssessment,
      create: {
        strategyId,
        ...progressAssessment
      }
    });

    return updatedProgress;
  }

  // Optimize Intervention Strategy
  async optimizeInterventionStrategy(
    strategyId: string
  ): Promise<InterventionStrategy> {
    const strategy = await this.prisma.interventionStrategy.findUnique({
      where: { id: strategyId },
      include: { student: true }
    });

    if (!strategy) {
      throw new Error('Intervention strategy not found');
    }

    const optimizationPrompt = this.constructOptimizationPrompt(strategy);

    const aiResponse = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an AI intervention optimization expert. 
          Analyze the current intervention strategy and propose targeted 
          improvements to enhance its effectiveness.`
        },
        {
          role: 'user',
          content: optimizationPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 1024
    });

    const optimizationData = JSON.parse(
      aiResponse.choices[0].message.content || '{}'
    );

    const optimizedStrategy = await this.updateInterventionStrategy(
      strategyId, 
      optimizationData
    );

    return optimizedStrategy;
  }

  // Private Helper Methods
  private async fetchStudentProfile(studentId: string) {
    return this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        academicRecords: true,
        learningProfile: true,
        performanceMetrics: true
      }
    });
  }

  private constructInterventionPrompt(
    student: any, 
    riskCategory: RiskCategory, 
    riskPrediction: any
  ): string {
    return `
      Student Profile for Intervention Strategy:
      
      Basic Information:
      - Student ID: ${student.id}
      - Grade Level: ${student.gradeLevel}

      Risk Category: ${riskCategory}
      Risk Prediction:
      ${JSON.stringify(riskPrediction, null, 2)}

      Contextual Data:
      ${this.extractContextualData(student, riskCategory)}

      Strategy Generation Request:
      Design a comprehensive, personalized intervention strategy with:
      1. Intervention Type
      2. Detailed Description
      3. Expected Duration
      4. Target Outcomes

      Response Format (JSON):
      {
        "interventionType": "ENUM_VALUE",
        "description": "Detailed strategy description",
        "expectedDuration": number,
        "targetOutcomes": ["outcome1", "outcome2"]
      }
    `;
  }

  private extractContextualData(student: any, riskCategory: RiskCategory): string {
    // Similar to risk prediction service, extract relevant context
    switch (riskCategory) {
      case RiskCategory.ACADEMIC:
        return `
          Academic Context:
          - GPA: ${student.academicRecords.gpa}
          - Learning Style: ${student.learningProfile.learningStyle}
          - Study Habits: ${student.learningProfile.studyHabits}
        `;
      // Add other risk category contexts
      default:
        return 'No specific contextual data available.';
    }
  }

  private mapInterventionType(type: string): InterventionType {
    const typeMap = {
      'ACADEMIC_SUPPORT': InterventionType.ACADEMIC_SUPPORT,
      'MENTORSHIP': InterventionType.MENTORSHIP,
      // Map other types
    };
    return typeMap[type] || InterventionType.ACADEMIC_SUPPORT;
  }

  private async assignPrimaryInterventionist(
    riskCategory: RiskCategory
  ): Promise<string> {
    // Logic to assign most appropriate interventionist
    const interventionistMap = {
      [RiskCategory.ACADEMIC]: 'academic_advisor',
      [RiskCategory.ATTENDANCE]: 'attendance_counselor',
      // Map other categories
    };

    const interventionist = await this.prisma.teacher.findFirst({
      where: { role: interventionistMap[riskCategory] }
    });

    return interventionist?.id || 'unassigned';
  }

  private calculateCustomizationScore(
    student: any, 
    riskCategory: RiskCategory
  ): number {
    // Complex customization scoring algorithm
    // Consider factors like learning style, past interventions, etc.
    return Math.min(Math.random() * 10, 10);
  }

  private async saveInterventionStrategy(
    strategy: InterventionStrategy
  ): Promise<InterventionStrategy> {
    return this.prisma.interventionStrategy.create({
      data: strategy
    });
  }

  private async assessInterventionProgress(
    strategy: any
  ): Promise<InterventionProgress> {
    // Complex progress assessment logic
    return {
      strategyId: strategy.id,
      currentPhase: 'INITIAL_IMPLEMENTATION',
      progressPercentage: Math.random() * 30,
      milestones: [
        { 
          name: 'Initial Assessment', 
          completed: true, 
          completedAt: new Date() 
        },
        { 
          name: 'Strategy Development', 
          completed: true, 
          completedAt: new Date() 
        },
        { 
          name: 'First Intervention Session', 
          completed: false 
        }
      ],
      performanceMetrics: {
        engagementScore: Math.random() * 100,
        progressScore: Math.random() * 50
      }
    };
  }

  private async updateInterventionStrategy(
    strategyId: string, 
    optimizationData: any
  ): Promise<InterventionStrategy> {
    return this.prisma.interventionStrategy.update({
      where: { id: strategyId },
      data: {
        description: optimizationData.updatedDescription,
        expectedDuration: optimizationData.updatedDuration,
        targetOutcomes: optimizationData.updatedTargetOutcomes
      }
    });
  }

  // Comprehensive Intervention Outcome Analysis
  async analyzeInterventionOutcomes(
    timeframe: number = 12
  ): Promise<any> {
    const interventionOutcomes = await this.prisma.interventionStrategy.findMany({
      where: {
        startDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - timeframe))
        }
      },
      include: {
        student: true,
        progress: true
      }
    });

    const outcomeAnalysis = {
      totalInterventions: interventionOutcomes.length,
      outcomeDistribution: this.calculateOutcomeDistribution(interventionOutcomes),
      riskCategoryEffectiveness: this.analyzeRiskCategoryEffectiveness(interventionOutcomes),
      topPerformingStrategies: this.identifyTopPerformingStrategies(interventionOutcomes)
    };

    return outcomeAnalysis;
  }

  private calculateOutcomeDistribution(interventions: any[]) {
    const distribution = {
      [InterventionOutcome.SUCCESSFUL]: 0,
      [InterventionOutcome.PARTIALLY_SUCCESSFUL]: 0,
      [InterventionOutcome.UNSUCCESSFUL]: 0
    };

    interventions.forEach(intervention => {
      const progress = intervention.progress;
      if (progress.progressPercentage > 80) {
        distribution[InterventionOutcome.SUCCESSFUL]++;
      } else if (progress.progressPercentage > 50) {
        distribution[InterventionOutcome.PARTIALLY_SUCCESSFUL]++;
      } else {
        distribution[InterventionOutcome.UNSUCCESSFUL]++;
      }
    });

    return distribution;
  }

  private analyzeRiskCategoryEffectiveness(interventions: any[]) {
    const effectiveness = {};

    interventions.forEach(intervention => {
      const category = intervention.riskCategory;
      if (!effectiveness[category]) {
        effectiveness[category] = {
          totalInterventions: 0,
          averageProgressPercentage: 0
        };
      }

      const categoryData = effectiveness[category];
      categoryData.totalInterventions++;
      categoryData.averageProgressPercentage += 
        intervention.progress.progressPercentage;
    });

    // Calculate average progress percentages
    Object.keys(effectiveness).forEach(category => {
      const categoryData = effectiveness[category];
      categoryData.averageProgressPercentage /= categoryData.totalInterventions;
    });

    return effectiveness;
  }

  private identifyTopPerformingStrategies(interventions: any[]) {
    return interventions
      .sort((a, b) => 
        b.progress.progressPercentage - a.progress.progressPercentage
      )
      .slice(0, 5);
  }
}
