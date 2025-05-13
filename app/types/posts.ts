// app/types/posts.ts
export interface Material {
    id: string;
    title: string;
    type: "FILE" | "YOUTUBE" | "DRIVE" | "LINK";
    filePath?: string;
    url?: string;
    uploadedAt: string;
  }
  
  export interface Post {
    id: string;
    content: string;
    createdAt: string;
    editedAt: string;
    authorName: string;
    title: string;
    materials: Material[];
    commentCount: number;
  }
  