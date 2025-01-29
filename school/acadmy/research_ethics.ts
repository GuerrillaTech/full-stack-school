import { Teacher, Subject } from '@prisma/client';

export enum EthicalStandard {
  SPEC_001 = 'SPEC_001',
  SPEC_002 = 'SPEC_002',
  SPEC_000 = 'SPEC_000'
}

export interface ResearchAndEthicsDivisionStructure {
  appliedAIResearchLead: Teacher;
  ethicalOversightLead: Teacher;
  quantumIntegrationLead: Teacher;
  ethicalStandards: EthicalStandard[];
  researchSubjects: Subject[];
}

export class ResearchAndEthicsDivisionManager {
  private division: ResearchAndEthicsDivisionStructure;

  constructor(
    appliedAIResearchLead: Teacher, 
    ethicalOversightLead: Teacher, 
    quantumIntegrationLead: Teacher
  ) {
    this.division = {
      appliedAIResearchLead,
      ethicalOversightLead,
      quantumIntegrationLead,
      ethicalStandards: [
        EthicalStandard.SPEC_000, 
        EthicalStandard.SPEC_001, 
        EthicalStandard.SPEC_002
      ],
      researchSubjects: []
    };
  }

  addResearchSubject(subject: Subject): void {
    this.division.researchSubjects.push(subject);
  }

  addEthicalStandard(standard: EthicalStandard): void {
    if (!this.division.ethicalStandards.includes(standard)) {
      this.division.ethicalStandards.push(standard);
    }
  }

  getAppliedAIResearchLead(): Teacher {
    return this.division.appliedAIResearchLead;
  }

  getDivisionSummary(): ResearchAndEthicsDivisionStructure {
    return this.division;
  }

  getEthicalStandards(): EthicalStandard[] {
    return this.division.ethicalStandards;
  }
}
