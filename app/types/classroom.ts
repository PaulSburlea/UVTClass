export interface Classroom {
  id: string;
  userId: string;
  name: string;
  section?: string | null;
  subject?: string | null;
  room?: string | null;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}
