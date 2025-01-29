import { Admin, Teacher } from '@prisma/client';

export interface CommandDivisionStructure {
  operationsLead: Teacher | Admin;
  governanceLead: Teacher | Admin;
  strategicPartnershipsLead: Teacher | Admin;
}

export class CommandDivisionManager {
  private division: CommandDivisionStructure;

  constructor(
    operationsLead: Teacher | Admin, 
    governanceLead: Teacher | Admin, 
    strategicPartnershipsLead: Teacher | Admin
  ) {
    this.division = {
      operationsLead,
      governanceLead,
      strategicPartnershipsLead
    };
  }

  getOperationsLead(): Teacher | Admin {
    return this.division.operationsLead;
  }

  getGovernanceLead(): Teacher | Admin {
    return this.division.governanceLead;
  }

  getStrategicPartnershipsLead(): Teacher | Admin {
    return this.division.strategicPartnershipsLead;
  }

  updateOperationsLead(newLead: Teacher | Admin): void {
    this.division.operationsLead = newLead;
  }

  getDivisionSummary(): CommandDivisionStructure {
    return this.division;
  }
}
