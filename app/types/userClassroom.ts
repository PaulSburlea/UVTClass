export type UserRole = "TEACHER" | "STUDENT";

export interface UserClassroom {
  id: string;
  classroomId: string;
  userId: string;
  role: UserRole;
  createdAt: Date;
}
