import { Admin, Teacher } from '@prisma/client';

export interface AdmiraltyStructure {
  fleetAdmiral: Admin;
  viceAdmiralSTEM: Teacher;
  rearAdmiralEntrepreneurship: Teacher;
  admiralFinancialOperations: Admin;
  commodoreEthicsEquity: Teacher | Admin;
  strategicInitiatives: string[];
}

export class AdmiraltyManager {
  private admiralty: AdmiraltyStructure;

  constructor(
    fleetAdmiral: Admin,
    viceAdmiralSTEM: Teacher,
    rearAdmiralEntrepreneurship: Teacher,
    admiralFinancialOperations: Admin,
    commodoreEthicsEquity: Teacher | Admin
  ) {
    this.admiralty = {
      fleetAdmiral,
      viceAdmiralSTEM,
      rearAdmiralEntrepreneurship,
      admiralFinancialOperations,
      commodoreEthicsEquity,
      strategicInitiatives: [
        'STEM Education Expansion',
        'AI Ethics Framework Development',
        'Entrepreneurship Incubation Program'
      ]
    };
  }

  addStrategicInitiative(initiative: string): void {
    if (!this.admiralty.strategicInitiatives.includes(initiative)) {
      this.admiralty.strategicInitiatives.push(initiative);
    }
  }

  getFleetAdmiral(): Admin {
    return this.admiralty.fleetAdmiral;
  }

  getStrategicInitiatives(): string[] {
    return this.admiralty.strategicInitiatives;
  }

  getAdmiraltyStructure(): AdmiraltyStructure {
    return this.admiralty;
  }
}
