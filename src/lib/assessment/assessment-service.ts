import { AssessmentEngine, AssessmentType, DifficultyLevel } from './assessment-engine';

export class AssessmentService {
  private assessmentEngine: AssessmentEngine;

  constructor() {
    this.assessmentEngine = new AssessmentEngine();
  }

  // Create a comprehensive assessment
  async createComprehensiveAssessment(params: {
    subject: string;
    gradeLevel: number;
    learningObjectives: string[];
  }) {
    // Intelligent assessment type selection
    const assessmentType = this.selectAssessmentType(params.gradeLevel);
    const difficultyLevel = this.determineDifficultyLevel(params.gradeLevel);

    return this.assessmentEngine.createAssessment({
      title: `${params.subject} Comprehensive Assessment`,
      subject: params.subject,
      type: assessmentType,
      gradeLevel: params.gradeLevel,
      difficultyLevel: difficultyLevel,
      learningObjectives: params.learningObjectives,
      maxScore: 100,
      duration: this.calculateAssessmentDuration(assessmentType, params.gradeLevel)
    });
  }

  // Adaptive assessment generation
  async generateAdaptiveAssessment(studentId: string, subjectId: number) {
    return this.assessmentEngine.generateAdaptiveQuestions(studentId, subjectId);
  }

  // Comprehensive student performance analysis
  async analyzeStudentPerformance(studentId: string) {
    const performanceAnalysis = await this.assessmentEngine.analyzeStudentPerformance(studentId);
    
    return {
      ...performanceAnalysis,
      performanceInsights: this.generatePerformanceInsights(performanceAnalysis)
    };
  }

  // Predictive learning intervention recommendation
  async recommendLearningInterventions(studentId: string) {
    return this.assessmentEngine.predictLearningIntervention(studentId);
  }

  // Private helper methods for intelligent assessment design
  private selectAssessmentType(gradeLevel: number): AssessmentType {
    if (gradeLevel <= 5) return AssessmentType.FORMATIVE;
    if (gradeLevel <= 8) return AssessmentType.PERFORMANCE_BASED;
    return AssessmentType.ADAPTIVE;
  }

  private determineDifficultyLevel(gradeLevel: number): DifficultyLevel {
    if (gradeLevel <= 3) return DifficultyLevel.BEGINNER;
    if (gradeLevel <= 6) return DifficultyLevel.INTERMEDIATE;
    if (gradeLevel <= 9) return DifficultyLevel.ADVANCED;
    return DifficultyLevel.EXPERT;
  }

  private calculateAssessmentDuration(type: AssessmentType, gradeLevel: number): number {
    const baseTime = 30; // Base 30 minutes
    switch (type) {
      case AssessmentType.DIAGNOSTIC:
        return baseTime + (gradeLevel * 5);
      case AssessmentType.FORMATIVE:
        return baseTime + (gradeLevel * 3);
      case AssessmentType.SUMMATIVE:
        return baseTime + (gradeLevel * 7);
      case AssessmentType.PERFORMANCE_BASED:
        return baseTime + (gradeLevel * 6);
      case AssessmentType.ADAPTIVE:
        return baseTime + (gradeLevel * 8);
      default:
        return baseTime;
    }
  }

  // Generate actionable performance insights
  private generatePerformanceInsights(performanceAnalysis: any) {
    const insights = {
      strengths: [],
      areasForImprovement: [],
      overallPerformance: ''
    };

    // Identify top-performing subjects
    insights.strengths = Object.entries(performanceAnalysis.performanceBySubject)
      .filter(([_, data]) => data.averageScore >= 80)
      .map(([subject, _]) => subject);

    // Identify subjects needing improvement
    insights.areasForImprovement = Object.entries(performanceAnalysis.performanceBySubject)
      .filter(([_, data]) => data.averageScore < 60)
      .map(([subject, _]) => subject);

    // Overall performance classification
    const overallScore = performanceAnalysis.overallAverageScore;
    insights.overallPerformance = 
      overallScore >= 90 ? 'Exceptional' :
      overallScore >= 80 ? 'Excellent' :
      overallScore >= 70 ? 'Good' :
      overallScore >= 60 ? 'Satisfactory' :
      'Needs Significant Improvement';

    return insights;
  }
}
