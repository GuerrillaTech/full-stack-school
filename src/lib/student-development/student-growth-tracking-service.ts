import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';

// Comprehensive Growth Tracking Enums
export enum GrowthDimension {
  ACADEMIC = 'ACADEMIC',
  SOCIAL_EMOTIONAL = 'SOCIAL_EMOTIONAL',
  EXTRACURRICULAR = 'EXTRACURRICULAR',
  PERSONAL_DEVELOPMENT = 'PERSONAL_DEVELOPMENT',
  CAREER_READINESS = 'CAREER_READINESS'
}

export enum ProgressStatus {
  EXCEEDING_EXPECTATIONS = 'EXCEEDING_EXPECTATIONS',
  ON_TRACK = 'ON_TRACK',
  NEEDS_SUPPORT = 'NEEDS_SUPPORT',
  AT_RISK = 'AT_RISK'
}

// Zod Schemas for Type Safety and Validation
const GrowthMetricSchema = z.object({
  dimension: z.nativeEnum(GrowthDimension),
  score: z.number().min(0).max(100),
  status: z.nativeEnum(ProgressStatus),
  trend: z.enum(['IMPROVING', 'STABLE', 'DECLINING']),
  lastAssessmentDate: z.date()
});

const StudentGrowthProfileSchema = z.object({
  studentId: z.string(),
  metrics: z.array(GrowthMetricSchema),
  overallProgressScore: z.number().min(0).max(100),
  developmentPotential: z.number().min(0).max(100),
  recommendedInterventions: z.array(z.string()),
  historicalTrends: z.record(z.nativeEnum(GrowthDimension), z.array(z.number()))
});

