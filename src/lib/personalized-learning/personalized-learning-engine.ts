import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

export enum LearningPathwayType {
  ACADEMIC_ADVANCEMENT = 'ACADEMIC_ADVANCEMENT',
  SKILL_MASTERY = 'SKILL_MASTERY',
  CAREER_PREPARATION = 'CAREER_PREPARATION',
  PERSONAL_DEVELOPMENT = 'PERSONAL_DEVELOPMENT',
  RESEARCH_INNOVATION = 'RESEARCH_INNOVATION'
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export class PersonalizedLearningPathwayEngine {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // Advanced Learning Pathway Generation
  async generatePersonalizedLearningPathway(
    userId: string,
    learningPathwayType: LearningPathwayType,
    learningObjective: string
  ) {
    try {
      // Fetch comprehensive user learning profile
      const userProfile = await this.fetchUserLearningProfile(userId);

      // Generate personalized learning pathway
      const learningPathwayRecommendation = await this.generateLearningPathwayRecommendation(
        userProfile,
        learningPathwayType,
        learningObjective
      );

      // Create personalized learning pathway record
      const personalizedLearningPathway = await this.prisma.personalizedLearningPathway.create({
        data: {
          userId,
          learningPathwayType,
          learningObjective,
          pathwayDetails: JSON.stringify(learningPathwayRecommendation.pathwayDetails),
          skillProgressionMap: JSON.stringify(learningPathwayRecommendation.skillProgressionMap),
          recommendedResources: JSON.stringify(learningPathwayRecommendation.recommendedResources),
          learningMilestones: JSON.stringify(learningPathwayRecommendation.learningMilestones)
        }
      });

      // Update user's learning profile
      await this.updateUserLearningProfile(
        userId, 
        personalizedLearningPathway.id, 
        learningPathwayRecommendation
      );

      return {
        pathwayId: personalizedLearningPathway.id,
        learningPathwayType,
        learningObjective,
        learningPathwayRecommendation
      };
    } catch (error) {
      console.error('Personalized Learning Pathway Generation Error:', error);
      throw error;
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
      // Assess skill development progress
      const skillDevelopmentAssessment = await this.assessSkillDevelopment(
        userId,
        skillName,
        currentSkillLevel,
        learningActivities
      );

      // Create skill development tracking record
      const skillDevelopmentRecord = await this.prisma.skillDevelopmentTracking.create({
        data: {
          userId,
          skillName,
          currentSkillLevel,
          learningActivities: JSON.stringify(learningActivities),
          skillProgressAnalysis: JSON.stringify(skillDevelopmentAssessment.skillProgressAnalysis),
          recommendedNextSteps: JSON.stringify(skillDevelopmentAssessment.recommendedNextSteps)
        }
      });

      // Update user's skill development profile
      await this.updateUserSkillProfile(
        userId, 
        skillDevelopmentRecord.id, 
        skillDevelopmentAssessment
      );

      return {
        skillTrackingId: skillDevelopmentRecord.id,
        skillName,
        skillDevelopmentAssessment
      };
    } catch (error) {
      console.error('Skill Development Tracking Error:', error);
      throw error;
    }
  }

  // Learning Resource Recommendation
  async recommendLearningResources(
    userId: string,
    learningDomain: string,
    currentSkillLevel: SkillLevel
  ) {
    try {
      // Fetch user's learning profile and skill development history
      const userProfile = await this.fetchUserLearningProfile(userId);

      // Generate personalized learning resource recommendations
      const learningResourceRecommendations = await this.generateLearningResourceRecommendations(
        userProfile,
        learningDomain,
        currentSkillLevel
      );

      // Create learning resource recommendation record
      const resourceRecommendationRecord = await this.prisma.learningResourceRecommendation.create({
        data: {
          userId,
          learningDomain,
          currentSkillLevel,
          recommendedResources: JSON.stringify(learningResourceRecommendations),
          recommendationDate: new Date()
        }
      });

      return {
        recommendationId: resourceRecommendationRecord.id,
        learningDomain,
        learningResourceRecommendations
      };
    } catch (error) {
      console.error('Learning Resource Recommendation Error:', error);
      throw error;
    }
  }

  // Adaptive Learning Path Optimization
  async optimizeLearningPath(
    personalizedLearningPathwayId: string
  ) {
    try {
      // Fetch existing personalized learning pathway
      const learningPathway = await this.prisma.personalizedLearningPathway.findUnique({
        where: { id: personalizedLearningPathwayId },
        include: { user: true }
      });

      if (!learningPathway) {
        throw new Error('Personalized Learning Pathway not found');
      }

      // Analyze and optimize learning pathway
      const learningPathOptimization = await this.analyzeLearningPathwayEffectiveness(
        learningPathway
      );

      // Update learning pathway with optimization insights
      const optimizedLearningPathway = await this.prisma.personalizedLearningPathway.update({
        where: { id: personalizedLearningPathwayId },
        data: {
          pathwayOptimizationInsights: JSON.stringify(learningPathOptimization),
          optimizedPathwayDetails: JSON.stringify(learningPathOptimization.optimizedPathway)
        }
      });

      return {
        pathwayId: optimizedLearningPathway.id,
        learningPathOptimization
      };
    } catch (error) {
      console.error('Learning Path Optimization Error:', error);
      throw error;
    }
  }

  // Private Utility Methods
  private async fetchUserLearningProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        learningProfile: true,
        skillDevelopmentTracking: true,
        personalizedLearningPathways: true
      }
    });
  }

  private async generateLearningPathwayRecommendation(
    userProfile: any,
    learningPathwayType: LearningPathwayType,
    learningObjective: string
  ) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in personalized learning pathway design."
          },
          {
            role: "user",
            content: `Generate a comprehensive personalized learning pathway:
              - User Profile: ${JSON.stringify(userProfile)}
              - Learning Pathway Type: ${learningPathwayType}
              - Learning Objective: ${learningObjective}

              Provide a detailed recommendation for:
              1. Pathway Details
              2. Skill Progression Map
              3. Recommended Learning Resources
              4. Learning Milestones`
          }
        ]
      });

      const learningPathwayRecommendation = 
        aiResponse.choices[0].message.content || "No learning pathway recommendation available";

      return {
        pathwayDetails: this.extractPathwayDetails(learningPathwayRecommendation),
        skillProgressionMap: this.extractSkillProgressionMap(learningPathwayRecommendation),
        recommendedResources: this.extractRecommendedResources(learningPathwayRecommendation),
        learningMilestones: this.extractLearningMilestones(learningPathwayRecommendation)
      };
    } catch (error) {
      console.error('Learning Pathway Recommendation Error:', error);
      return {
        pathwayDetails: [],
        skillProgressionMap: [],
        recommendedResources: [],
        learningMilestones: []
      };
    }
  }

  private async updateUserLearningProfile(
    userId: string, 
    learningPathwayId: string, 
    learningPathwayRecommendation: any
  ) {
    await this.prisma.userLearningProfile.upsert({
      where: { userId },
      update: {
        personalLearningPathwayIds: {
          push: learningPathwayId
        },
        learningObjectives: {
          push: learningPathwayRecommendation.learningObjective
        }
      },
      create: {
        userId,
        personalLearningPathwayIds: [learningPathwayId],
        learningObjectives: [learningPathwayRecommendation.learningObjective]
      }
    });
  }

  private async assessSkillDevelopment(
    userId: string,
    skillName: string,
    currentSkillLevel: SkillLevel,
    learningActivities: any[]
  ) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in skill development assessment."
          },
          {
            role: "user",
            content: `Assess skill development progress:
              - User ID: ${userId}
              - Skill Name: ${skillName}
              - Current Skill Level: ${currentSkillLevel}
              - Learning Activities: ${JSON.stringify(learningActivities)}

              Provide a comprehensive skill progress analysis 
              and recommended next steps.`
          }
        ]
      });

      const skillDevelopmentAssessment = 
        aiResponse.choices[0].message.content || "No skill development assessment available";

      return {
        skillProgressAnalysis: this.extractSkillProgressAnalysis(skillDevelopmentAssessment),
        recommendedNextSteps: this.extractRecommendedNextSteps(skillDevelopmentAssessment)
      };
    } catch (error) {
      console.error('Skill Development Assessment Error:', error);
      return {
        skillProgressAnalysis: [],
        recommendedNextSteps: []
      };
    }
  }

  private async updateUserSkillProfile(
    userId: string, 
    skillTrackingId: string, 
    skillDevelopmentAssessment: any
  ) {
    await this.prisma.userSkillProfile.upsert({
      where: { userId },
      update: {
        skillTrackingIds: {
          push: skillTrackingId
        }
      },
      create: {
        userId,
        skillTrackingIds: [skillTrackingId]
      }
    });
  }

  private async generateLearningResourceRecommendations(
    userProfile: any,
    learningDomain: string,
    currentSkillLevel: SkillLevel
  ) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in personalized learning resource recommendation."
          },
          {
            role: "user",
            content: `Generate personalized learning resource recommendations:
              - User Profile: ${JSON.stringify(userProfile)}
              - Learning Domain: ${learningDomain}
              - Current Skill Level: ${currentSkillLevel}

              Provide diverse, high-quality learning resources 
              tailored to the user's learning profile and skill level.`
          }
        ]
      });

      const learningResourceRecommendations = 
        aiResponse.choices[0].message.content || "No learning resource recommendations available";

      return {
        onlineResources: this.extractResources(learningResourceRecommendations, 'Online'),
        academicResources: this.extractResources(learningResourceRecommendations, 'Academic'),
        practicalProjects: this.extractResources(learningResourceRecommendations, 'Practical Projects')
      };
    } catch (error) {
      console.error('Learning Resource Recommendations Error:', error);
      return {
        onlineResources: [],
        academicResources: [],
        practicalProjects: []
      };
    }
  }

  private async analyzeLearningPathwayEffectiveness(learningPathway: any) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in learning pathway optimization."
          },
          {
            role: "user",
            content: `Analyze and optimize learning pathway effectiveness:
              - Learning Pathway: ${JSON.stringify(learningPathway)}
              - User Profile: ${JSON.stringify(learningPathway.user)}

              Provide a comprehensive analysis of the current learning pathway, 
              identify potential improvements, and generate an optimized pathway.`
          }
        ]
      });

      const learningPathOptimization = 
        aiResponse.choices[0].message.content || "No learning pathway optimization available";

      return {
        effectivenessAnalysis: this.extractEffectivenessAnalysis(learningPathOptimization),
        optimizationRecommendations: this.extractOptimizationRecommendations(learningPathOptimization),
        optimizedPathway: this.extractOptimizedPathway(learningPathOptimization)
      };
    } catch (error) {
      console.error('Learning Pathway Optimization Error:', error);
      return {
        effectivenessAnalysis: [],
        optimizationRecommendations: [],
        optimizedPathway: []
      };
    }
  }

  // Advanced Extraction Utility Methods
  private extractPathwayDetails(text: string): string[] {
    const regex = /Pathway\s*Details:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(detail => detail.trim()).filter(Boolean)
      : [];
  }

  private extractSkillProgressionMap(text: string): string[] {
    const regex = /Skill\s*Progression\s*Map:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(skill => skill.trim()).filter(Boolean)
      : [];
  }

  private extractRecommendedResources(text: string): string[] {
    const regex = /Recommended\s*Resources:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(resource => resource.trim()).filter(Boolean)
      : [];
  }

  private extractLearningMilestones(text: string): string[] {
    const regex = /Learning\s*Milestones:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(milestone => milestone.trim()).filter(Boolean)
      : [];
  }

  private extractSkillProgressAnalysis(text: string): string[] {
    const regex = /Skill\s*Progress\s*Analysis:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(analysis => analysis.trim()).filter(Boolean)
      : [];
  }

  private extractRecommendedNextSteps(text: string): string[] {
    const regex = /Recommended\s*Next\s*Steps:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(step => step.trim()).filter(Boolean)
      : [];
  }

  private extractResources(text: string, category: string): string[] {
    const regex = new RegExp(`${category}\\s*Resources:\\s*(.+?)(?=\\n\\w+\\s*Resources:|$)`, 'is');
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(resource => resource.trim()).filter(Boolean)
      : [];
  }

  private extractEffectivenessAnalysis(text: string): string[] {
    const regex = /Effectiveness\s*Analysis:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(analysis => analysis.trim()).filter(Boolean)
      : [];
  }

  private extractOptimizationRecommendations(text: string): string[] {
    const regex = /Optimization\s*Recommendations:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(recommendation => recommendation.trim()).filter(Boolean)
      : [];
  }

  private extractOptimizedPathway(text: string): string[] {
    const regex = /Optimized\s*Pathway:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(pathway => pathway.trim()).filter(Boolean)
      : [];
  }
}
