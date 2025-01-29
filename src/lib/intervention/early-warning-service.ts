import { PrismaClient } from '@prisma/client';
import { NotificationService } from '@/lib/notification/notification-service';

export enum RiskCategory {
  ACADEMIC = 'ACADEMIC',
  ATTENDANCE = 'ATTENDANCE',
  BEHAVIORAL = 'BEHAVIORAL',
  SOCIAL_EMOTIONAL = 'SOCIAL_EMOTIONAL',
  FINANCIAL = 'FINANCIAL'
}

export enum InterventionPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface EarlyWarningTrigger {
  studentId: string;
  riskCategory: RiskCategory;
  riskScore: number;
  triggerDetails: string[];
  recommendedInterventions: string[];
  priority: InterventionPriority;
}

export class EarlyWarningService {
  private prisma: PrismaClient;
  private notificationService: NotificationService;

  constructor() {
    this.prisma = new PrismaClient();
    this.notificationService = new NotificationService();
  }

  // Comprehensive Risk Assessment
  async assessStudentRisks(studentId: string): Promise<EarlyWarningTrigger[]> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        academicRecords: true,
        attendanceRecords: true,
        behaviorRecords: true,
        performanceMetrics: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const riskAssessments: EarlyWarningTrigger[] = [];

    // Academic Risk Assessment
    const academicRisk = this.assessAcademicRisk(student);
    if (academicRisk) riskAssessments.push(academicRisk);

    // Attendance Risk Assessment
    const attendanceRisk = this.assessAttendanceRisk(student);
    if (attendanceRisk) riskAssessments.push(attendanceRisk);

    // Behavioral Risk Assessment
    const behavioralRisk = this.assessBehavioralRisk(student);
    if (behavioralRisk) riskAssessments.push(behavioralRisk);

    // Social-Emotional Risk Assessment
    const socialEmotionalRisk = this.assessSocialEmotionalRisk(student);
    if (socialEmotionalRisk) riskAssessments.push(socialEmotionalRisk);

    // Financial Risk Assessment
    const financialRisk = this.assessFinancialRisk(student);
    if (financialRisk) riskAssessments.push(financialRisk);

