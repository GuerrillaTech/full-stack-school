import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';

// Research Domain Enums
export enum ResearchDomain {
  EDUCATION_TECHNOLOGY = 'EDUCATION_TECHNOLOGY',
  LEARNING_SCIENCES = 'LEARNING_SCIENCES',
  STUDENT_SUPPORT = 'STUDENT_SUPPORT',
  PEDAGOGICAL_INNOVATION = 'PEDAGOGICAL_INNOVATION',
  INTERDISCIPLINARY_STUDIES = 'INTERDISCIPLINARY_STUDIES'
}

export enum ResearchStatus {
  PROPOSAL = 'PROPOSAL',
  IN_PROGRESS = 'IN_PROGRESS',
  PEER_REVIEW = 'PEER_REVIEW',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED'
}

// Zod Schemas for Type Safety and Validation
const ResearchProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(10).max(250),
  domain: z.nativeEnum(ResearchDomain),
  abstract: z.string().min(50).max(1000),
  primaryResearchers: z.array(z.string()),
  studentContributors: z.array(z.string()).optional(),
  status: z.nativeEnum(ResearchStatus),
  fundingSource: z.string().optional(),
  expectedOutcomes: z.array(z.string()),
  methodologies: z.array(z.string()),
  ethicalConsiderations: z.array(z.string()).optional(),
  startDate: z.date(),
  expectedCompletionDate: z.date(),
  publishedPapers: z.array(z.object({
    title: z.string(),
    journalName: z.string(),
    publicationDate: z.date(),
    doi: z.string().optional()
  })).optional()
});

