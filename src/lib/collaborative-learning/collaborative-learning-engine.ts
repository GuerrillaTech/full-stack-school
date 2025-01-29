import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

export enum CollaborationMode {
  PEER_LEARNING = 'PEER_LEARNING',
  GROUP_PROJECT = 'GROUP_PROJECT',
  MENTORSHIP = 'MENTORSHIP',
  CROSS_DISCIPLINARY = 'CROSS_DISCIPLINARY',
  GLOBAL_CHALLENGE = 'GLOBAL_CHALLENGE'
}

export enum KnowledgeType {
  ACADEMIC = 'ACADEMIC',
  SKILL_BASED = 'SKILL_BASED',
  RESEARCH = 'RESEARCH',
  INNOVATION = 'INNOVATION',
  PROFESSIONAL_DEVELOPMENT = 'PROFESSIONAL_DEVELOPMENT'
}

export class CollaborativeLearningEngine {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // Advanced Collaborative Learning Group Formation
  async formCollaborativeLearningGroups(
    learningObjective: string, 
    collaborationMode: CollaborationMode,
    participantIds: string[]
  ) {
    try {
      // Fetch comprehensive participant profiles
      const participantProfiles = await Promise.all(
        participantIds.map(
          id => this.fetchParticipantProfile(id)
        )
      );

      // AI-powered group formation analysis
      const groupFormationRecommendation = await this.generateGroupFormationRecommendation(
        learningObjective,
        collaborationMode,
        participantProfiles
      );

      // Create collaborative learning group
      const collaborativeLearningGroup = await this.prisma.collaborativeLearningGroup.create({
        data: {
          learningObjective,
          collaborationMode,
          participants: {
            connect: participantIds.map(id => ({ id }))
          },
          groupDynamics: JSON.stringify(groupFormationRecommendation.groupDynamics),
          learningPathway: JSON.stringify(groupFormationRecommendation.learningPathway)
        }
      });

      return {
        groupId: collaborativeLearningGroup.id,
        learningObjective,
        collaborationMode,
        groupFormationRecommendation
      };
    } catch (error) {
      console.error('Collaborative Learning Group Formation Error:', error);
      throw error;
    }
  }

  // Knowledge Sharing and Contribution Tracking
  async trackKnowledgeContribution(
    userId: string, 
    knowledgeType: KnowledgeType, 
    contributionDetails: {
      title: string;
      description: string;
      tags: string[];
      resourceLinks?: string[];
    }
  ) {
    try {
      // Analyze knowledge contribution quality
      const contributionQualityAssessment = await this.assessKnowledgeContribution(
        userId,
        knowledgeType,
        contributionDetails
      );

      // Create knowledge contribution record
      const knowledgeContribution = await this.prisma.knowledgeContribution.create({
        data: {
          userId,
          knowledgeType,
          title: contributionDetails.title,
          description: contributionDetails.description,
          tags: contributionDetails.tags,
          resourceLinks: contributionDetails.resourceLinks || [],
          qualityScore: contributionQualityAssessment.qualityScore,
          impactAnalysis: JSON.stringify(contributionQualityAssessment.impactAnalysis)
        }
      });

      // Update user's knowledge contribution profile
      await this.updateUserKnowledgeProfile(
        userId, 
        knowledgeContribution.id, 
        contributionQualityAssessment
      );

      return {
        contributionId: knowledgeContribution.id,
        qualityAssessment: contributionQualityAssessment
      };
    } catch (error) {
      console.error('Knowledge Contribution Tracking Error:', error);
      throw error;
    }
  }

