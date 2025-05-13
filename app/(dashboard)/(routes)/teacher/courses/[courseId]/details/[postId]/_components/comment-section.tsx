"use client";

import { useEffect, useState } from "react";
import { CommentBox } from "./comment-box";
import { CommentList } from "./comment-list";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  replies: Comment[];
}

export function CommentSection({
  postId,
  avatarUrl,
}: {
  postId: string;
  avatarUrl: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentToEdit, setCommentToEdit] = useState<Comment | null>(null);


  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = (await res.json()) as Comment[];
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="text-md font-medium text-gray-700 mb-2">
        Comentarii la curs
      </h3>

      <div className="space-y-4 mb-4">
        <CommentList
          comments={comments}
          onCommentsChange={fetchComments}
          setCommentToEdit={setCommentToEdit}
          commentToEdit={commentToEdit}
        />
      </div>

      <CommentBox
        avatarUrl={avatarUrl}
        postId={postId}
        commentToEdit={commentToEdit || undefined}
        onEditDone={() => {
          setCommentToEdit(null);
          fetchComments();
        }}
        onCommentAdded={fetchComments}
      />
    </div>
  );
}