export class StudentGrowthTrackingService {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
  }

  // Comprehensive Growth Profile Generation
  async generateStudentGrowthProfile(
    studentId: string
  ): Promise<z.infer<typeof StudentGrowthProfileSchema>> {
    // Fetch comprehensive student data
    const studentData = await this.fetchStudentComprehensiveData(studentId);

    // Calculate Growth Metrics
    const growthMetrics = await this.calculateGrowthMetrics(studentData);

    // Calculate Overall Progress Score
    const overallProgressScore = this.calculateOverallProgressScore(growthMetrics);

    // Assess Development Potential
    const developmentPotential = this.assessDevelopmentPotential(
      growthMetrics, 
      studentData
    );

    // Generate AI-Powered Recommendations
    const recommendedInterventions = await this.generateRecommendations(
      studentId, 
      growthMetrics
    );

    // Construct Historical Trends
    const historicalTrends = await this.constructHistoricalTrends(studentId);

    // Validate and Return Growth Profile
    return StudentGrowthProfileSchema.parse({
      studentId,
      metrics: growthMetrics,
      overallProgressScore,
      developmentPotential,
      recommendedInterventions,
      historicalTrends
    });
  }

  // Comprehensive Student Data Retrieval
  private async fetchStudentComprehensiveData(studentId: string) {
    return this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        academicRecords: {
          orderBy: { date: 'desc' },
          take: 10
        },
        extracurricularActivities: true,
        behaviorRecords: {
          orderBy: { date: 'desc' },
          take: 10
        },
        interventionStrategies: true,
        mlSupportModels: true
      }
    });
  }

  // Multi-Dimensional Growth Metrics Calculation
  private async calculateGrowthMetrics(
    studentData: any
  ): Promise<z.infer<typeof GrowthMetricSchema>[]> {
    const metrics: z.infer<typeof GrowthMetricSchema>[] = [];

    // Academic Dimension
    const academicMetric = this.calculateAcademicGrowth(studentData);
    metrics.push(academicMetric);

    // Social-Emotional Dimension
    const socialEmotionalMetric = this.calculateSocialEmotionalGrowth(studentData);
    metrics.push(socialEmotionalMetric);

    // Extracurricular Dimension
    const extracurricularMetric = this.calculateExtracurricularGrowth(studentData);
    metrics.push(extracurricularMetric);

    // Personal Development Dimension
    const personalDevelopmentMetric = this.calculatePersonalDevelopmentGrowth(studentData);
    metrics.push(personalDevelopmentMetric);

    // Career Readiness Dimension
    const careerReadinessMetric = this.calculateCareerReadinessGrowth(studentData);
    metrics.push(careerReadinessMetric);

    return metrics;
  }

  // Specific Growth Dimension Calculators
  private calculateAcademicGrowth(studentData: any): z.infer<typeof GrowthMetricSchema> {
    const gpaHistory = studentData.academicRecords.map((record: any) => record.gpa);
    const currentGPA = gpaHistory[0] || 0;
    const trend = this.determineTrend(gpaHistory);

    return {
      dimension: GrowthDimension.ACADEMIC,
      score: currentGPA * 25, // Convert GPA to 0-100 scale
      status: this.determineProgressStatus(currentGPA),
      trend,
      lastAssessmentDate: new Date()
    };
  }

  private calculateSocialEmotionalGrowth(studentData: any): z.infer<typeof GrowthMetricSchema> {
    const behaviorScores = studentData.behaviorRecords.map(
      (record: any) => record.socialEmotionalScore
    );
    const currentScore = behaviorScores[0] || 50;
    const trend = this.determineTrend(behaviorScores);

    return {
      dimension: GrowthDimension.SOCIAL_EMOTIONAL,
      score: currentScore,
      status: this.determineProgressStatus(currentScore / 100),
      trend,
      lastAssessmentDate: new Date()
    };
  }

  private calculateExtracurricularGrowth(studentData: any): z.infer<typeof GrowthMetricSchema> {
    const activitiesCount = studentData.extracurricularActivities.length;
    const score = Math.min(activitiesCount * 20, 100); // Max 100

    return {
      dimension: GrowthDimension.EXTRACURRICULAR,
      score,
      status: this.determineProgressStatus(score / 100),
      trend: 'STABLE',
      lastAssessmentDate: new Date()
    };
  }

  private calculatePersonalDevelopmentGrowth(studentData: any): z.infer<typeof GrowthMetricSchema> {
    // Placeholder implementation
    const score = 75; // Example score

    return {
      dimension: GrowthDimension.PERSONAL_DEVELOPMENT,
      score,
      status: this.determineProgressStatus(score / 100),
      trend: 'IMPROVING',
      lastAssessmentDate: new Date()
    };
  }

  private calculateCareerReadinessGrowth(studentData: any): z.infer<typeof GrowthMetricSchema> {
    // Placeholder implementation
    const score = 60; // Example score

    return {
      dimension: GrowthDimension.CAREER_READINESS,
      score,
      status: this.determineProgressStatus(score / 100),
      trend: 'IMPROVING',
      lastAssessmentDate: new Date()
    };
  }

  // Utility Methods
  private determineProgressStatus(
    score: number
  ): ProgressStatus {
    if (score >= 0.9) return ProgressStatus.EXCEEDING_EXPECTATIONS;
    if (score >= 0.7) return ProgressStatus.ON_TRACK;
    if (score >= 0.5) return ProgressStatus.NEEDS_SUPPORT;
    return ProgressStatus.AT_RISK;
  }

  private determineTrend(values: number[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    if (values.length < 2) return 'STABLE';

    const [latest, previous] = values.slice(0, 2);
    const difference = latest - previous;

    if (difference > 0.1) return 'IMPROVING';
    if (difference < -0.1) return 'DECLINING';
    return 'STABLE';
  }

  // Overall Progress Score Calculation
  private calculateOverallProgressScore(
    metrics: z.infer<typeof GrowthMetricSchema>[]
  ): number {
    const weightedScores = metrics.map(metric => {
      let weight = 1;
      switch (metric.dimension) {
        case GrowthDimension.ACADEMIC:
          weight = 0.4;
          break;
        case GrowthDimension.SOCIAL_EMOTIONAL:
          weight = 0.2;
          break;
        case GrowthDimension.EXTRACURRICULAR:
          weight = 0.1;
          break;
        case GrowthDimension.PERSONAL_DEVELOPMENT:
          weight = 0.15;
          break;
        case GrowthDimension.CAREER_READINESS:
          weight = 0.15;
          break;
      }
      return metric.score * weight;
    });

    return Math.min(
      weightedScores.reduce((a, b) => a + b, 0), 
      100
    );
  }

  // Development Potential Assessment
  private assessDevelopmentPotential(
    metrics: z.infer<typeof GrowthMetricSchema>[],
    studentData: any
  ): number {
    const mlSupportModels = studentData.mlSupportModels || [];
    const interventionStrategies = studentData.interventionStrategies || [];

    // Base potential calculation from metrics
    const baseScore = metrics.reduce(
      (total, metric) => total + (metric.status === ProgressStatus.EXCEEDING_EXPECTATIONS ? 20 : 0), 
      0
    );

    // Additional factors
    const mlModelBonus = mlSupportModels.length * 5;
    const interventionBonus = interventionStrategies.length * 3;

    return Math.min(baseScore + mlModelBonus + interventionBonus, 100);
  }

  // AI-Powered Recommendations Generation
  private async generateRecommendations(
    studentId: string, 
    metrics: z.infer<typeof GrowthMetricSchema>[]
  ): Promise<string[]> {
    const needsSupportMetrics = metrics.filter(
      metric => metric.status === ProgressStatus.NEEDS_SUPPORT
    );

    const recommendationPrompt = `
      Student Metrics Requiring Support:
      ${needsSupportMetrics.map(metric => 
        `- ${metric.dimension}: Current Status ${metric.status}`
      ).join('\n')}

      Generate 3-5 personalized, actionable intervention recommendations.
      Format as a JSON array of strings.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert student development strategist.'
          },
          {
            role: 'user',
            content: recommendationPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 256
      });

      const recommendations = JSON.parse(
        response.choices[0].message.content || '[]'
      );

      return recommendations;
    } catch (error) {
      console.error('Recommendation Generation Error:', error);
      return [
        'Schedule personalized academic counseling',
        'Develop targeted skill enhancement plan',
        'Explore additional support resources'
      ];
    }
  }

  // Historical Trends Construction
  private async constructHistoricalTrends(
    studentId: string
  ): Promise<Record<GrowthDimension, number[]>> {
    const historicalRecords = await this.prisma.studentGrowthRecord.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 12 // Last 12 months/records
    });

    const trends: Record<GrowthDimension, number[]> = {
      [GrowthDimension.ACADEMIC]: [],
      [GrowthDimension.SOCIAL_EMOTIONAL]: [],
      [GrowthDimension.EXTRACURRICULAR]: [],
      [GrowthDimension.PERSONAL_DEVELOPMENT]: [],
      [GrowthDimension.CAREER_READINESS]: []
    };

    historicalRecords.forEach(record => {
      Object.values(GrowthDimension).forEach(dimension => {
        trends[dimension].push(record[dimension + 'Score'] || 0);
      });
    });

    return trends;
  }

  // Longitudinal Growth Analysis
  async analyzeLongitudinalGrowth(
    studentId: string, 
    timeframe: number = 12
  ) {
    const growthProfile = await this.generateStudentGrowthProfile(studentId);
    const historicalTrends = growthProfile.historicalTrends;

    // Advanced trend analysis
    const trendAnalysis = Object.entries(historicalTrends).map(
      ([dimension, scores]) => ({
        dimension,
        averageScore: this.calculateMovingAverage(scores),
        volatility: this.calculateVolatility(scores),
        overallTrend: this.identifyOverallTrend(scores)
      })
    );

    return {
      growthProfile,
      trendAnalysis
    };
  }

  // Utility Analysis Methods
  private calculateMovingAverage(scores: number[], window: number = 3): number {
    if (scores.length < window) return scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const movingAverages = [];
    for (let i = 0; i <= scores.length - window; i++) {
      const windowSlice = scores.slice(i, i + window);
      movingAverages.push(
        windowSlice.reduce((a, b) => a + b, 0) / window
      );
    }
    return movingAverages[movingAverages.length - 1];
  }

  private calculateVolatility(scores: number[]): number {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    return Math.sqrt(variance);
  }

  private identifyOverallTrend(scores: number[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    const startAverage = this.calculateMovingAverage(scores.slice(0, 3));
    const endAverage = this.calculateMovingAverage(scores.slice(-3));

    const difference = endAverage - startAverage;
    if (difference > 5) return 'IMPROVING';
    if (difference < -5) return 'DECLINING';
    return 'STABLE';
  }
}