  // Collaborative Learning Progress Tracking
  async trackCollaborativeLearningProgress(groupId: string) {
    try {
      // Fetch collaborative learning group details
      const learningGroup = await this.prisma.collaborativeLearningGroup.findUnique({
        where: { id: groupId },
        include: { 
          participants: true,
          knowledgeContributions: true 
        }
      });

      if (!learningGroup) {
        throw new Error('Collaborative Learning Group not found');
      }

      // Analyze group learning progress
      const progressAnalysis = await this.analyzeGroupLearningProgress(
        learningGroup
      );

      // Update group learning progress
      const updatedLearningGroup = await this.prisma.collaborativeLearningGroup.update({
        where: { id: groupId },
        data: {
          progressTracking: JSON.stringify(progressAnalysis),
          status: progressAnalysis.recommendedStatus
        }
      });

      return {
        groupId,
        progressAnalysis,
        updatedStatus: updatedLearningGroup.status
      };
    } catch (error) {
      console.error('Collaborative Learning Progress Tracking Error:', error);
      throw error;
    }
  }

  // Intelligent Knowledge Recommendation
  async recommendKnowledgeResources(
    userId: string, 
    learningObjective: string
  ) {
    try {
      // Fetch user's learning profile and knowledge contributions
      const userProfile = await this.fetchParticipantProfile(userId);

      // AI-powered knowledge resource recommendation
      const knowledgeRecommendations = await this.generateKnowledgeRecommendations(
        userProfile,
        learningObjective
      );

      // Log knowledge recommendation
      await this.prisma.knowledgeRecommendation.create({
        data: {
          userId,
          learningObjective,
          recommendedResources: JSON.stringify(knowledgeRecommendations),
          recommendationDate: new Date()
        }
      });

      return {
        userId,
        learningObjective,
        knowledgeRecommendations
      };
    } catch (error) {
      console.error('Knowledge Resource Recommendation Error:', error);
      throw error;
    }
  }

