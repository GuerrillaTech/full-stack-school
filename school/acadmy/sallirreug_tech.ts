import { Teacher, Subject, Lesson } from '@prisma/client';

export interface SallirreugTechDivision {
  captain: Teacher;
  subjects: Subject[];
  lessons: Lesson[];
}

export class SallirreugTechManager {
  private division: SallirreugTechDivision;

  constructor(captain: Teacher) {
    this.division = {
      captain,
      subjects: [],
      lessons: []
    };
  }

  addSubject(subject: Subject): void {
    this.division.subjects.push(subject);
  }

  addLesson(lesson: Lesson): void {
    this.division.lessons.push(lesson);
  }

  getCaptain(): Teacher {
    return this.division.captain;
  }

  getDivisionSummary(): SallirreugTechDivision {
    return this.division;
  }
}
