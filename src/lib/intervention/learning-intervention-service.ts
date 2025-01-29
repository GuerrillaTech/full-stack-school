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
}
