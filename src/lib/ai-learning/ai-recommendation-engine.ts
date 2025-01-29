import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

export enum RecommendationType {
  COURSE = 'COURSE',
  RESOURCE = 'RESOURCE',
  MENTOR = 'MENTOR',
  INTERVENTION = 'INTERVENTION'
}

export interface LearningRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  confidence: number;
  relevanceScore: number;
  tags: string[];
}

export class AIRecommendationEngine {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
  }

  // Advanced AI-Powered Learning Recommendation
  async generateRecommendations(studentId: string): Promise<LearningRecommendation[]> {
    try {
      // Fetch comprehensive student profile
      const studentProfile = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          academicRecords: true,
          learningStyles: true,
          performanceMetrics: true
        }
      });

      if (!studentProfile) {
        throw new Error('Student profile not found');
      }

      // AI-Enhanced Recommendation Generation
      const recommendationPrompt = this.constructRecommendationPrompt(studentProfile);
      
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational AI advisor specializing in personalized learning recommendations. 
            Provide highly tailored, strategic learning recommendations based on a student's comprehensive profile.`
          },
          {
            role: 'user',
            content: recommendationPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const recommendationsJson = JSON.parse(
        aiResponse.choices[0].message.content || '[]'
      );

      // Transform AI recommendations into structured format
      return recommendationsJson.map((rec: any, index: number) => ({
        id: `rec_${studentId}_${index}`,
        type: rec.type || RecommendationType.COURSE,
        title: rec.title,
        description: rec.description,
        confidence: rec.confidence || 0.8,
        relevanceScore: rec.relevanceScore || 0.75,
        tags: rec.tags || []
      }));

    } catch (error) {
      console.error('AI Recommendation Generation Error:', error);
      return [];
    }
  }

  // Construct detailed prompt for AI recommendation
  private constructRecommendationPrompt(studentProfile: any): string {
    return `
      Student Profile Analysis for Personalized Learning Recommendations:

      Academic Performance:
      - Current Grade Level: ${studentProfile.gradeLevel}
      - GPA: ${studentProfile.academicRecords.gpa}
      - Strongest Subjects: ${studentProfile.academicRecords.strongSubjects.join(', ')}
      - Challenging Subjects: ${studentProfile.academicRecords.weakSubjects.join(', ')}

      Learning Styles:
      - Primary Learning Style: ${studentProfile.learningStyles.primaryStyle}
      - Secondary Learning Style: ${studentProfile.learningStyles.secondaryStyle}
      - Preferred Learning Modalities: ${studentProfile.learningStyles.preferredModalities.join(', ')}

      Performance Metrics:
      - Engagement Score: ${studentProfile.performanceMetrics.engagementScore}
      - Progress Velocity: ${studentProfile.performanceMetrics.progressVelocity}
      - Skill Acquisition Rate: ${studentProfile.performanceMetrics.skillAcquisitionRate}

      Recommendation Request:
      Generate 5-7 highly personalized learning recommendations that:
      1. Address academic growth areas
      2. Align with student's learning styles
      3. Provide strategic skill development opportunities
      4. Include diverse learning resources and interventions

      Response Format (JSON):
      [{
        "type": "COURSE|RESOURCE|MENTOR|INTERVENTION",
        "title": "Recommendation Title",
        "description": "Detailed recommendation description",
        "confidence": 0.0-1.0,
        "relevanceScore": 0.0-1.0,
        "tags": ["tag1", "tag2"]
      }]
    `;
  }

  // Recommendation Tracking and Feedback Loop
  async trackRecommendationEffectiveness(studentId: string, recommendationId: string, outcome: 'COMPLETED' | 'PARTIAL' | 'ABANDONED') {
    try {
      await this.prisma.recommendationTracking.create({
        data: {
          studentId,
          recommendationId,
          outcome,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Recommendation Tracking Error:', error);
    }
  }
}
