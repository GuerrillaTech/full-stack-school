import { Teacher, Student, Class, Grade } from '@prisma/client';

export interface OhioTechAcademyStructure {
  curriculumLead: Teacher;
  apprenticeshipLead: Teacher;
  equityLead: Teacher;
  classes: Class[];
  students: Student[];
  grades: Grade[];
}

export class OhioTechAcademyManager {
  private academy: OhioTechAcademyStructure;

  constructor(
    curriculumLead: Teacher, 
    apprenticeshipLead: Teacher, 
    equityLead: Teacher
  ) {
    this.academy = {
      curriculumLead,
      apprenticeshipLead,
      equityLead,
      classes: [],
      students: [],
      grades: []
    };
  }

  addClass(newClass: Class): void {
    this.academy.classes.push(newClass);
  }

  addStudent(student: Student): void {
    this.academy.students.push(student);
  }

  addGrade(grade: Grade): void {
    this.academy.grades.push(grade);
  }

  getCurriculumLead(): Teacher {
    return this.academy.curriculumLead;
  }

  getAcademySummary(): OhioTechAcademyStructure {
    return this.academy;
  }

  getStudentCount(): number {
    return this.academy.students.length;
  }

  getClassCount(): number {
    return this.academy.classes.length;
  }
}
