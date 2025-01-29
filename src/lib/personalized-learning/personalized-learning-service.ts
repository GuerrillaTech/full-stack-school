import { 
  PersonalizedLearningPathwayEngine, 
  LearningPathwayType, 
  SkillLevel 
} from './personalized-learning-engine';
import { PrismaClient } from '@prisma/client';

export class PersonalizedLearningPathwayService {
  private learningPathwayEngine: PersonalizedLearningPathwayEngine;
  private prisma: PrismaClient;

  constructor() {
    this.learningPathwayEngine = new PersonalizedLearningPathwayEngine();
    this.prisma = new PrismaClient();
  }

  // Comprehensive Learning Pathway Management
  async manageLearningPathway(
    userId: string,
    learningPathwayType: LearningPathwayType,
    learningObjective: string
  ) {
    try {
      // Generate personalized learning pathway
      const learningPathway = await this.learningPathwayEngine.generatePersonalizedLearningPathway(
        userId,
        learningPathwayType,
        learningObjective
      );

      // Create learning pathway tracking notification
      await this.createLearningPathwayNotification(
        userId, 
        learningPathway
      );

      return {
        success: true,
        learningPathway
      };
    } catch (error) {
      console.error('Learning Pathway Management Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Skill Development and Tracking
  async trackSkillDevelopment(
    userId: string,
    skillName: string,
    currentSkillLevel: SkillLevel,
    learningActivities: {
      activityType: string;
      duration: number;
      complexity: number;
    }[]
  ) {
    try {
      // Track and assess skill development
      const skillDevelopment = await this.learningPathwayEngine.trackSkillDevelopment(
        userId,
        skillName,
        currentSkillLevel,
        learningActivities
      );

      // Create skill development tracking notification
      await this.createSkillDevelopmentNotification(
        userId, 
        skillDevelopment
      );

      return {
        success: true,
        skillDevelopment
      };
    } catch (error) {
      console.error('Skill Development Tracking Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Learning Resource Recommendation
  async recommendLearningResources(
    userId: string,
    learningDomain: string,
    currentSkillLevel: SkillLevel
  ) {
    try {
      // Generate personalized learning resource recommendations
      const learningResourceRecommendations = await this.learningPathwayEngine.recommendLearningResources(
        userId,
        learningDomain,
        currentSkillLevel
      );

      // Create learning resource recommendation notification
      await this.createLearningResourceRecommendationNotification(
        userId, 
        learningResourceRecommendations
      );

      return {
        success: true,
        learningResourceRecommendations
      };
    } catch (error) {
      console.error('Learning Resource Recommendation Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Learning Path Optimization
  async optimizeLearningPath(
    personalizedLearningPathwayId: string
  ) {
    try {
      // Optimize existing learning pathway
      const learningPathOptimization = await this.learningPathwayEngine.optimizeLearningPath(
        personalizedLearningPathwayId
      );

      // Create learning path optimization notification
      await this.createLearningPathOptimizationNotification(
        learningPathOptimization
      );

      return {
        success: true,
        learningPathOptimization
      };
    } catch (error) {
      console.error('Learning Path Optimization Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Career Development Planning
  async developCareerPathway(
    userId: string,
    careerGoal: string,
    currentSkillSet: string[]
  ) {
    try {
      // Analyze current skills and career goal
      const careerPathwayAnalysis = await this.analyzeCareerPathway(
        userId,
        careerGoal,
        currentSkillSet
      );

      // Generate personalized career development pathway
      const careerDevelopmentPathway = await this.generateCareerDevelopmentPathway(
        userId,
        careerPathwayAnalysis
      );

      // Create career development pathway notification
      await this.createCareerDevelopmentNotification(
        userId, 
        careerDevelopmentPathway
      );

      return {
        success: true,
        careerPathwayAnalysis,
        careerDevelopmentPathway
      };
    } catch (error) {
      console.error('Career Development Planning Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Private Utility Methods
  private async createLearningPathwayNotification(
    userId: string, 
    learningPathway: any
  ) {
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'LEARNING_PATHWAY_CREATED',
        message: `New personalized learning pathway created for ${learningPathway.learningObjective}`,
        metadata: JSON.stringify(learningPathway)
      }
    });
  }

  private async createSkillDevelopmentNotification(
    userId: string, 
    skillDevelopment: any
  ) {
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'SKILL_DEVELOPMENT_TRACKED',
        message: `Skill development tracked for ${skillDevelopment.skillName}`,
        metadata: JSON.stringify(skillDevelopment)
      }
    });
  }

  private async createLearningResourceRecommendationNotification(
    userId: string, 
    learningResourceRecommendations: any
  ) {
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'LEARNING_RESOURCES_RECOMMENDED',
        message: `Personalized learning resources recommended for ${learningResourceRecommendations.learningDomain}`,
        metadata: JSON.stringify(learningResourceRecommendations)
      }
    });
  }

  private async createLearningPathOptimizationNotification(
    learningPathOptimization: any
  ) {
    const userId = learningPathOptimization.pathwayId.split('-')[0];

    await this.prisma.notification.create({
      data: {
        userId,
        type: 'LEARNING_PATH_OPTIMIZED',
        message: 'Your learning pathway has been optimized',
        metadata: JSON.stringify(learningPathOptimization)
      }
    });
  }

  private async analyzeCareerPathway(
    userId: string,
    careerGoal: string,
    currentSkillSet: string[]
  ) {
    try {
      // Fetch user's comprehensive profile
      const userProfile = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          studentProfile: true,
          learningProfile: true,
          skillDevelopmentTracking: true
        }
      });

      // Analyze career pathway requirements
      const careerPathwayAnalysis = await this.generateCareerPathwayAnalysis(
        userProfile,
        careerGoal,
        currentSkillSet
      );

      return careerPathwayAnalysis;
    } catch (error) {
      console.error('Career Pathway Analysis Error:', error);
      throw error;
    }
  }

  private async generateCareerPathwayAnalysis(
    userProfile: any,
    careerGoal: string,
    currentSkillSet: string[]
  ) {
    try {
      const aiResponse = await this.learningPathwayEngine['openai'].chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in career development and skill mapping."
          },
          {
            role: "user",
            content: `Analyze career pathway and skill development:
              - User Profile: ${JSON.stringify(userProfile)}
              - Career Goal: ${careerGoal}
              - Current Skill Set: ${JSON.stringify(currentSkillSet)}

              Provide a comprehensive analysis of:
              1. Skill Gap Assessment
              2. Career Pathway Recommendations
              3. Skill Development Roadmap
              4. Potential Challenges and Opportunities`
          }
        ]
      });

      const careerPathwayAnalysis = 
        aiResponse.choices[0].message.content || "No career pathway analysis available";

      return {
        skillGapAssessment: this.extractSkillGapAssessment(careerPathwayAnalysis),
        careerPathwayRecommendations: this.extractCareerPathwayRecommendations(careerPathwayAnalysis),
        skillDevelopmentRoadmap: this.extractSkillDevelopmentRoadmap(careerPathwayAnalysis),
        challengesAndOpportunities: this.extractChallengesAndOpportunities(careerPathwayAnalysis)
      };
    } catch (error) {
      console.error('Career Pathway Analysis Generation Error:', error);
      return {
        skillGapAssessment: [],
        careerPathwayRecommendations: [],
        skillDevelopmentRoadmap: [],
        challengesAndOpportunities: []
      };
    }
  }

  private async generateCareerDevelopmentPathway(
    userId: string,
    careerPathwayAnalysis: any
  ) {
    try {
      // Create career development pathway record
      const careerDevelopmentPathway = await this.prisma.careerDevelopmentPathway.create({
        data: {
          userId,
          careerGoal: careerPathwayAnalysis.careerPathwayRecommendations[0],
          pathwayDetails: JSON.stringify(careerPathwayAnalysis),
          skillDevelopmentRoadmap: JSON.stringify(
            careerPathwayAnalysis.skillDevelopmentRoadmap
          )
        }
      });

      return careerDevelopmentPathway;
    } catch (error) {
      console.error('Career Development Pathway Generation Error:', error);
      throw error;
    }
  }

  private async createCareerDevelopmentNotification(
    userId: string, 
    careerDevelopmentPathway: any
  ) {
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'CAREER_DEVELOPMENT_PATHWAY_CREATED',
        message: `Career development pathway created for ${careerDevelopmentPathway.careerGoal}`,
        metadata: JSON.stringify(careerDevelopmentPathway)
      }
    });
  }

  // Advanced Extraction Utility Methods
  private extractSkillGapAssessment(text: string): string[] {
    const regex = /Skill\s*Gap\s*Assessment:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(gap => gap.trim()).filter(Boolean)
      : [];
  }

  private extractCareerPathwayRecommendations(text: string): string[] {
    const regex = /Career\s*Pathway\s*Recommendations:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(recommendation => recommendation.trim()).filter(Boolean)
      : [];
  }

  private extractSkillDevelopmentRoadmap(text: string): string[] {
    const regex = /Skill\s*Development\s*Roadmap:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(roadmap => roadmap.trim()).filter(Boolean)
      : [];
  }

  private extractChallengesAndOpportunities(text: string): string[] {
    const regex = /Challenges\s*and\s*Opportunities:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(item => item.trim()).filter(Boolean)
      : [];
  }
}
