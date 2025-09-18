"use client";

import { useEffect, useState } from "react";

import { CommentList } from "./comment-list";
import { fetchCommentsTree } from "@/lib/fetchCommentsTrees";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  replies?: Comment[];

}

export function CommentSection({
  postId,
  postAuthorId,
  classroomId,
}: {
  postId: string;
  avatarUrl: string;
  postAuthorId: string;
  classroomId: string;
  
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentToEdit, setCommentToEdit] = useState<Comment | null>(null);
  
  // La montarea componentului sau când postId se schimbă,
  // preluăm arborele de comentarii asociat postării
  useEffect(() => {
    fetchCommentsTree(postId)
      .then(setComments)
      .catch((err) => console.error("Error fetching comment tree:", err));
  }, [postId]);

  // Funcție reutilizabilă pentru reîncărcarea comentariilor,
  // de exemplu după adăugare, editare sau ștergere
  const reloadComments = () => {
  fetchCommentsTree(postId)
    .then(setComments)
    .catch(console.error);
};


  return (
    <div className="mt-8 border-t pt-4">
      {/* Titlul secțiunii de comentarii */}
      <h3 className="text-md font-medium text-gray-700 mb-2">
        Comentarii la curs
      </h3>

      <div className="space-y-4 mb-4">
        {/* Lista de comentarii cu opțiuni de adăugare, editare, ștergere și răspuns */}
        <CommentList
          comments={comments}
          onCommentsChange={reloadComments}
          setCommentToEdit={setCommentToEdit}
          commentToEdit={commentToEdit}
          postId={postId}
          postAuthorId={postAuthorId}
          classroomId={classroomId}
        />
      </div>
    </div>
  );
}
