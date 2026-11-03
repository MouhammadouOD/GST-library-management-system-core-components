import { Student, Teacher } from '../models/Member.js';

/** Factory pattern: centralizes construction of concrete Member subtypes. */
export class MemberFactory {
  static createMember(type, id, name) {
    switch (type) {
      case 'student':
        return new Student(id, name);
      case 'teacher':
        return new Teacher(id, name);
      default:
        throw new Error(`Unknown member type: ${type}`);
    }
  }
}