export class ResearchIntegrationService {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
  }

  // Comprehensive Research Project Creation
  async createResearchProject(
    projectData: z.infer<typeof ResearchProjectSchema>
  ): Promise<z.infer<typeof ResearchProjectSchema>> {
    // Validate input
    const validatedProject = ResearchProjectSchema.parse(projectData);

    // AI-Enhanced Project Validation
    await this.aiValidateResearchProject(validatedProject);

    // Create Research Project
    const createdProject = await this.prisma.researchProject.create({
      data: {
        ...validatedProject,
        primaryResearchers: {
          connect: validatedProject.primaryResearchers.map(id => ({ id }))
        },
        studentContributors: validatedProject.studentContributors 
          ? { 
              connect: validatedProject.studentContributors.map(id => ({ id })) 
            }
          : undefined
      }
    });

    // Generate Initial Research Roadmap
    const researchRoadmap = await this.generateResearchRoadmap(createdProject);

    return {
      ...createdProject,
      ...researchRoadmap
    };
  }

  // AI-Enhanced Research Project Validation
  private async aiValidateResearchProject(
    project: z.infer<typeof ResearchProjectSchema>
  ): Promise<void> {
    const validationPrompt = `
      Evaluate the research project proposal:
      
      Title: ${project.title}
      Domain: ${project.domain}
      Abstract: ${project.abstract}
      
      Assess:
      1. Research Novelty
      2. Methodological Rigor
      3. Potential Impact
      4. Ethical Considerations
      
      Provide a comprehensive evaluation and potential improvement suggestions.
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic research evaluator.'
          },
          {
            role: 'user',
            content: validationPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 1024
      });

      const validationResult = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      // Log or process validation insights
      console.log('Research Project AI Validation:', validationResult);
    } catch (error) {
      console.error('AI Validation Error:', error);
    }
  }

  // Research Roadmap Generation
  private async generateResearchRoadmap(
    project: any
  ): Promise<{
    researchRoadmap: any;
    milestones: any[];
  }> {
    const roadmapPrompt = `
      Generate a comprehensive research project roadmap:
      
      Project: ${project.title}
      Domain: ${project.domain}
      
      Create a detailed roadmap with:
      1. Key Research Phases
      2. Milestone Descriptions
      3. Expected Deliverables
      4. Resource Requirements
      
      Format as a structured JSON.
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert research project strategist.'
          },
          {
            role: 'user',
            content: roadmapPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      return JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );
    } catch (error) {
      console.error('Roadmap Generation Error:', error);
      return {
        researchRoadmap: {},
        milestones: []
      };
    }
  }

  // Interdisciplinary Research Matching
  async findInterdisciplinaryResearchOpportunities(
    studentId: string
  ): Promise<any[]> {
    // Fetch student's academic profile
    const studentProfile = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        academicRecords: true,
        learningProfile: true
      }
    });

    // AI-Powered Research Opportunity Matching
    const matchingPrompt = `
      Student Academic Profile:
      - Major: ${studentProfile.learningProfile.major}
      - Academic Interests: ${studentProfile.learningProfile.academicInterests}
      - Research Potential Score: ${studentProfile.learningProfile.researchPotential}
      
      Generate potential interdisciplinary research project opportunities
      that align with the student's academic background and interests.
      
      Format as a JSON array of research project suggestions.
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic research advisor.'
          },
          {
            role: 'user',
            content: matchingPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const researchOpportunities = JSON.parse(
        aiResponse.choices[0].message.content || '[]'
      );

      return researchOpportunities;
    } catch (error) {
      console.error('Research Opportunity Matching Error:', error);
      return [];
    }
  }

  // Research Impact and Collaboration Analysis
  async analyzeResearchImpact(
    timeframe: number = 12
  ): Promise<{
    totalProjects: number;
    domainDistribution: Record<ResearchDomain, number>;
    collaborationMetrics: {
      interdisciplinaryProjects: number;
      studentInvolvement: number;
      externalPartnerships: number;
    };
    publicationMetrics: {
      totalPublications: number;
      journalImpactFactors: number[];
    };
  }> {
    const researchProjects = await this.prisma.researchProject.findMany({
      where: {
        startDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - timeframe))
        }
      },
      include: {
        primaryResearchers: true,
        studentContributors: true,
        publishedPapers: true
      }
    });

    const domainDistribution: Record<ResearchDomain, number> = 
      Object.values(ResearchDomain).reduce((acc, domain) => {
        acc[domain] = 0;
        return acc;
      }, {} as Record<ResearchDomain, number>);

    let interdisciplinaryProjects = 0;
    let studentInvolvement = 0;
    let externalPartnerships = 0;

    researchProjects.forEach(project => {
      domainDistribution[project.domain]++;
      
      if (project.primaryResearchers.length > 1) {
        interdisciplinaryProjects++;
      }
      
      if (project.studentContributors.length > 0) {
        studentInvolvement += project.studentContributors.length;
      }
      
      if (project.fundingSource) {
        externalPartnerships++;
      }
    });

    const publicationMetrics = {
      totalPublications: researchProjects.reduce(
        (total, project) => total + (project.publishedPapers?.length || 0), 
        0
      ),
      journalImpactFactors: researchProjects
        .flatMap(project => 
          project.publishedPapers?.map(paper => paper.journalImpactFactor) || []
        )
    };

    return {
      totalProjects: researchProjects.length,
      domainDistribution,
      collaborationMetrics: {
        interdisciplinaryProjects,
        studentInvolvement,
        externalPartnerships
      },
      publicationMetrics
    };
  }

  // Research Collaboration Recommendation
  async recommendResearchCollaborations(
    researcherId: string
  ): Promise<any[]> {
    const researcher = await this.prisma.researcher.findUnique({
      where: { id: researcherId },
      include: {
        researchProjects: true,
        expertise: true
      }
    });

    const collaborationPrompt = `
      Researcher Profile:
      - Current Research Domains: ${researcher.researchProjects.map(p => p.domain).join(', ')}
      - Expertise Areas: ${researcher.expertise.map(e => e.area).join(', ')}
      
      Generate potential research collaboration opportunities
      that expand interdisciplinary research potential.
      
      Format as a JSON array of collaboration suggestions.
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert research collaboration matchmaker.'
          },
          {
            role: 'user',
            content: collaborationPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const collaborationSuggestions = JSON.parse(
        aiResponse.choices[0].message.content || '[]'
      );

      return collaborationSuggestions;
    } catch (error) {
      console.error('Research Collaboration Recommendation Error:', error);
      return [];
    }
  }
}
