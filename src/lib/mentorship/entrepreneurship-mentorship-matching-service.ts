import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import * as tf from '@tensorflow/tfjs-node';
import { z } from 'zod';
import * as natural from 'natural';
import * as similarity from 'compute-cosine-similarity';

// Entrepreneurship Domain Categories
export enum EntrepreneurshipDomain {
  TECH_INNOVATION = 'TECH_INNOVATION',
  SOCIAL_ENTREPRENEURSHIP = 'SOCIAL_ENTREPRENEURSHIP',
  GREEN_TECH = 'GREEN_TECH',
  FINTECH = 'FINTECH',
  EDTECH = 'EDTECH',
  HEALTHTECH = 'HEALTHTECH',
  AI_ML = 'AI_ML',
  BLOCKCHAIN = 'BLOCKCHAIN',
  E_COMMERCE = 'E_COMMERCE',
  BIOTECH = 'BIOTECH'
}

// Mentorship Matching Complexity
export enum MatchingComplexity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  ADVANCED = 'ADVANCED'
}

// Mentorship Profile Schema
const MentorshipProfileSchema = z.object({
  userId: z.string(),
  role: z.enum(['MENTOR', 'MENTEE']),
  domain: z.nativeEnum(EntrepreneurshipDomain),
  skills: z.array(z.string()),
  experience: z.number().min(0).max(50),
  achievements: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  personalityTraits: z.array(z.string()).optional()
});

