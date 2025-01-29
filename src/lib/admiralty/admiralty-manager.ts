import { PrismaClient } from '@prisma/client';
import { 
  AdmiraltyMemberProfile, 
  StrategicInitiativeDetails, 
  EthicalStandardDetails,
  CommunityOutreachProgramDetails 
} from './types';

export class AdmiraltyManager {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Fleet Admiral Operations
  async createStrategicInitiative(
    initiativeData: Omit<StrategicInitiativeDetails, 'id'> & { 
      status?: 'PROPOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED' 
    }
  ): Promise<StrategicInitiativeDetails> {
    // Validate input data
    if (!initiativeData.title) {
      throw new Error('Initiative title is required');
    }

    if (!initiativeData.leaderId) {
      throw new Error('Initiative leader is required');
    }

    return this.prisma.strategicInitiative.create({
      data: {
        ...initiativeData,
        status: initiativeData.status || 'PROPOSED',
      },
    });
  }

  async updateStrategicInitiativeStatus(
    initiativeId: string, 
    status: 'PROPOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED'
  ): Promise<StrategicInitiativeDetails> {
    // Retrieve existing initiative to validate state transition
    const existingInitiative = await this.getStrategicInitiativeById(initiativeId);

    // Implement state transition rules
    const validTransitions = {
      'PROPOSED': ['IN_PROGRESS', 'SUSPENDED'],
      'IN_PROGRESS': ['COMPLETED', 'SUSPENDED'],
      'COMPLETED': ['IN_PROGRESS'],
      'SUSPENDED': ['PROPOSED', 'IN_PROGRESS'],
    };

    if (!validTransitions[existingInitiative.status].includes(status)) {
      throw new Error(`Invalid status transition from ${existingInitiative.status} to ${status}`);
    }

    return this.prisma.strategicInitiative.update({
      where: { id: initiativeId },
      data: { 
        status,
        ...(status === 'COMPLETED' && { endDate: new Date() }),
      },
    });
  }

  async getAllStrategicInitiatives(): Promise<StrategicInitiativeDetails[]> {
    return this.prisma.strategicInitiative.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        leader: true, // Include leader details if needed
      },
    });
  }

  async getStrategicInitiativeById(
    initiativeId: string
  ): Promise<StrategicInitiativeDetails> {
    const initiative = await this.prisma.strategicInitiative.findUnique({
      where: { id: initiativeId },
      include: {
        leader: true,
      },
    });

    if (!initiative) {
      throw new Error(`Strategic Initiative with ID ${initiativeId} not found`);
    }

    return initiative;
  }

  async trackBudgetUtilization(
    initiativeId: string, 
    expenditure: number
  ): Promise<StrategicInitiativeDetails> {
    const initiative = await this.getStrategicInitiativeById(initiativeId);

    return this.prisma.strategicInitiative.update({
      where: { id: initiativeId },
      data: { 
        budget: initiative.budget - expenditure 
      },
    });
  }

  // Vice Admiral of STEM Initiatives
  async createEthicalStandard(
    standardData: Omit<EthicalStandardDetails, 'id'>
  ): Promise<EthicalStandardDetails> {
    return this.prisma.ethicalStandard.create({
      data: {
        ...standardData,
        complianceLevel: 0
      }
    });
  }

  async updateEthicalStandardCompliance(
    standardId: string, 
    complianceLevel: number
  ): Promise<EthicalStandardDetails> {
    return this.prisma.ethicalStandard.update({
      where: { id: standardId },
      data: { complianceLevel }
    });
  }

  // Rear Admiral of Entrepreneurship
  async launchCommunityOutreachProgram(
    programData: Omit<CommunityOutreachProgramDetails, 'id'>
  ): Promise<CommunityOutreachProgramDetails> {
    return this.prisma.communityOutreachProgram.create({
      data: programData
    });
  }

  async updateCommunityOutreachProgram(
    programId: string,
    updateData: Partial<Omit<CommunityOutreachProgramDetails, 'id'>>
  ): Promise<CommunityOutreachProgramDetails> {
    return this.prisma.communityOutreachProgram.update({
      where: { id: programId },
      data: updateData
    });
  }

  // Admiral of Financial Operations
  async calculateOrganizationalMetrics() {
    const [
      totalInitiatives, 
      totalEthicalStandards, 
      totalOutreachPrograms
    ] = await Promise.all([
      this.prisma.strategicInitiative.count(),
      this.prisma.ethicalStandard.count(),
      this.prisma.communityOutreachProgram.count()
    ]);

    const averageComplianceLevel = await this.prisma.ethicalStandard
      .aggregate({
        _avg: { complianceLevel: true }
      });

    return {
      totalStrategicInitiatives: totalInitiatives,
      totalEthicalStandards,
      totalCommunityOutreachPrograms: totalOutreachPrograms,
      averageEthicalComplianceLevel: averageComplianceLevel._avg.complianceLevel || 0
    };
  }

  // Commodore of Ethics and Equity
  async generateInclusivityReport() {
    const outreachPrograms = await this.prisma.communityOutreachProgram.findMany();
    
    const inclusivityMetrics = outreachPrograms.map(program => ({
      programName: program.name,
      targetCommunity: program.targetCommunity,
      participantCount: program.participantCount,
      fundingAmount: program.fundingAmount
    }));

    return {
      totalOutreachPrograms: outreachPrograms.length,
      inclusivityMetrics
    };
  }

  // Comprehensive Organizational Health Check
  async performOrganizationalHealthCheck() {
    const metrics = await this.calculateOrganizationalMetrics();
    const inclusivityReport = await this.generateInclusivityReport();

    return {
      ...metrics,
      ...inclusivityReport,
      overallHealthScore: this.calculateHealthScore(metrics, inclusivityReport)
    };
  }

  private calculateHealthScore(
    metrics: ReturnType<AdmiraltyManager['calculateOrganizationalMetrics']>,
    inclusivityReport: ReturnType<AdmiraltyManager['generateInclusivityReport']>
  ): number {
    // Complex scoring algorithm considering multiple factors
    const initiativeScore = metrics.totalStrategicInitiatives * 10;
    const ethicalScore = metrics.averageEthicalComplianceLevel * 20;
    const outreachScore = inclusivityReport.totalOutreachPrograms * 15;

    return (initiativeScore + ethicalScore + outreachScore) / 3;
  }
}
