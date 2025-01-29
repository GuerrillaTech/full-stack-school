import { PrismaClient } from '@prisma/client';
import * as tf from '@tensorflow/tfjs-node';

export enum LearningStyle {
  VISUAL = 'VISUAL',
  AUDITORY = 'AUDITORY',
  KINESTHETIC = 'KINESTHETIC',
  READING_WRITING = 'READING_WRITING'
}

export enum CognitiveLoadLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE', 
  HIGH = 'HIGH',
  OVERWHELMING = 'OVERWHELMING'
}

export class LearningAnalyticsEngine {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Comprehensive Learning Profile Generation
  async generateLearningProfile(studentId: string) {
    // Fetch comprehensive student data
    const studentData = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        results: {
          include: {
            exam: {
              include: {
                lesson: {
                  include: {
                    subject: true
                  }
                }
              }
            }
          }
        },
        attendances: true,
        academicInterventionPlans: true
      }
    });

    if (!studentData) {
      throw new Error('Student not found');
    }

    // Learning Style Analysis
    const learningStyle = await this.determineLearningStyle(studentId);

    // Cognitive Load Analysis
    const cognitiveLoadProfile = await this.analyzeCognitiveLoad(studentId);

    // Performance Prediction Model
    const performancePrediction = await this.predictFuturePerformance(studentId);

    // Learning Engagement Metrics
    const engagementMetrics = this.calculateEngagementMetrics(studentData);

    return {
      studentId,
      learningProfile: {
        learningStyle,
        cognitiveLoadProfile,
        performancePrediction,
        engagementMetrics
      }
    };
  }

  // Advanced Learning Style Determination
  private async determineLearningStyle(studentId: string): Promise<LearningStyle> {
    // Fetch student's interaction data
    const interactionData = await this.prisma.studentInteraction.findMany({
      where: { studentId }
    });

    // Complex learning style determination algorithm
    const styleScores = {
      [LearningStyle.VISUAL]: 0,
      [LearningStyle.AUDITORY]: 0,
      [LearningStyle.KINESTHETIC]: 0,
      [LearningStyle.READING_WRITING]: 0
    };

    interactionData.forEach(interaction => {
      switch (interaction.interactionType) {
        case 'VIDEO_WATCH':
          styleScores[LearningStyle.VISUAL] += 2;
          break;
        case 'AUDIO_LISTEN':
          styleScores[LearningStyle.AUDITORY] += 2;
          break;
        case 'PRACTICAL_EXERCISE':
          styleScores[LearningStyle.KINESTHETIC] += 2;
          break;
        case 'TEXT_READ':
          styleScores[LearningStyle.READING_WRITING] += 2;
          break;
      }
    });

    // Find the learning style with the highest score
    return Object.entries(styleScores).reduce(
      (a, b) => b[1] > a[1] ? b[0] as LearningStyle : a[0] as LearningStyle
    );
  }

  // Cognitive Load Analysis
  private async analyzeCognitiveLoad(studentId: string): Promise<{
    level: CognitiveLoadLevel,
    factors: Record<string, number>
  }> {
    const studentResults = await this.prisma.result.findMany({
      where: { studentId },
      include: {
        exam: {
          include: {
            lesson: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    });

    // Cognitive load calculation factors
    const cognitiveLoadFactors = {
      complexityScore: 0,
      timeSpentScore: 0,
      stressScore: 0,
      performanceVariability: 0
    };

    // Calculate complexity based on exam difficulty and subject
    studentResults.forEach(result => {
      const complexity = result.exam?.lesson?.subject?.complexityLevel || 5;
      cognitiveLoadFactors.complexityScore += complexity;
    });

    // Time spent analysis (using TensorFlow for advanced calculations)
    const timeSpentData = studentResults.map(
      result => result.timeSpent || 0
    );
    const timeSpentTensor = tf.tensor1d(timeSpentData);
    const meanTimeSpent = timeSpentTensor.mean().dataSync()[0];
    const stdTimeSpent = tf.moments(timeSpentTensor).variance.sqrt().dataSync()[0];
    cognitiveLoadFactors.timeSpentScore = meanTimeSpent + stdTimeSpent;

    // Determine cognitive load level
    const totalScore = Object.values(cognitiveLoadFactors).reduce((a, b) => a + b, 0);
    const averageScore = totalScore / Object.keys(cognitiveLoadFactors).length;

    const cognitiveLoadLevel = 
      averageScore <= 3 ? CognitiveLoadLevel.LOW :
      averageScore <= 6 ? CognitiveLoadLevel.MODERATE :
      averageScore <= 9 ? CognitiveLoadLevel.HIGH :
      CognitiveLoadLevel.OVERWHELMING;

    return {
      level: cognitiveLoadLevel,
      factors: cognitiveLoadFactors
    };
  }

  // Performance Prediction using Machine Learning
  private async predictFuturePerformance(studentId: string) {
    const studentResults = await this.prisma.result.findMany({
      where: { studentId },
      orderBy: { exam: { startTime: 'asc' } }
    });

    // Prepare data for prediction
    const features = studentResults.map(result => [
      result.score,
      result.timeSpent || 0,
      result.exam?.lesson?.subject?.complexityLevel || 5
    ]);

    const labels = studentResults.slice(1).map(result => result.score);

    // Simple linear regression model using TensorFlow
    const model = tf.sequential();
    model.add(tf.layers.dense({
      units: 1, 
      inputShape: [features[0].length]
    }));

    model.compile({
      optimizer: 'sgd',
      loss: 'meanSquaredError'
    });

    const xs = tf.tensor2d(features.slice(0, -1));
    const ys = tf.tensor1d(labels);

    await model.fit(xs, ys, { epochs: 250 });

    // Predict next performance
    const lastFeature = features[features.length - 1];
    const predictionTensor = model.predict(tf.tensor2d([lastFeature])) as tf.Tensor;
    const prediction = predictionTensor.dataSync()[0];

    return {
      predictedScore: prediction,
      confidenceInterval: {
        lower: prediction - 10,
        upper: prediction + 10
      }
    };
  }

  // Engagement Metrics Calculation
  private calculateEngagementMetrics(studentData: any) {
    const totalClasses = studentData.attendances.length;
    const attendedClasses = studentData.attendances.filter(
      (attendance: any) => attendance.status === 'PRESENT'
    ).length;

    const averageScore = studentData.results.length > 0
      ? studentData.results.reduce((sum: number, result: any) => sum + result.score, 0) 
        / studentData.results.length
      : 0;

    return {
      attendanceRate: (attendedClasses / totalClasses) * 100,
      averageScore,
      interventionCount: studentData.academicInterventionPlans.length,
      engagementScore: 
        (attendedClasses / totalClasses) * 0.4 + 
        (averageScore / 100) * 0.6
    };
  }

  // Advanced Learning Recommendations
  async generateLearningRecommendations(studentId: string) {
    const learningProfile = await this.generateLearningProfile(studentId);
    
    return {
      studentId,
      recommendations: {
        learningStyleOptimizedResources: this.recommendResourcesByLearningStyle(
          learningProfile.learningProfile.learningStyle
        ),
        cognitiveLoadManagementStrategies: this.recommendCognitiveLoadStrategies(
          learningProfile.learningProfile.cognitiveLoadProfile.level
        ),
        performanceEnhancementPlan: this.createPerformanceEnhancementPlan(
          learningProfile.learningProfile.performancePrediction
        )
      }
    };
  }

  // Learning Style-Based Resource Recommendations
  private recommendResourcesByLearningStyle(learningStyle: LearningStyle) {
    const styleRecommendations = {
      [LearningStyle.VISUAL]: [
        'Infographics',
        'Mind Maps',
        'Video Tutorials',
        'Diagram-based Learning Materials'
      ],
      [LearningStyle.AUDITORY]: [
        'Podcast Lectures',
        'Audio Books',
        'Group Discussions',
        'Verbal Explanation Videos'
      ],
      [LearningStyle.KINESTHETIC]: [
        'Interactive Simulations',
        'Hands-on Workshops',
        'Physical Learning Experiments',
        'Role-playing Exercises'
      ],
      [LearningStyle.READING_WRITING]: [
        'Detailed Text Notes',
        'Academic Papers',
        'Comprehensive Textbooks',
        'Writing Assignments'
      ]
    };

    return styleRecommendations[learningStyle];
  }

  // Cognitive Load Management Strategies
  private recommendCognitiveLoadStrategies(cognitiveLoadLevel: CognitiveLoadLevel) {
    const loadManagementStrategies = {
      [CognitiveLoadLevel.LOW]: [
        'Advanced Challenge Modules',
        'Interdisciplinary Learning Projects'
      ],
      [CognitiveLoadLevel.MODERATE]: [
        'Balanced Learning Approach',
        'Incremental Complexity Progression'
      ],
      [CognitiveLoadLevel.HIGH]: [
        'Stress Management Techniques',
        'Break Down Complex Topics',
        'Additional Support Sessions'
      ],
      [CognitiveLoadLevel.OVERWHELMING]: [
        'Immediate Academic Counseling',
        'Personalized Learning Reduction Plan',
        'Mental Health Support Referral'
      ]
    };

    return loadManagementStrategies[cognitiveLoadLevel];
  }

  // Performance Enhancement Plan
  private createPerformanceEnhancementPlan(performancePrediction: any) {
    const predictionScore = performancePrediction.predictedScore;

    return {
      targetScore: predictionScore + 10,
      interventionStrategies: [
        'Personalized Tutoring',
        'Targeted Study Resources',
        'Progress Tracking Workshops'
      ],
      confidenceInterval: performancePrediction.confidenceInterval
    };
  }
}
