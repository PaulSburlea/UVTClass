// utils/fetchCommentsTree.ts
export interface CommentNode {
  id: string;
  content: string;
  createdAt: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  replies?: CommentNode[];
}

export async function fetchCommentsTree(postId: string): Promise<CommentNode[]> {
  // 1. Ia top-level comments
  const rootRes = await fetch(`/api/comments?postId=${postId}`);
  if (!rootRes.ok) throw new Error("Failed to fetch root comments");
  const roots: CommentNode[] = await rootRes.json();

  // 2. Funcție recursivă care umple replies[]
  async function fillReplies(comment: CommentNode): Promise<void> {
    const res = await fetch(
      `/api/comments?postId=${postId}&parentCommentId=${comment.id}`
    );
    if (!res.ok) throw new Error(`Failed to fetch replies for ${comment.id}`);
    const children: CommentNode[] = await res.json();
    comment.replies = children;
    // Apelează recursiv pentru fiecare reply
    await Promise.all(children.map((child) => fillReplies(child)));
  }

  // 3. Rulează pentru fiecare root
  await Promise.all(roots.map((c) => fillReplies(c)));

  return roots;
}
