import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { EarlyWarningService, RiskCategory, InterventionPriority } from '@/lib/intervention/early-warning-service';

export enum PredictionConfidence {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface RiskPrediction {
  studentId: string;
  riskCategory: RiskCategory;
  predictionScore: number;
  confidenceLevel: PredictionConfidence;
  predictedOutcome: string;
  contributingFactors: string[];
  recommendedPreventiveActions: string[];
}

export class RiskPredictionService {
  private prisma: PrismaClient;
  private openai: OpenAI;
  private earlyWarningService: EarlyWarningService;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
    this.earlyWarningService = new EarlyWarningService();
  }

  // Comprehensive Predictive Risk Analysis
  async predictStudentRisks(studentId: string): Promise<RiskPrediction[]> {
    const student = await this.fetchComprehensiveStudentProfile(studentId);

    const predictions: RiskPrediction[] = await Promise.all(
      Object.values(RiskCategory).map(async (category) => {
        return this.generateRiskPrediction(student, category);
      })
    );

    // Save predictions for tracking
    await this.saveRiskPredictions(predictions);

    return predictions.filter(prediction => prediction.predictionScore > 0.5);
  }

  // Advanced Machine Learning Risk Prediction
  private async generateRiskPrediction(
    student: any, 
    riskCategory: RiskCategory
  ): Promise<RiskPrediction> {
    try {
      const predictionPrompt = this.constructPredictionPrompt(student, riskCategory);

      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an advanced AI risk prediction model for student success. 
            Analyze student data and provide a comprehensive risk assessment with high precision.`
          },
          {
            role: 'user',
            content: predictionPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 1024
      });

      const predictionData = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      return {
        studentId: student.id,
        riskCategory,
        predictionScore: predictionData.predictionScore || 0,
        confidenceLevel: this.determineConfidenceLevel(predictionData.predictionScore),
        predictedOutcome: predictionData.predictedOutcome || 'Unknown',
        contributingFactors: predictionData.contributingFactors || [],
        recommendedPreventiveActions: predictionData.recommendedPreventiveActions || []
      };
    } catch (error) {
      console.error(`Risk prediction error for ${riskCategory}:`, error);
      return {
        studentId: student.id,
        riskCategory,
        predictionScore: 0,
        confidenceLevel: PredictionConfidence.LOW,
        predictedOutcome: 'Inconclusive',
        contributingFactors: [],
        recommendedPreventiveActions: []
      };
    }
  }

  // Construct detailed prediction prompt
  private constructPredictionPrompt(student: any, riskCategory: RiskCategory): string {
    return `
      Student Profile for Risk Prediction:
      
      Basic Information:
      - Student ID: ${student.id}
      - Grade Level: ${student.gradeLevel}
      - Academic Performance: ${JSON.stringify(student.academicRecords)}

      Risk Category: ${riskCategory}

      Contextual Data:
      ${this.extractContextualData(student, riskCategory)}

      Prediction Request:
      Generate a comprehensive risk prediction with the following details:
      1. Prediction Score (0.0-1.0)
      2. Predicted Outcome
      3. Contributing Factors
      4. Recommended Preventive Actions

      Response Format (JSON):
      {
        "predictionScore": 0.0-1.0,
        "predictedOutcome": "String description",
        "contributingFactors": ["factor1", "factor2"],
        "recommendedPreventiveActions": ["action1", "action2"]
      }
    `;
  }

  // Extract relevant contextual data based on risk category
  private extractContextualData(student: any, riskCategory: RiskCategory): string {
    switch (riskCategory) {
      case RiskCategory.ACADEMIC:
        return `
          Academic Context:
          - GPA: ${student.academicRecords.gpa}
          - Failed Courses: ${student.academicRecords.failedCourses}
          - Study Habits: ${student.learningProfile.studyHabits}
        `;
      
      case RiskCategory.ATTENDANCE:
        return `
          Attendance Context:
          - Total Absences: ${student.attendanceRecords.totalAbsences}
          - Consecutive Absences: ${student.attendanceRecords.consecutiveAbsences}
          - Absence Patterns: ${student.attendanceRecords.absencePatterns}
        `;
      
      case RiskCategory.BEHAVIORAL:
        return `
          Behavioral Context:
          - Disciplinary Incidents: ${student.behaviorRecords.disciplinaryIncidents}
          - Behavioral Patterns: ${student.behaviorRecords.behavioralPatterns}
          - Peer Interactions: ${student.socialProfile.peerInteractions}
        `;
      
      case RiskCategory.SOCIAL_EMOTIONAL:
        return `
          Social-Emotional Context:
          - Social Engagement Score: ${student.performanceMetrics.socialEngagement}
          - Emotional Well-being Indicators: ${student.mentalHealthProfile.wellbeingIndicators}
        `;
      
      case RiskCategory.FINANCIAL:
        return `
          Financial Context:
          - Financial Stress Level: ${student.financialStatus.stressLevel}
          - Scholarship/Aid Status: ${student.financialStatus.scholarshipStatus}
          - Employment Status: ${student.financialStatus.employmentStatus}
        `;
      
      default:
        return 'No specific contextual data available.';
    }
  }

  // Determine confidence level based on prediction score
  private determineConfidenceLevel(score: number): PredictionConfidence {
    if (score > 0.8) return PredictionConfidence.HIGH;
    if (score > 0.5) return PredictionConfidence.MEDIUM;
    return PredictionConfidence.LOW;
  }

  // Save risk predictions for tracking and analysis
  private async saveRiskPredictions(predictions: RiskPrediction[]) {
    try {
      await this.prisma.riskPrediction.createMany({
        data: predictions.map(prediction => ({
          studentId: prediction.studentId,
          riskCategory: prediction.riskCategory,
          predictionScore: prediction.predictionScore,
          confidenceLevel: prediction.confidenceLevel,
          predictedOutcome: prediction.predictedOutcome,
          contributingFactors: prediction.contributingFactors,
          recommendedPreventiveActions: prediction.recommendedPreventiveActions
        }))
      });
    } catch (error) {
      console.error('Error saving risk predictions:', error);
    }
  }

  // Risk Trend Analysis
  async analyzeRiskTrends(timeframe: number = 12): Promise<any> {
    const riskPredictions = await this.prisma.riskPrediction.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - timeframe))
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Aggregate and analyze risk trends
    const trendAnalysis = {
      overallRiskDistribution: this.calculateRiskDistribution(riskPredictions),
      categoryTrends: this.analyzeCategoryTrends(riskPredictions),
      confidenceLevelBreakdown: this.analyzeConfidenceLevels(riskPredictions)
    };

    return trendAnalysis;
  }

  // Helper methods for trend analysis
  private calculateRiskDistribution(predictions: any[]) {
    const distribution = {};
    predictions.forEach(pred => {
      distribution[pred.riskCategory] = 
        (distribution[pred.riskCategory] || 0) + 1;
    });
    return distribution;
  }

  private analyzeCategoryTrends(predictions: any[]) {
    const categoryTrends = {};
    predictions.forEach(pred => {
      if (!categoryTrends[pred.riskCategory]) {
        categoryTrends[pred.riskCategory] = {
          totalPredictions: 0,
          averagePredictionScore: 0
        };
      }
      
      const category = categoryTrends[pred.riskCategory];
      category.totalPredictions++;
      category.averagePredictionScore += pred.predictionScore;
    });

    // Calculate average scores
    Object.keys(categoryTrends).forEach(category => {
      const trend = categoryTrends[category];
      trend.averagePredictionScore /= trend.totalPredictions;
    });

    return categoryTrends;
  }

  private analyzeConfidenceLevels(predictions: any[]) {
    const confidenceLevels = {
      [PredictionConfidence.LOW]: 0,
      [PredictionConfidence.MEDIUM]: 0,
      [PredictionConfidence.HIGH]: 0
    };

    predictions.forEach(pred => {
      confidenceLevels[pred.confidenceLevel]++;
    });

    return confidenceLevels;
  }
}
