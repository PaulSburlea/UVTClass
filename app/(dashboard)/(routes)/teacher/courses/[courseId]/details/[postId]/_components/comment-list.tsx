"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Image from "next/image";
import { CornerUpRight, MoreVertical } from "lucide-react";
import { format, isToday } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/confirm-modal";
import { CommentBox } from "./comment-box";
import { useIsTeacher } from "@/lib/use-is-teacher";

// Format dată românește
function formatDateDisplay(date: Date) {
  return isToday(date)
    ? format(date, "HH:mm", { locale: ro })
    : format(date, "d MMM", { locale: ro });
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  replies?: Comment[];
}

type ReplyTarget = {
  id: string;
  authorName: string;
  authorEmail: string;
};

interface Props {
  comments: Comment[];
  postId: string;
  postAuthorId: string;
  classroomId: string;
  onCommentsChange: () => void;
  setCommentToEdit: (c: Comment | null) => void;
  commentToEdit: Comment | null;
}

export function CommentList({
  comments,
  postId,
  postAuthorId,
  classroomId,
  onCommentsChange,
  setCommentToEdit,
  commentToEdit,
}: Props) {
  const { user } = useUser();
  const userId = user?.id;
  const isTeacher = useIsTeacher(classroomId);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  useEffect(() => {
  setLocalComments(comments);
}, [comments]);

  const handleDelete = async () => {
    if (!commentToDelete) return;

    const res = await fetch(`/api/comments/${commentToDelete.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Nu ai permisiunea să ștergi acest comentariu");
    } else {
      toast.success("Comentariul a fost șters");
      onCommentsChange();
    }

    setCommentToDelete(null);
    setIsConfirmOpen(false);
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
  const updateComments = (comments: Comment[]): Comment[] => {
    return comments.map(c => {
      if (c.id === updatedComment.id) {
        return { ...c, ...updatedComment };
      } else if (c.replies) {
        return { ...c, replies: updateComments(c.replies) };
      }
      return c;
    });
  };

  setLocalComments(prev => updateComments(prev));
  setCommentToEdit(null);
};


  const handleReplyClick = async (c: Comment) => {
    if (!c.authorId) return;
    try {
      const res = await fetch(`/api/users/${c.authorId}`);
      if (!res.ok) throw new Error();
      const { email } = await res.json();

      setReplyTarget({
        id: c.id,
        authorName: c.authorName || "Anonim",
        authorEmail: email,
      });
    } catch {
      toast.error("Nu am putut prelua emailul userului");
    }
  };

  const renderComment = (c: Comment, depth = 0) => {
    const isEditing = commentToEdit?.id === c.id;
    const canEdit = c.authorId === userId;
    const canDelete = canEdit || userId === postAuthorId || isTeacher;

    return (
      <div key={c.id} className={depth > 0 ? "ml-8" : ""}>
        <div className={`border p-3 rounded-md mb-2 ${isEditing ? "border-blue-500 bg-blue-50" : ""}`}>
          <div className="flex items-start gap-3">
            <Image
              src={c.authorAvatar ?? "/default-avatar.png"}
              alt="avatar"
              width={32}
              height={32}
              className="rounded-full"
              unoptimized
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{c.authorName ?? "Anonim"}</p>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
                    <span>{formatDateDisplay(new Date(c.createdAt))}</span>
                    {c.editedAt && c.editedAt !== c.createdAt && (
                      <span className="text-gray-500">
                        (Editat la {formatDateDisplay(new Date(c.editedAt))})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => setCommentToEdit(c)}>
                          Editează
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => {
                            setCommentToDelete(c);
                            setIsConfirmOpen(true);
                          }}
                          className="text-red-600"
                        >
                          Șterge
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleReplyClick(c)}>
                        Răspunde
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                </div>
              </div>

              {!isEditing ? (
                <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
              ) : (
                <button
                  onClick={() => setCommentToEdit(null)}
                  className="text-xs text-blue-600 underline mt-2 hover:text-blue-800"
                >
                  Anulează editarea
                </button>
              )}
            </div>
          </div>
        </div>

        {replyTarget?.id === c.id && (
          <CommentBox
            avatarUrl={user?.imageUrl ?? "/default-avatar.png"}
            postId={postId}
            replyTo={replyTarget}
            onCommentAdded={() => {
              setReplyTarget(null);
              onCommentsChange();
            }}
            onCancelReply={() => setReplyTarget(null)}
          />
        )}

        {Array.isArray(c.replies) && c.replies.map((r) => renderComment(r, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {localComments.map((c) => renderComment(c))}

      {!replyTarget && (
        <CommentBox
          avatarUrl={user?.imageUrl ?? "/default-avatar.png"}
          postId={postId}
          commentToEdit={commentToEdit}
          onCommentAdded={onCommentsChange}
          onCommentUpdated={handleCommentUpdated}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onCancel={() => {
          setIsConfirmOpen(false);
          setCommentToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Șterge comentariul"
        description="Ești sigur că vrei să ștergi acest comentariu?"
        confirmButtonText="Șterge"
        cancelButtonText="Anulează"
      />
    </div>
  );
}
