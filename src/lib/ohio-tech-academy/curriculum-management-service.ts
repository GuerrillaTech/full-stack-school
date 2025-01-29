import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';

// Zod Schemas for Type Safety
const CurriculumSchema = z.object({
  title: z.string(),
  code: z.string().unique(),
  type: z.enum([
    'ACADEMIC', 'VOCATIONAL', 'PROFESSIONAL_DEVELOPMENT', 
    'STEM', 'ARTS', 'HUMANITIES', 'INTERDISCIPLINARY'
  ]),
  department: z.string(),
  academicLevel: z.string(),
  description: z.string().optional(),
  
  // Curriculum Lifecycle
  status: z.enum([
    'DRAFT', 'UNDER_REVIEW', 
    'APPROVED', 'ACTIVE', 'ARCHIVED'
  ]).default('DRAFT'),
  
  // Metadata
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  
  // Performance Metrics
  studentEnrollmentCount: z.number().int().optional(),
  successRate: z.number().min(0).max(100).optional()
});

const CourseSchema = z.object({
  title: z.string(),
  code: z.string().unique(),
  curriculumId: z.string(),
  description: z.string().optional(),
  
  // Course Metadata
  creditHours: z.number().positive(),
  deliveryMode: z.enum([
    'IN_PERSON', 'ONLINE', 'HYBRID', 
    'SELF_PACED', 'COHORT_BASED'
  ]),
  
  // Temporal Details
  startDate: z.date(),
  endDate: z.date(),
  
  // Instructional Design
  learningObjectives: z.array(z.string()),
  prerequisites: z.array(z.string()).optional(),
  
  // Resource Allocation
  instructors: z.array(z.string()),
  recommendedResources: z.array(z.string()).optional()
});

const LearningOutcomeSchema = z.object({
  curriculumId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  
  // Categorization
  category: z.enum([
    'KNOWLEDGE', 'SKILLS', 'COMPETENCIES', 
    'ATTITUDES', 'PROFESSIONAL_BEHAVIORS'
  ]),
  
  // Measurable Criteria
  performanceIndicators: z.array(z.string()),
  assessmentMethods: z.array(z.string())
});

