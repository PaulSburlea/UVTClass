"use client";

import { useEffect, useState } from "react";
import { CommentBox } from "./comment-box";
import { CommentList } from "./comment-list";
import { fetchCommentsTree } from "@/lib/fetchCommentsTrees";
import { set } from "date-fns";

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
  avatarUrl,
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

  useEffect(() => {
    fetchCommentsTree(postId)
      .then(setComments)
      .catch((err) => console.error("Error fetching comment tree:", err));
  }, [postId]);

  const reloadComments = () => {
  fetchCommentsTree(postId)
    .then(setComments)
    .catch(console.error);
};


  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="text-md font-medium text-gray-700 mb-2">
        Comentarii la curs
      </h3>

      <div className="space-y-4 mb-4">
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
