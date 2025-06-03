export type MaterialType = "FILE" | "YOUTUBE" | "DRIVE" | "LINK";

export interface Material {
  id: string;
  name?: string | null;
  postId?: string | null;
  title: string;
  type: MaterialType;
  filePath?: string | null;
  url?: string | null;
  uploadedAt: Date;
}