    return riskAssessments;
  }

  // Create Intervention Plan
  async createInterventionPlan(studentId: string) {
    const risks = await this.assessStudentRisks(studentId);

    const interventionPlan = {
      studentId,
      overallRiskLevel: this.calculateOverallRiskLevel(risks),
      interventions: risks.flatMap(risk => risk.recommendedInterventions),
      triggerDetails: risks.flatMap(risk => risk.triggerDetails)
    };

    // Notify relevant stakeholders
    await this.notifyStakeholders(studentId, interventionPlan);

    // Save intervention plan
    await this.prisma.interventionPlan.create({
      data: {
        studentId,
        riskLevel: interventionPlan.overallRiskLevel,
        interventions: interventionPlan.interventions,
        triggerDetails: interventionPlan.triggerDetails
      }
    });

    return interventionPlan;
  }

  // Track Intervention Effectiveness
  async trackInterventionEffectiveness(interventionPlanId: string) {
    const interventionPlan = await this.prisma.interventionPlan.findUnique({
      where: { id: interventionPlanId },
      include: { student: true }
    });

    if (!interventionPlan) {
      throw new Error('Intervention Plan not found');
    }

    // Reassess student risks after intervention
    const currentRisks = await this.assessStudentRisks(interventionPlan.studentId);

    const effectivenessReport = {
      interventionPlanId,
      initialRiskLevel: interventionPlan.riskLevel,
      currentRiskLevel: this.calculateOverallRiskLevel(currentRisks),
      improvementPercentage: this.calculateImprovementPercentage(
        interventionPlan.riskLevel, 
        this.calculateOverallRiskLevel(currentRisks)
      )
    };

    // Update intervention plan status
    await this.prisma.interventionPlan.update({
      where: { id: interventionPlanId },
      data: {
        status: effectivenessReport.improvementPercentage > 50 ? 'SUCCESSFUL' : 'NEEDS_REVIEW'
      }
    });

    return effectivenessReport;
  }

  // Private Risk Assessment Methods
  private assessAcademicRisk(student: any): EarlyWarningTrigger | null {
    const gpaThreshold = 2.0;
    const failedCoursesThreshold = 2;

    if (student.academicRecords.gpa < gpaThreshold || 
        student.academicRecords.failedCourses > failedCoursesThreshold) {
      return {
        studentId: student.id,
        riskCategory: RiskCategory.ACADEMIC,
        riskScore: this.calculateRiskScore(student.academicRecords),
        triggerDetails: [
          `GPA below ${gpaThreshold}`,
          `Failed ${student.academicRecords.failedCourses} courses`
        ],
        recommendedInterventions: [
          'Academic Tutoring',
          'Study Skills Workshop',
          'One-on-One Academic Counseling'
        ],
        priority: InterventionPriority.HIGH
      };
    }
    return null;
  }

  private assessAttendanceRisk(student: any): EarlyWarningTrigger | null {
    const absenceThreshold = 10;

    if (student.attendanceRecords.totalAbsences > absenceThreshold) {
      return {
        studentId: student.id,
        riskCategory: RiskCategory.ATTENDANCE,
        riskScore: this.calculateRiskScore(student.attendanceRecords),
        triggerDetails: [
          `Exceeded ${absenceThreshold} absences`,
          'Consistent pattern of missed classes'
        ],
        recommendedInterventions: [
          'Attendance Counseling',
          'Flexible Learning Options',
          'Family Engagement'
        ],
        priority: InterventionPriority.MEDIUM
      };
    }
    return null;
  }

  private assessBehavioralRisk(student: any): EarlyWarningTrigger | null {
    const disciplinaryIncidentsThreshold = 3;

    if (student.behaviorRecords.disciplinaryIncidents > disciplinaryIncidentsThreshold) {
      return {
        studentId: student.id,
        riskCategory: RiskCategory.BEHAVIORAL,
        riskScore: this.calculateRiskScore(student.behaviorRecords),
        triggerDetails: [
          `${student.behaviorRecords.disciplinaryIncidents} disciplinary incidents`,
          'Repeated behavioral issues'
        ],
        recommendedInterventions: [
          'Behavioral Counseling',
          'Peer Mediation Program',
          'Conflict Resolution Workshop'
        ],
        priority: InterventionPriority.HIGH
      };
    }
    return null;
  }

  private assessSocialEmotionalRisk(student: any): EarlyWarningTrigger | null {
    const isolationIndicators = student.performanceMetrics.socialEngagement < 30;

    if (isolationIndicators) {
      return {
        studentId: student.id,
        riskCategory: RiskCategory.SOCIAL_EMOTIONAL,
        riskScore: this.calculateRiskScore(student.performanceMetrics),
        triggerDetails: [
          'Low social engagement score',
          'Potential social isolation'
        ],
        recommendedInterventions: [
          'Peer Support Group',
          'Mental Health Counseling',
          'Social Skills Development'
        ],
        priority: InterventionPriority.MEDIUM
      };
    }
    return null;
  }

  private assessFinancialRisk(student: any): EarlyWarningTrigger | null {
    const financialStressIndicators = student.financialStatus?.stressLevel > 7;

    if (financialStressIndicators) {
      return {
        studentId: student.id,
        riskCategory: RiskCategory.FINANCIAL,
        riskScore: this.calculateRiskScore(student.financialStatus),
        triggerDetails: [
          'High financial stress level',
          'Potential risk of dropping out'
        ],
        recommendedInterventions: [
          'Financial Aid Counseling',
          'Scholarship Opportunities',
          'Part-time Work Placement'
        ],
        priority: InterventionPriority.HIGH
      };
    }
    return null;
  }

  // Utility Methods
  private calculateRiskScore(record: any): number {
    // Implement complex risk scoring algorithm
    return Math.min(Math.random() * 10, 10);
  }

  private calculateOverallRiskLevel(risks: EarlyWarningTrigger[]): string {
    if (risks.some(risk => risk.priority === InterventionPriority.CRITICAL)) return 'CRITICAL';
    if (risks.some(risk => risk.priority === InterventionPriority.HIGH)) return 'HIGH';
    if (risks.some(risk => risk.priority === InterventionPriority.MEDIUM)) return 'MEDIUM';
    return 'LOW';
  }

  private calculateImprovementPercentage(initialRiskLevel: string, currentRiskLevel: string): number {
    const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const initialIndex = riskLevels.indexOf(initialRiskLevel);
    const currentIndex = riskLevels.indexOf(currentRiskLevel);

    return Math.max(0, ((initialIndex - currentIndex) / riskLevels.length) * 100);
  }

  // Notification Methods
  private async notifyStakeholders(studentId: string, interventionPlan: any) {
    // Notify student
    await this.notificationService.createNotification({
      userId: studentId,
      type: 'INTERVENTION',
      priority: 'HIGH',
      title: 'Personalized Support Plan',
      message: `A personalized intervention plan has been created to support your academic journey.`
    });

    // Notify academic advisor
    const advisor = await this.prisma.teacher.findFirst({
      where: { role: 'ACADEMIC_ADVISOR' }
    });

    if (advisor) {
      await this.notificationService.createNotification({
        userId: advisor.id,
        type: 'INTERVENTION',
        priority: 'HIGH',
        title: 'Student Intervention Required',
        message: `Intervention plan created for student ${studentId}. Review recommended actions.`
      });
    }
  }
}
