import { PrismaClient } from '@prisma/client';

export class AcademyManager {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Curriculum Management
  async createCurriculum(params: {
    name: string;
    description: string;
    gradeLevel: number;
    subjects: string[];
  }) {
    return this.prisma.curriculum.create({
      data: {
        name: params.name,
        description: params.description,
        gradeLevel: params.gradeLevel,
        subjects: {
          connect: params.subjects.map(subject => ({ name: subject }))
        }
      }
    });
  }

  // Student Tracking and Progress
  async trackStudentProgress(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        results: {
          include: {
            exam: true,
            assignment: true
          }
        },
        attendances: true,
        class: true,
        grade: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Calculate academic metrics
    const academicMetrics = {
      averageScore: student.results.reduce((acc, result) => acc + result.score, 0) / student.results.length || 0,
      attendanceRate: this.calculateAttendanceRate(student.attendances),
      classPerformanceRank: await this.calculateClassRank(student)
    };

    return {
      student,
      academicMetrics
    };
  }

  private calculateAttendanceRate(attendances: any[]) {
    const totalClasses = attendances.length;
    const presentClasses = attendances.filter(a => a.present).length;
    return (presentClasses / totalClasses) * 100 || 0;
  }

  private async calculateClassRank(student: any) {
    const classStudents = await this.prisma.student.findMany({
      where: { classId: student.classId },
      include: { results: true }
    });

    const studentScores = classStudents.map(s => ({
      id: s.id,
      averageScore: s.results.reduce((acc, result) => acc + result.score, 0) / s.results.length || 0
    }));

    const sortedScores = studentScores.sort((a, b) => b.averageScore - a.averageScore);
    const rank = sortedScores.findIndex(s => s.id === student.id) + 1;

    return {
      rank,
      totalStudents: sortedScores.length
    };
  }

  // Advanced Learning Path Generation
  async generateLearningPath(studentId: string) {
    const studentProgress = await this.trackStudentProgress(studentId);
    
    // AI-powered learning path recommendation
    const recommendedSubjects = await this.recommendSubjects(studentProgress);

    return {
      currentPerformance: studentProgress.academicMetrics,
      recommendedLearningPath: recommendedSubjects
    };
  }

  private async recommendSubjects(studentProgress: any) {
    // Complex recommendation algorithm
    const weakSubjects = studentProgress.student.results
      .filter(result => result.score < 60)
      .map(result => result.exam?.lesson?.subject?.name || result.assignment?.lesson?.subject?.name);

    const recommendedInterventions = weakSubjects.map(subject => ({
      subject,
      recommendationType: 'REMEDIAL',
      suggestedResources: [
        `${subject} Tutoring`,
        `Supplementary ${subject} Materials`,
        `Personalized ${subject} Workshops`
      ]
    }));

    return recommendedInterventions;
  }

  // Scholarship and Support Program
  async identifyScholarshipCandidates() {
    const topStudents = await this.prisma.student.findMany({
      where: {
        results: {
          some: {
            score: { gte: 85 }
          }
        }
      },
      include: {
        results: true,
        class: true,
        grade: true
      },
      orderBy: {
        results: {
          _count: 'desc'
        }
      },
      take: 10
    });

    return topStudents.map(student => ({
      student: {
        id: student.id,
        name: student.name,
        surname: student.surname
      },
      academicPerformance: {
        averageScore: student.results.reduce((acc, result) => acc + result.score, 0) / student.results.length,
        class: student.class.name,
        grade: student.grade.level
      },
      scholarshipRecommendation: this.evaluateScholarshipEligibility(student)
    }));
  }

  private evaluateScholarshipEligibility(student: any) {
    const averageScore = student.results.reduce((acc, result) => acc + result.score, 0) / student.results.length;
    
    if (averageScore >= 90) {
      return {
        level: 'PLATINUM',
        fundingPercentage: 100,
        additionalSupport: ['Full Tuition', 'Mentorship Program']
      };
    } else if (averageScore >= 85) {
      return {
        level: 'GOLD',
        fundingPercentage: 75,
        additionalSupport: ['Partial Tuition', 'Academic Counseling']
      };
    } else if (averageScore >= 75) {
      return {
        level: 'SILVER',
        fundingPercentage: 50,
        additionalSupport: ['Partial Tuition', 'Study Resources']
      };
    }

    return {
      level: 'STANDARD',
      fundingPercentage: 0,
      additionalSupport: ['Academic Improvement Plan']
    };
  }
}
