import { 
  LearningInterventionEngine, 
  InterventionType, 
  RiskLevel 
} from './learning-intervention-engine';
import { PrismaClient } from '@prisma/client';

export class LearningInterventionService {
  private interventionEngine: LearningInterventionEngine;
  private prisma: PrismaClient;

  constructor() {
    this.interventionEngine = new LearningInterventionEngine();
    this.prisma = new PrismaClient();
  }

  // Comprehensive Student Support Workflow
  async provideComprehensiveStudentSupport(studentId: string) {
    try {
      // Conduct comprehensive risk assessment
      const riskAssessment = await this.interventionEngine.assessStudentRisk(studentId);

      // Generate intervention plans for different domains
      const interventionPlans = await Promise.all(
        Object.values(InterventionType).map(
          interventionType => this.generateInterventionPlan(
            studentId, 
            interventionType
          )
        )
      );

      // Prioritize and consolidate intervention plans
      const consolidatedInterventionPlan = this.consolidateInterventionPlans(
        interventionPlans, 
        riskAssessment
      );

      return {
        success: true,
        studentId,
        riskAssessment,
        interventionPlans: consolidatedInterventionPlan
      };
    } catch (error) {
      console.error('Comprehensive Student Support Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Targeted Intervention Plan Generation
  async generateInterventionPlan(
    studentId: string, 
    interventionType: InterventionType
  ) {
    try {
      const interventionPlan = await this.interventionEngine.generatePersonalizedInterventionPlan(
        studentId, 
        interventionType
      );

      // Log intervention plan creation
      await this.logInterventionPlanCreation(interventionPlan);

      return {
        success: true,
        interventionPlan
      };
    } catch (error) {
      console.error(`${interventionType} Intervention Plan Generation Error:`, error);
      return {
        success: false,
        interventionType,
        error: error.message
      };
    }
  }

  // Intervention Progress Tracking and Management
  async manageInterventionProgress(interventionPlanId: string) {
    try {
      const progressTracking = await this.interventionEngine.trackInterventionProgress(
        interventionPlanId
      );

      // Trigger additional support or escalation if needed
      await this.handleInterventionProgressOutcome(progressTracking);

      return {
        success: true,
        progressTracking
      };
    } catch (error) {
      console.error('Intervention Progress Management Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Early Warning and Proactive Support System
  async earlyWarningAndSupportSystem(studentId: string) {
    try {
      // Conduct comprehensive risk assessment
      const riskAssessment = await this.interventionEngine.assessStudentRisk(studentId);

      // Determine early warning triggers
      const earlyWarningTriggers = this.identifyEarlyWarningTriggers(
        riskAssessment
      );

      // Generate proactive support recommendations
      const proactiveSupportRecommendations = 
        await this.generateProactiveSupportRecommendations(
          studentId, 
          earlyWarningTriggers
        );

      return {
        success: true,
        studentId,
        riskAssessment,
        earlyWarningTriggers,
        proactiveSupportRecommendations
      };
    } catch (error) {
      console.error('Early Warning and Support System Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Private Utility Methods
  private consolidateInterventionPlans(
    interventionPlans: any[], 
    riskAssessment: any
  ) {
    // Sort intervention plans by risk level and priority
    const sortedPlans = interventionPlans
      .filter(plan => plan.success)
      .sort((a, b) => {
        const riskPriority = {
          [RiskLevel.CRITICAL]: 4,
          [RiskLevel.HIGH]: 3,
          [RiskLevel.MODERATE]: 2,
          [RiskLevel.LOW]: 1
        };

        const getRiskLevel = (plan) => 
          riskAssessment.riskAssessment[`${plan.interventionPlan.interventionType.toLowerCase()}RiskLevel`];

        return riskPriority[getRiskLevel(b)] - riskPriority[getRiskLevel(a)];
      });

    return {
      overallRiskLevel: riskAssessment.riskAssessment.overallRiskLevel,
      interventionPlans: sortedPlans.map(plan => plan.interventionPlan)
    };
  }

  private async logInterventionPlanCreation(interventionPlan: any) {
    await this.prisma.learningInterventionLog.create({
      data: {
        studentId: interventionPlan.studentId,
        interventionType: interventionPlan.interventionType,
        interventionPlanId: interventionPlan.interventionPlanId,
        interventionPlan: JSON.stringify(interventionPlan)
      }
    });
  }

  private async handleInterventionProgressOutcome(progressTracking: any) {
    // Determine if additional support or escalation is needed
    if (progressTracking.updatedStatus === 'CRITICAL_REVIEW') {
      await this.escalateInterventionSupport(
        progressTracking.interventionPlanId
      );
    }
  }

  private async escalateInterventionSupport(interventionPlanId: string) {
    // Create high-priority support ticket
    await this.prisma.supportTicket.create({
      data: {
        interventionPlanId,
        priority: 'HIGH',
        status: 'URGENT_REVIEW',
        description: 'Critical intervention requires immediate attention'
      }
    });
  }

  private identifyEarlyWarningTriggers(riskAssessment: any) {
    const triggers = [];

    const riskThresholds = {
      academicRisk: RiskLevel.MODERATE,
      emotionalRisk: RiskLevel.HIGH,
      skillDevelopmentRisk: RiskLevel.MODERATE,
      careerPreparationRisk: RiskLevel.HIGH
    };

    Object.entries(riskThresholds).forEach(([riskType, threshold]) => {
      const currentRiskLevel = riskAssessment.riskAssessment[riskType];
      
      if (this.compareRiskLevels(currentRiskLevel, threshold) >= 0) {
        triggers.push({
          riskType,
          currentRiskLevel,
          triggerDescription: `${riskType} exceeds recommended threshold`
        });
      }
    });

    return triggers;
  }

  private async generateProactiveSupportRecommendations(
    studentId: string, 
    earlyWarningTriggers: any[]
  ) {
    const recommendations = [];

    for (const trigger of earlyWarningTriggers) {
      const interventionType = this.mapRiskTypeToInterventionType(
        trigger.riskType
      );

      const interventionPlan = await this.generateInterventionPlan(
        studentId, 
        interventionType
      );

      if (interventionPlan.success) {
        recommendations.push({
          trigger: trigger,
          interventionPlan: interventionPlan.interventionPlan
        });
      }
    }

    return recommendations;
  }

  private compareRiskLevels(level1: RiskLevel, level2: RiskLevel): number {
    const riskPriority = {
      [RiskLevel.LOW]: 1,
      [RiskLevel.MODERATE]: 2,
      [RiskLevel.HIGH]: 3,
      [RiskLevel.CRITICAL]: 4
    };

    return riskPriority[level1] - riskPriority[level2];
  }

  private mapRiskTypeToInterventionType(riskType: string): InterventionType {
    const mappings = {
      'academicRisk': InterventionType.ACADEMIC_SUPPORT,
      'emotionalRisk': InterventionType.EMOTIONAL_SUPPORT,
      'skillDevelopmentRisk': InterventionType.SKILL_DEVELOPMENT,
      'careerPreparationRisk': InterventionType.CAREER_GUIDANCE
    };

    return mappings[riskType] || InterventionType.ACADEMIC_SUPPORT;
  }

  // Measure Intervention Effectiveness
  async measureInterventionEffectiveness(
    interventionId: string
  ): Promise<{
    effectivenessScore: number,
    impactMetrics: Record<string, number>,
    recommendedAdjustments: string[]
  }> {
    try {
      // Retrieve intervention details
      const intervention = await this.prisma.learningIntervention.findUnique({
        where: { id: interventionId },
        include: { 
          student: true,
          performanceMetrics: true 
        }
      });

      if (!intervention) {
        throw new Error('Intervention not found');
      }

      // Calculate effectiveness based on performance metrics
      const performanceMetrics = intervention.performanceMetrics;
      const effectivenessScore = this.calculateEffectivenessScore(performanceMetrics);

      // Generate impact metrics
      const impactMetrics = this.generateImpactMetrics(performanceMetrics);

      // Recommend intervention adjustments
      const recommendedAdjustments = this.generateInterventionAdjustments(
        effectivenessScore, 
        impactMetrics
      );

      return {
        effectivenessScore,
        impactMetrics,
        recommendedAdjustments
      };
    } catch (error) {
      console.error('Intervention Effectiveness Measurement Error:', error);
      throw error;
    }
  }

  // Calculate Intervention Effectiveness Score
  private calculateEffectivenessScore(
    performanceMetrics: any[]
  ): number {
    const metricScores = performanceMetrics.map(metric => {
      const improvement = metric.afterIntervention - metric.beforeIntervention;
      const improvementRatio = improvement / metric.beforeIntervention;
      return Math.min(Math.max(improvementRatio, 0), 1);
    });

    return metricScores.reduce((a, b) => a + b, 0) / metricScores.length;
  }

  // Generate Impact Metrics
  private generateImpactMetrics(
    performanceMetrics: any[]
  ): Record<string, number> {
    return performanceMetrics.reduce((metrics, metric) => {
      const improvement = metric.afterIntervention - metric.beforeIntervention;
      const improvementPercentage = (improvement / metric.beforeIntervention) * 100;
      
      metrics[metric.metricName] = {
        improvement: improvementPercentage,
        absoluteChange: improvement
      };

      return metrics;
    }, {});
  }

  // Generate Intervention Adjustments
  private generateInterventionAdjustments(
    effectivenessScore: number,
    impactMetrics: Record<string, number>
  ): string[] {
    const adjustments = [];

    // Low effectiveness recommendations
    if (effectivenessScore < 0.3) {
      adjustments.push(
        'Comprehensive intervention redesign',
        'Personalized learning approach',
        'Additional support resources'
      );
    }

    // Moderate effectiveness recommendations
    if (effectivenessScore >= 0.3 && effectivenessScore < 0.6) {
      adjustments.push(
        'Targeted intervention refinement',
        'Supplementary learning materials',
        'Enhanced monitoring'
      );
    }

    // Metric-specific adjustments
    Object.entries(impactMetrics).forEach(([metric, data]) => {
      if (data.improvement < 10) {
        adjustments.push(`Focus on improving ${metric} performance`);
      }
    });

    return adjustments;
  }

  // Adaptive Intervention Scaling Mechanism
  async scaleInterventionSupport(
    studentId: string,
    currentInterventionLevel: number
  ): Promise<{
    recommendedInterventionLevel: number,
    scalingStrategy: string[],
    supportIntensity: number
  }> {
    try {
      // Retrieve student's performance and intervention history
      const studentProfile = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          performanceAnalytics: true,
          learningInterventions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!studentProfile) {
        throw new Error('Student profile not found');
      }

      // Analyze performance trends and intervention history
      const performanceAnalytics = studentProfile.performanceAnalytics;
      const interventionHistory = studentProfile.learningInterventions;

      // Determine recommended intervention level
      const recommendedInterventionLevel = this.calculateOptimalInterventionLevel(
        performanceAnalytics,
        interventionHistory,
        currentInterventionLevel
      );

      // Generate scaling strategy
      const scalingStrategy = this.generateInterventionScalingStrategy(
        recommendedInterventionLevel
      );

      // Calculate support intensity
      const supportIntensity = this.calculateSupportIntensity(
        recommendedInterventionLevel
      );

      return {
        recommendedInterventionLevel,
        scalingStrategy,
        supportIntensity
      };
    } catch (error) {
      console.error('Intervention Scaling Error:', error);
      throw error;
    }
  }

  // Calculate Optimal Intervention Level
  private calculateOptimalInterventionLevel(
    performanceAnalytics: any,
    interventionHistory: any[],
    currentLevel: number
  ): number {
    // Analyze performance trend
    const performanceTrend = performanceAnalytics.performanceTrend;
    const potentialIndex = performanceAnalytics.potentialIndex;

    // Analyze intervention effectiveness
    const recentInterventionEffectiveness = interventionHistory
      .slice(0, 3)
      .reduce((avg, intervention) => avg + intervention.effectivenessScore, 0) / 
      Math.min(interventionHistory.length, 3);

    // Determine intervention level adjustment
    switch (true) {
      case performanceTrend === 'DECLINING' && potentialIndex < 0.4:
        return Math.min(currentLevel + 2, 5);
      case performanceTrend === 'STABLE' && recentInterventionEffectiveness < 0.5:
        return Math.min(currentLevel + 1, 5);
      case performanceTrend === 'IMPROVING' && potentialIndex > 0.7:
        return Math.max(currentLevel - 1, 1);
      default:
        return currentLevel;
    }
  }

  // Generate Intervention Scaling Strategy
  private generateInterventionScalingStrategy(
    interventionLevel: number
  ): string[] {
    const strategies = {
      1: [
        'Minimal support resources',
        'Self-guided learning materials',
        'Periodic progress check-ins'
      ],
      2: [
        'Supplementary online resources',
        'Group study recommendations',
        'Quarterly performance review'
      ],
      3: [
        'Targeted tutoring sessions',
        'Personalized learning plan',
        'Monthly progress monitoring'
      ],
      4: [
        'Intensive one-on-one tutoring',
        'Comprehensive support program',
        'Bi-weekly performance assessment'
      ],
      5: [
        'Holistic academic intervention',
        'Dedicated academic coach',
        'Weekly comprehensive support'
      ]
    };

    return strategies[interventionLevel] || strategies[3];
  }

  // Calculate Support Intensity
  private calculateSupportIntensity(
    interventionLevel: number
  ): number {
    // Linear mapping of intervention level to support intensity
    return interventionLevel / 5;
  }
}