export class EntrepreneurshipMentorshipMatchingService {
  private prisma: PrismaClient;
  private openai: OpenAI;
  private nlp: typeof natural.BayesClassifier;
  private embeddingModel: tf.LayersModel;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });

    // Initialize NLP Classifier
    this.nlp = new natural.BayesClassifier();

    // Load Embedding Model for Advanced Matching
    this.loadEmbeddingModel();
  }

  // Load Advanced Embedding Model
  private async loadEmbeddingModel() {
    this.embeddingModel = await tf.loadLayersModel(
      'file://./models/entrepreneurship_embedding_model.json'
    );
  }

  // Create Mentorship Profile
  async createMentorshipProfile(
    profileData: z.infer<typeof MentorshipProfileSchema>
  ) {
    const validatedProfile = MentorshipProfileSchema.parse(profileData);

    // Create Profile in Database
    const mentorshipProfile = await this.prisma.mentorshipProfile.create({
      data: {
        ...validatedProfile,
        skills: validatedProfile.skills.join(','),
        achievements: validatedProfile.achievements?.join(','),
        goals: validatedProfile.goals?.join(','),
        personalityTraits: validatedProfile.personalityTraits?.join(',')
      }
    });

    // Generate Embedding Vector
    const embeddingVector = await this.generateProfileEmbedding(mentorshipProfile);

    // Update Profile with Embedding
    await this.prisma.mentorshipProfile.update({
      where: { id: mentorshipProfile.id },
      data: { embeddingVector: JSON.stringify(embeddingVector) }
    });

    return mentorshipProfile;
  }

  // Generate Profile Embedding
  private async generateProfileEmbedding(profile: any): Promise<number[]> {
    const embeddingInput = JSON.stringify({
      domain: profile.domain,
      skills: profile.skills,
      experience: profile.experience,
      achievements: profile.achievements,
      goals: profile.goals,
      personalityTraits: profile.personalityTraits
    });

    // Use OpenAI Embedding for Advanced Representation
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: embeddingInput
    });

    return embeddingResponse.data[0].embedding;
  }

  // Advanced Mentorship Matching Algorithm
  async findMentorshipMatches(
    menteeProfileId: string,
    matchingComplexity: MatchingComplexity = MatchingComplexity.MEDIUM
  ) {
    const menteeProfile = await this.prisma.mentorshipProfile.findUnique({
      where: { id: menteeProfileId, role: 'MENTEE' }
    });

    if (!menteeProfile) {
      throw new Error('Mentee profile not found');
    }

    // Retrieve Potential Mentor Profiles
    const potentialMentors = await this.prisma.mentorshipProfile.findMany({
      where: {
        role: 'MENTOR',
        domain: menteeProfile.domain
      }
    });

    // Calculate Matching Scores
    const mentorMatches = await Promise.all(
      potentialMentors.map(async (mentor) => {
        const matchScore = await this.calculateMentorshipMatchScore(
          menteeProfile, 
          mentor, 
          matchingComplexity
        );

        return {
          mentor,
          matchScore
        };
      })
    );

    // Sort Matches by Score
    const sortedMatches = mentorMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Top 10 matches

    // AI-Enhanced Matching Insights
    const matchingInsights = await this.generateMatchingInsights(
      menteeProfile, 
      sortedMatches
    );

    return {
      menteeProfile,
      matches: sortedMatches,
      matchingInsights
    };
  }

  // Calculate Mentorship Match Score
  private async calculateMentorshipMatchScore(
    menteeProfile: any, 
    mentorProfile: any,
    complexity: MatchingComplexity
  ): Promise<number> {
    const menteeEmbedding = JSON.parse(menteeProfile.embeddingVector);
    const mentorEmbedding = JSON.parse(mentorProfile.embeddingVector);

    // Cosine Similarity for Embedding Matching
    const embeddingSimilarity = similarity(menteeEmbedding, mentorEmbedding);

    // Domain Expertise Match
    const domainMatch = menteeProfile.domain === mentorProfile.domain ? 1 : 0;

    // Skills Overlap
    const menteeSkills = menteeProfile.skills.split(',');
    const mentorSkills = mentorProfile.skills.split(',');
    const skillsOverlap = menteeSkills
      .filter(skill => mentorSkills.includes(skill)).length / menteeSkills.length;

    // Experience Complementarity
    const experienceComplementarity = 1 - Math.abs(
      menteeProfile.experience - mentorProfile.experience
    ) / 50;

    // Advanced Matching Based on Complexity
    let complexityFactor = 1;
    switch (complexity) {
      case MatchingComplexity.LOW:
        complexityFactor = 0.5;
        break;
      case MatchingComplexity.MEDIUM:
        complexityFactor = 0.75;
        break;
      case MatchingComplexity.HIGH:
        complexityFactor = 1;
        break;
      case MatchingComplexity.ADVANCED:
        complexityFactor = 1.25;
        break;
    }

    // Weighted Match Score Calculation
    const matchScore = (
      embeddingSimilarity * 0.4 +
      domainMatch * 0.2 +
      skillsOverlap * 0.2 +
      experienceComplementarity * 0.2
    ) * complexityFactor;

    return matchScore;
  }

  // Generate AI-Enhanced Matching Insights
  private async generateMatchingInsights(
    menteeProfile: any, 
    matches: any[]
  ) {
    const matchingInsightsPrompt = `
      Analyze entrepreneurship mentorship matching insights:

      Mentee Profile:
      ${JSON.stringify(menteeProfile, null, 2)}

      Top Mentor Matches:
      ${JSON.stringify(matches, null, 2)}

      Generate comprehensive insights on:
      - Mentorship potential and compatibility
      - Skill and knowledge transfer opportunities
      - Potential collaboration areas
      - Growth and development recommendations
      - Psychological and personality alignment
    `;

    const aiMatchingInsights = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in entrepreneurship mentorship matching and career development.'
        },
        {
          role: 'user',
          content: matchingInsightsPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024
    });

    return JSON.parse(
      aiMatchingInsights.choices[0].message.content || '{}'
    );
  }

  // Mentorship Connection Recommendation
  async recommendMentorshipConnection(
    menteeProfileId: string, 
    mentorProfileId: string
  ) {
    const menteeProfile = await this.prisma.mentorshipProfile.findUnique({
      where: { id: menteeProfileId }
    });

    const mentorProfile = await this.prisma.mentorshipProfile.findUnique({
      where: { id: mentorProfileId }
    });

    if (!menteeProfile || !mentorProfile) {
      throw new Error('Profile not found');
    }

    // Create Mentorship Connection
    const mentorshipConnection = await this.prisma.mentorshipConnection.create({
      data: {
        menteeId: menteeProfileId,
        mentorId: mentorProfileId,
        status: 'PENDING'
      }
    });

    // Generate Connection Recommendation Insights
    const connectionRecommendationPrompt = `
      Generate mentorship connection recommendation:

      Mentee Profile:
      ${JSON.stringify(menteeProfile, null, 2)}

      Mentor Profile:
      ${JSON.stringify(mentorProfile, null, 2)}

      Provide insights on:
      - Initial meeting agenda
      - Learning objectives
      - Potential collaboration strategies
      - Communication guidelines
      - Expected outcomes and milestones
    `;

    const aiConnectionRecommendation = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in entrepreneurship mentorship and career development strategies.'
        },
        {
          role: 'user',
          content: connectionRecommendationPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024
    });

    const connectionRecommendation = JSON.parse(
      aiConnectionRecommendation.choices[0].message.content || '{}'
    );

    // Update Mentorship Connection with Recommendation
    await this.prisma.mentorshipConnection.update({
      where: { id: mentorshipConnection.id },
      data: {
        connectionRecommendation: JSON.stringify(connectionRecommendation)
      }
    });

    return {
      mentorshipConnection,
      connectionRecommendation
    };
  }

  // Mentorship Progress Tracking
  async trackMentorshipProgress(
    mentorshipConnectionId: string
  ) {
    const mentorshipConnection = await this.prisma.mentorshipConnection.findUnique({
      where: { id: mentorshipConnectionId },
      include: {
        mentee: true,
        mentor: true
      }
    });

    if (!mentorshipConnection) {
      throw new Error('Mentorship connection not found');
    }

    // Generate Progress Tracking Insights
    const progressTrackingPrompt = `
      Analyze mentorship connection progress:

      Mentorship Connection:
      ${JSON.stringify(mentorshipConnection, null, 2)}

      Evaluate and provide insights on:
      - Learning progress and skill development
      - Goal achievement and milestone tracking
      - Challenges and opportunities
      - Psychological and professional growth
      - Recommendations for continued development
    `;

    const aiProgressTracking = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in entrepreneurship mentorship progress tracking and career development.'
        },
        {
          role: 'user',
          content: progressTrackingPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024
    });

    const progressTracking = JSON.parse(
      aiProgressTracking.choices[0].message.content || '{}'
    );

    // Update Mentorship Connection with Progress Tracking
    await this.prisma.mentorshipConnection.update({
      where: { id: mentorshipConnectionId },
      data: {
        progressTracking: JSON.stringify(progressTracking)
      }
    });

    return {
      mentorshipConnection,
      progressTracking
    };
  }
}
