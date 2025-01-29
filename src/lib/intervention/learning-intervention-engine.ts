import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

export enum InterventionType {
  ACADEMIC_SUPPORT = 'ACADEMIC_SUPPORT',
  EMOTIONAL_SUPPORT = 'EMOTIONAL_SUPPORT',
  SKILL_DEVELOPMENT = 'SKILL_DEVELOPMENT',
  CAREER_GUIDANCE = 'CAREER_GUIDANCE',
  MENTAL_HEALTH = 'MENTAL_HEALTH'
}

export enum RiskLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export class LearningInterventionEngine {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // Comprehensive Student Risk Assessment
  async assessStudentRisk(studentId: string) {
    try {
      // Fetch comprehensive student data
      const student = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          academicInterventionPlans: true,
          learningProfile: true,
          performancePredictions: true,
          scholarshipEvaluations: true
        }
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Multi-dimensional risk analysis
      const riskAssessment = await this.conductMultidimensionalRiskAnalysis(student);

      // Generate personalized intervention recommendations
      const interventionRecommendations = await this.generateInterventionRecommendations(
        student, 
        riskAssessment
      );

      // Log risk assessment
      await this.logRiskAssessment(studentId, riskAssessment);

      return {
        studentId,
        riskAssessment,
        interventionRecommendations
      };
    } catch (error) {
      console.error('Student Risk Assessment Error:', error);
      throw error;
    }
  }

  // Personalized Intervention Plan Generation
  async generatePersonalizedInterventionPlan(
    studentId: string, 
    interventionType: InterventionType
  ) {
    try {
      // Fetch student risk assessment
      const riskAssessment = await this.assessStudentRisk(studentId);

      // AI-powered intervention plan generation
      const interventionPlan = await this.generateAIInterventionPlan(
        riskAssessment, 
        interventionType
      );

      // Save intervention plan
      const savedInterventionPlan = await this.prisma.learningIntervention.create({
        data: {
          studentId,
          interventionType,
          riskLevel: riskAssessment.riskAssessment.overallRiskLevel,
          interventionPlan: JSON.stringify(interventionPlan),
          status: 'ACTIVE'
        }
      });

      return {
        interventionPlanId: savedInterventionPlan.id,
        interventionType,
        interventionPlan
      };
    } catch (error) {
      console.error('Personalized Intervention Plan Generation Error:', error);
      throw error;
    }
  }

  // Intervention Progress Tracking
  async trackInterventionProgress(interventionPlanId: string) {
    try {
      const interventionPlan = await this.prisma.learningIntervention.findUnique({
        where: { id: interventionPlanId },
        include: { student: true }
      });

      if (!interventionPlan) {
        throw new Error('Intervention Plan not found');
      }

      // Analyze intervention effectiveness
      const progressAnalysis = await this.analyzeInterventionEffectiveness(
        interventionPlan
      );

      // Update intervention status
      const updatedInterventionPlan = await this.prisma.learningIntervention.update({
        where: { id: interventionPlanId },
        data: {
          progressTracking: JSON.stringify(progressAnalysis),
          status: progressAnalysis.recommendedStatus
        }
      });

      return {
        interventionPlanId,
        progressAnalysis,
        updatedStatus: updatedInterventionPlan.status
      };
    } catch (error) {
      console.error('Intervention Progress Tracking Error:', error);
      throw error;
    }
  }

  // Private Utility Methods
  private async conductMultidimensionalRiskAnalysis(student: any) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert student risk assessment specialist."
          },
          {
            role: "user",
            content: `Conduct a comprehensive multi-dimensional risk assessment for a student:
              - Academic Performance: ${JSON.stringify(student.performancePredictions)}
              - Learning Profile: ${JSON.stringify(student.learningProfile)}
              - Scholarship Status: ${JSON.stringify(student.scholarshipEvaluations)}
              - Previous Intervention Plans: ${JSON.stringify(student.academicInterventionPlans)}

              Provide a detailed risk analysis covering academic, emotional, 
              skill development, and career preparation dimensions.`
          }
        ]
      });

      const riskAnalysisResult = aiResponse.choices[0].message.content || "No risk analysis available";

      // Extract quantitative risk levels
      const riskLevels = this.extractRiskLevels(riskAnalysisResult);

      return {
        academicRiskLevel: riskLevels.academicRisk,
        emotionalRiskLevel: riskLevels.emotionalRisk,
        skillDevelopmentRiskLevel: riskLevels.skillDevelopmentRisk,
        careerPreparationRiskLevel: riskLevels.careerPreparationRisk,
        overallRiskLevel: this.calculateOverallRiskLevel(riskLevels),
        detailedAnalysis: riskAnalysisResult
      };
    } catch (error) {
      console.error('Multidimensional Risk Analysis Error:', error);
      return {
        overallRiskLevel: RiskLevel.MODERATE,
        detailedAnalysis: 'Unable to complete comprehensive risk analysis'
      };
    }
  }

  private async generateInterventionRecommendations(
    student: any, 
    riskAssessment: any
  ) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert educational intervention strategist."
          },
          {
            role: "user",
            content: `Generate personalized intervention recommendations based on risk assessment:
              - Student Risk Assessment: ${JSON.stringify(riskAssessment)}
              - Student Learning Profile: ${JSON.stringify(student.learningProfile)}

              Provide targeted, holistic intervention strategies 
              addressing academic, emotional, and skill development needs.`
          }
        ]
      });

      const interventionRecommendations = 
        aiResponse.choices[0].message.content || "No intervention recommendations available";

      return {
        academicInterventions: this.extractInterventions(
          interventionRecommendations, 
          'Academic'
        ),
        emotionalSupportInterventions: this.extractInterventions(
          interventionRecommendations, 
          'Emotional'
        ),
        skillDevelopmentInterventions: this.extractInterventions(
          interventionRecommendations, 
          'Skill Development'
        )
      };
    } catch (error) {
      console.error('Intervention Recommendations Generation Error:', error);
      return {
        academicInterventions: [],
        emotionalSupportInterventions: [],
        skillDevelopmentInterventions: []
      };
    }
  }

  private async generateAIInterventionPlan(
    riskAssessment: any, 
    interventionType: InterventionType
  ) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert educational intervention planner."
          },
          {
            role: "user",
            content: `Generate a detailed, personalized intervention plan:
              - Intervention Type: ${interventionType}
              - Risk Assessment: ${JSON.stringify(riskAssessment.riskAssessment)}
              - Intervention Recommendations: ${JSON.stringify(riskAssessment.interventionRecommendations)}

              Create a comprehensive, actionable intervention plan 
              with specific strategies, milestones, and support mechanisms.`
          }
        ]
      });

      const interventionPlan = 
        aiResponse.choices[0].message.content || "No intervention plan available";

      return {
        interventionType,
        riskLevel: riskAssessment.riskAssessment.overallRiskLevel,
        strategicObjectives: this.extractStrategicObjectives(interventionPlan),
        actionSteps: this.extractActionSteps(interventionPlan),
        supportMechanisms: this.extractSupportMechanisms(interventionPlan),
        expectedOutcomes: this.extractExpectedOutcomes(interventionPlan)
      };
    } catch (error) {
      console.error('AI Intervention Plan Generation Error:', error);
      return {
        interventionType,
        strategicObjectives: [],
        actionSteps: [],
        supportMechanisms: [],
        expectedOutcomes: []
      };
    }
  }

  private async analyzeInterventionEffectiveness(interventionPlan: any) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in educational intervention effectiveness analysis."
          },
          {
            role: "user",
            content: `Analyze the effectiveness of an existing intervention plan:
              - Intervention Type: ${interventionPlan.interventionType}
              - Risk Level: ${interventionPlan.riskLevel}
              - Intervention Plan: ${interventionPlan.interventionPlan}
              - Student Performance Data: ${JSON.stringify(interventionPlan.student.performancePredictions)}

              Provide a comprehensive analysis of intervention progress, 
              effectiveness, and recommended next steps.`
          }
        ]
      });

      const progressAnalysis = 
        aiResponse.choices[0].message.content || "No progress analysis available";

      return {
        progressPercentage: this.calculateProgressPercentage(progressAnalysis),
        effectivenessScore: this.calculateEffectivenessScore(progressAnalysis),
        recommendedStatus: this.determineInterventionStatus(progressAnalysis),
        detailedAnalysis: progressAnalysis
      };
    } catch (error) {
      console.error('Intervention Effectiveness Analysis Error:', error);
      return {
        progressPercentage: 0,
        effectivenessScore: 0,
        recommendedStatus: 'NEEDS_REVIEW',
        detailedAnalysis: 'Unable to complete intervention effectiveness analysis'
      };
    }
  }

  private async logRiskAssessment(studentId: string, riskAssessment: any) {
    await this.prisma.studentRiskAssessment.create({
      data: {
        studentId,
        academicRiskLevel: riskAssessment.academicRiskLevel,
        emotionalRiskLevel: riskAssessment.emotionalRiskLevel,
        skillDevelopmentRiskLevel: riskAssessment.skillDevelopmentRiskLevel,
        careerPreparationRiskLevel: riskAssessment.careerPreparationRiskLevel,
        overallRiskLevel: riskAssessment.overallRiskLevel,
        detailedAnalysis: riskAssessment.detailedAnalysis
      }
    });
  }

  // Advanced Extraction and Scoring Utility Methods
  private extractRiskLevels(analysisText: string) {
    const riskMappings = {
      'LOW': RiskLevel.LOW,
      'MODERATE': RiskLevel.MODERATE,
      'HIGH': RiskLevel.HIGH,
      'CRITICAL': RiskLevel.CRITICAL
    };

    const extractRiskLevel = (category: string) => {
      const match = analysisText.match(
        new RegExp(`${category}\\s*Risk\\s*Level\\s*:\\s*(LOW|MODERATE|HIGH|CRITICAL)`, 'i')
      );
      return match ? riskMappings[match[1].toUpperCase()] : RiskLevel.MODERATE;
    };

    return {
      academicRisk: extractRiskLevel('Academic'),
      emotionalRisk: extractRiskLevel('Emotional'),
      skillDevelopmentRisk: extractRiskLevel('Skill Development'),
      careerPreparationRisk: extractRiskLevel('Career Preparation')
    };
  }

  private calculateOverallRiskLevel(riskLevels: any): RiskLevel {
    const riskPriority = {
      [RiskLevel.CRITICAL]: 4,
      [RiskLevel.HIGH]: 3,
      [RiskLevel.MODERATE]: 2,
      [RiskLevel.LOW]: 1
    };

    const riskLevelValues = Object.values(riskLevels);
    const maxRiskLevel = riskLevelValues.reduce(
      (max, current) => 
        riskPriority[current] > riskPriority[max] ? current : max
    );

    return maxRiskLevel;
  }

  private extractInterventions(text: string, category: string): string[] {
    const regex = new RegExp(`${category}\\s*Interventions:\\s*(.+?)(?=\\n\\w+\\s*Interventions:|$)`, 'is');
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(intervention => intervention.trim()).filter(Boolean)
      : [];
  }

  private extractStrategicObjectives(text: string): string[] {
    const regex = /Strategic\s*Objectives:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(objective => objective.trim()).filter(Boolean)
      : [];
  }

  private extractActionSteps(text: string): string[] {
    const regex = /Action\s*Steps:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(step => step.trim()).filter(Boolean)
      : [];
  }

  private extractSupportMechanisms(text: string): string[] {
    const regex = /Support\s*Mechanisms:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(mechanism => mechanism.trim()).filter(Boolean)
      : [];
  }

  private extractExpectedOutcomes(text: string): string[] {
    const regex = /Expected\s*Outcomes:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(outcome => outcome.trim()).filter(Boolean)
      : [];
  }

  private calculateProgressPercentage(analysisText: string): number {
    const progressMatch = analysisText.match(/Progress\s*Percentage:\s*(\d+(\.\d+)?)/i);
    return progressMatch ? parseFloat(progressMatch[1]) : 0;
  }

  private calculateEffectivenessScore(analysisText: string): number {
    const effectivenessMatch = analysisText.match(/Effectiveness\s*Score:\s*(\d+(\.\d+)?)/i);
    return effectivenessMatch ? parseFloat(effectivenessMatch[1]) : 0;
  }

  private determineInterventionStatus(analysisText: string): string {
    if (analysisText.match(/Highly\s*Effective/i)) return 'SUCCESSFUL';
    if (analysisText.match(/Needs\s*Modification/i)) return 'NEEDS_ADJUSTMENT';
    if (analysisText.match(/Critical\s*Intervention\s*Required/i)) return 'CRITICAL_REVIEW';
    return 'IN_PROGRESS';
  }
}
