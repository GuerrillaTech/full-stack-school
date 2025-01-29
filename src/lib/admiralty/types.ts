import { AdmiraltyRank, DivisionType } from '@prisma/client';

export { AdmiraltyRank, DivisionType };

export interface AdmiraltyMemberProfile {
  id: string;
  name: string;
  surname: string;
  email: string;
  rank: AdmiraltyRank;
  division: DivisionType;
  specialization: string;
  startDate: Date;
  responsibilities: string[];
}

export interface StrategicInitiativeDetails {
  id: string;
  title: string;
  description: string;
  status: 'PROPOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED';
  startDate: Date;
  endDate?: Date;
  budget: number;
  leaderId: string;
  divisions: DivisionType[];
}

export interface EthicalStandardDetails {
  id: string;
  code: string;
  name: string;
  description: string;
  implementationDate: Date;
  complianceLevel: number;
}

export interface CommunityOutreachProgramDetails {
  id: string;
  name: string;
  description: string;
  targetCommunity: string;
  startDate: Date;
  endDate?: Date;
  participantCount: number;
  fundingAmount: number;
}