export class CurriculumManagementService {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
  }

  // Create Curriculum
  async createCurriculum(
    curriculumData: z.infer<typeof CurriculumSchema>
  ): Promise<z.infer<typeof CurriculumSchema>> {
    const validatedCurriculum = CurriculumSchema.parse(curriculumData);

    // AI-Enhanced Curriculum Design
    const curriculumDesignPrompt = `
      Design a comprehensive curriculum:
      
      Curriculum Details:
      - Title: ${validatedCurriculum.title}
      - Type: ${validatedCurriculum.type}
      - Department: ${validatedCurriculum.department}
      
      Analyze and recommend:
      - Curriculum structure
      - Learning objectives
      - Potential learning outcomes
      - Interdisciplinary connections
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert curriculum design specialist.'
          },
          {
            role: 'user',
            content: curriculumDesignPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const aiCurriculumInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const curriculumWithInsights = {
        ...validatedCurriculum,
        keywords: [
          ...(validatedCurriculum.keywords || []),
          ...(aiCurriculumInsights.suggestedKeywords || [])
        ],
        aiGeneratedInsights: aiCurriculumInsights
      };

      return await this.prisma.curriculum.create({
        data: curriculumWithInsights as any
      });
    } catch (error) {
      console.error('Curriculum Creation Error:', error);
      throw error;
    }
  }

  // Add Course to Curriculum
  async addCourseToCurriculum(
    courseData: z.infer<typeof CourseSchema>
  ): Promise<z.infer<typeof CourseSchema>> {
    const validatedCourse = CourseSchema.parse(courseData);

    // AI-Enhanced Course Design
    const courseDesignPrompt = `
      Design an advanced course:
      
      Course Details:
      - Title: ${validatedCourse.title}
      - Delivery Mode: ${validatedCourse.deliveryMode}
      - Credit Hours: ${validatedCourse.creditHours}
      
      Analyze and recommend:
      - Learning objectives alignment
      - Instructional strategies
      - Resource recommendations
      - Potential learning challenges
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert course design specialist.'
          },
          {
            role: 'user',
            content: courseDesignPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const aiCourseInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const courseWithInsights = {
        ...validatedCourse,
        learningObjectives: [
          ...(validatedCourse.learningObjectives || []),
          ...(aiCourseInsights.additionalLearningObjectives || [])
        ],
        recommendedResources: [
          ...(validatedCourse.recommendedResources || []),
          ...(aiCourseInsights.suggestedResources || [])
        ],
        difficultyLevel: aiCourseInsights.recommendedDifficultyLevel,
        adaptiveLearningScore: Math.random() * 100
      };

      return await this.prisma.course.create({
        data: courseWithInsights as any
      });
    } catch (error) {
      console.error('Course Creation Error:', error);
      throw error;
    }
  }

  // Define Learning Outcomes
  async defineLearningOutcomes(
    learningOutcomeData: z.infer<typeof LearningOutcomeSchema>
  ): Promise<z.infer<typeof LearningOutcomeSchema>> {
    const validatedLearningOutcome = LearningOutcomeSchema.parse(
      learningOutcomeData
    );

    // AI-Enhanced Learning Outcome Design
    const learningOutcomePrompt = `
      Design comprehensive learning outcomes:
      
      Outcome Details:
      - Title: ${validatedLearningOutcome.title}
      - Category: ${validatedLearningOutcome.category}
      
      Analyze and recommend:
      - Performance indicators
      - Assessment methods
      - Competency alignment
      - Potential learning gaps
    `;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning outcomes specialist.'
          },
          {
            role: 'user',
            content: learningOutcomePrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const aiLearningOutcomeInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      const learningOutcomeWithInsights = {
        ...validatedLearningOutcome,
        performanceIndicators: [
          ...(validatedLearningOutcome.performanceIndicators || []),
          ...(aiLearningOutcomeInsights.additionalPerformanceIndicators || [])
        ],
        assessmentMethods: [
          ...(validatedLearningOutcome.assessmentMethods || []),
          ...(aiLearningOutcomeInsights.suggestedAssessmentMethods || [])
        ],
        alignedCompetencies: aiLearningOutcomeInsights.alignedCompetencies || []
      };

      return await this.prisma.learningOutcome.create({
        data: learningOutcomeWithInsights as any
      });
    } catch (error) {
      console.error('Learning Outcome Creation Error:', error);
      throw error;
    }
  }

  // Enroll Student in Course
  async enrollStudentInCourse(
    studentId: string, 
    courseId: string
  ) {
    try {
      return await this.prisma.studentCourseEnrollment.create({
        data: {
          studentId,
          courseId,
          status: 'ACTIVE'
        }
      });
    } catch (error) {
      console.error('Student Course Enrollment Error:', error);
      throw error;
    }
  }

  // Create Course Assessment
  async createCourseAssessment(
    courseId: string,
    assessmentData: {
      title: string;
      type: string;
      scheduledDate: Date;
      maximumScore: number;
      passingThreshold: number;
    }
  ) {
    try {
      return await this.prisma.courseAssessment.create({
        data: {
          courseId,
          ...assessmentData
        }
      });
    } catch (error) {
      console.error('Course Assessment Creation Error:', error);
      throw error;
    }
  }

  // Record Student Assessment
  async recordStudentAssessment(
    studentId: string,
    assessmentId: string,
    assessmentData: {
      score: number;
      feedback?: string;
    }
  ) {
    try {
      const { score } = assessmentData;
      const assessment = await this.prisma.courseAssessment.findUnique({
        where: { id: assessmentId }
      });

      if (!assessment) {
        throw new Error('Assessment not found');
      }

      const percentageScore = (score / assessment.maximumScore) * 100;

      // AI-Enhanced Performance Analysis
      const performanceAnalysisPrompt = `
        Analyze student assessment performance:
        
        Assessment Details:
        - Score: ${score}
        - Maximum Score: ${assessment.maximumScore}
        - Percentage: ${percentageScore}%
        
        Generate:
        - Performance category
        - Improvement recommendations
      `;

      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert student performance analyst.'
          },
          {
            role: 'user',
            content: performanceAnalysisPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 512
      });

      const aiPerformanceInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      return await this.prisma.studentAssessment.create({
        data: {
          studentId,
          assessmentId,
          score,
          percentageScore,
          feedback: assessmentData.feedback,
          performanceCategory: aiPerformanceInsights.performanceCategory,
          improvementRecommendations: 
            aiPerformanceInsights.improvementRecommendations || []
        }
      });
    } catch (error) {
      console.error('Student Assessment Recording Error:', error);
      throw error;
    }
  }

  // Get Curriculum Performance Insights
  async getCurriculumPerformanceInsights(curriculumId: string) {
    try {
      const curriculum = await this.prisma.curriculum.findUnique({
        where: { id: curriculumId },
        include: {
          courses: {
            include: {
              enrolledStudents: true,
              assessments: {
                include: {
                  studentAssessments: true
                }
              }
            }
          },
          learningOutcomes: true
        }
      });

      if (!curriculum) {
        throw new Error('Curriculum not found');
      }

      // AI-Enhanced Performance Insights
      const performanceInsightsPrompt = `
        Generate comprehensive curriculum performance insights:
        
        Curriculum: ${curriculum.title}
        Courses: ${curriculum.courses.length}
        Learning Outcomes: ${curriculum.learningOutcomes.length}
        
        Analyze:
        - Overall curriculum effectiveness
        - Learning outcome achievement
        - Student performance trends
        - Potential improvements
      `;

      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert curriculum performance analyst.'
          },
          {
            role: 'user',
            content: performanceInsightsPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024
      });

      const aiPerformanceInsights = JSON.parse(
        aiResponse.choices[0].message.content || '{}'
      );

      return {
        ...curriculum,
        aiGeneratedPerformanceInsights: aiPerformanceInsights
      };
    } catch (error) {
      console.error('Curriculum Performance Insights Error:', error);
      throw error;
    }
  }
}