  // Private Utility Methods
  private async fetchParticipantProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        learningProfile: true,
        knowledgeContributions: true,
        performanceMetrics: true
      }
    });
  }

  private async generateGroupFormationRecommendation(
    learningObjective: string,
    collaborationMode: CollaborationMode,
    participantProfiles: any[]
  ) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in collaborative learning group formation."
          },
          {
            role: "user",
            content: `Generate an optimal collaborative learning group formation strategy:
              - Learning Objective: ${learningObjective}
              - Collaboration Mode: ${collaborationMode}
              - Participant Profiles: ${JSON.stringify(participantProfiles)}

              Provide a detailed recommendation for group composition, 
              interaction dynamics, and learning pathway.`
          }
        ]
      });

      const groupFormationRecommendation = 
        aiResponse.choices[0].message.content || "No group formation recommendation available";

      return {
        groupDynamics: this.extractGroupDynamics(groupFormationRecommendation),
        learningPathway: this.extractLearningPathway(groupFormationRecommendation)
      };
    } catch (error) {
      console.error('Group Formation Recommendation Error:', error);
      return {
        groupDynamics: [],
        learningPathway: []
      };
    }
  }

  private async assessKnowledgeContribution(
    userId: string,
    knowledgeType: KnowledgeType,
    contributionDetails: any
  ) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in knowledge contribution assessment."
          },
          {
            role: "user",
            content: `Assess the quality and potential impact of a knowledge contribution:
              - User ID: ${userId}
              - Knowledge Type: ${knowledgeType}
              - Contribution Details: ${JSON.stringify(contributionDetails)}

              Provide a comprehensive quality assessment and 
              potential impact analysis.`
          }
        ]
      });

      const contributionAssessment = 
        aiResponse.choices[0].message.content || "No contribution assessment available";

      return {
        qualityScore: this.extractQualityScore(contributionAssessment),
        impactAnalysis: this.extractImpactAnalysis(contributionAssessment)
      };
    } catch (error) {
      console.error('Knowledge Contribution Assessment Error:', error);
      return {
        qualityScore: 0,
        impactAnalysis: []
      };
    }
  }

  private async updateUserKnowledgeProfile(
    userId: string, 
    contributionId: string, 
    contributionQualityAssessment: any
  ) {
    await this.prisma.userKnowledgeProfile.upsert({
      where: { userId },
      update: {
        totalContributions: { increment: 1 },
        cumulativeQualityScore: { 
          increment: contributionQualityAssessment.qualityScore 
        },
        contributionIds: {
          push: contributionId
        }
      },
      create: {
        userId,
        totalContributions: 1,
        cumulativeQualityScore: contributionQualityAssessment.qualityScore,
        contributionIds: [contributionId]
      }
    });
  }

  private async analyzeGroupLearningProgress(learningGroup: any) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in collaborative learning progress analysis."
          },
          {
            role: "user",
            content: `Analyze collaborative learning group progress:
              - Learning Objective: ${learningGroup.learningObjective}
              - Collaboration Mode: ${learningGroup.collaborationMode}
              - Participants: ${JSON.stringify(learningGroup.participants)}
              - Knowledge Contributions: ${JSON.stringify(learningGroup.knowledgeContributions)}

              Provide a comprehensive progress analysis, 
              effectiveness assessment, and recommended next steps.`
          }
        ]
      });

      const progressAnalysis = 
        aiResponse.choices[0].message.content || "No progress analysis available";

      return {
        progressPercentage: this.calculateProgressPercentage(progressAnalysis),
        effectivenessScore: this.calculateEffectivenessScore(progressAnalysis),
        recommendedStatus: this.determineGroupStatus(progressAnalysis),
        detailedAnalysis: progressAnalysis
      };
    } catch (error) {
      console.error('Group Learning Progress Analysis Error:', error);
      return {
        progressPercentage: 0,
        effectivenessScore: 0,
        recommendedStatus: 'NEEDS_REVIEW',
        detailedAnalysis: 'Unable to complete group learning progress analysis'
      };
    }
  }

  private async generateKnowledgeRecommendations(
    userProfile: any, 
    learningObjective: string
  ) {
    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert knowledge recommendation specialist."
          },
          {
            role: "user",
            content: `Generate personalized knowledge resource recommendations:
              - User Profile: ${JSON.stringify(userProfile)}
              - Learning Objective: ${learningObjective}

              Provide targeted, diverse, and high-quality 
              knowledge resources aligned with the learning objective.`
          }
        ]
      });

      const knowledgeRecommendations = 
        aiResponse.choices[0].message.content || "No knowledge recommendations available";

      return {
        academicResources: this.extractResources(knowledgeRecommendations, 'Academic'),
        skillDevelopmentResources: this.extractResources(knowledgeRecommendations, 'Skill Development'),
        innovationResources: this.extractResources(knowledgeRecommendations, 'Innovation')
      };
    } catch (error) {
      console.error('Knowledge Recommendations Generation Error:', error);
      return {
        academicResources: [],
        skillDevelopmentResources: [],
        innovationResources: []
      };
    }
  }

  // Advanced Extraction and Scoring Utility Methods
  private extractGroupDynamics(text: string): string[] {
    const regex = /Group\s*Dynamics:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(dynamic => dynamic.trim()).filter(Boolean)
      : [];
  }

  private extractLearningPathway(text: string): string[] {
    const regex = /Learning\s*Pathway:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(pathway => pathway.trim()).filter(Boolean)
      : [];
  }

  private extractQualityScore(text: string): number {
    const match = text.match(/Quality\s*Score:\s*(\d+(\.\d+)?)/i);
    return match ? parseFloat(match[1]) / 10 : 0;
  }

  private extractImpactAnalysis(text: string): string[] {
    const regex = /Impact\s*Analysis:\s*(.+?)(?=\n\w+:|$)/is;
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(impact => impact.trim()).filter(Boolean)
      : [];
  }

  private extractResources(text: string, category: string): string[] {
    const regex = new RegExp(`${category}\\s*Resources:\\s*(.+?)(?=\\n\\w+\\s*Resources:|$)`, 'is');
    const match = text.match(regex);
    return match 
      ? match[1].split('\n').map(resource => resource.trim()).filter(Boolean)
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

  private determineGroupStatus(analysisText: string): string {
    if (analysisText.match(/Highly\s*Effective/i)) return 'SUCCESSFUL';
    if (analysisText.match(/Needs\s*Adjustment/i)) return 'NEEDS_MODIFICATION';
    if (analysisText.match(/Critical\s*Intervention\s*Required/i)) return 'CRITICAL_REVIEW';
    return 'IN_PROGRESS';
  }
}
