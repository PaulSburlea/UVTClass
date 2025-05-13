"use client";

import { format, isToday, set } from "date-fns";
import { ro } from "date-fns/locale";
import Image from "next/image";
import { CornerUpRight, MoreVertical } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "react-hot-toast";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { ConfirmModal } from "../../../../../../../../../components/confirm-modal";

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
  replies: Comment[];
}

interface Props {
  comments: Comment[];
  onCommentsChange: () => void;
  setCommentToEdit: (comment: Comment) => void;
  commentToEdit: Comment | null;
}

export function CommentList({ comments, onCommentsChange, setCommentToEdit, commentToEdit }: Props) {
  const { user } = useUser();
  const userId = user?.id;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const res = await fetch(`/api/comments/${commentToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Comentariul a fost șters!");
      setIsConfirmOpen(false);
      setCommentToDelete(null);
      onCommentsChange();
    } catch (err) {
      console.error("Eroare la ștergere:", err);
      toast.error("A apărut o eroare.");
    }
  };

  if (!comments.length)
    return <p className="text-gray-500">Fără comentarii încă.</p>;

  return (
    <div className="space-y-4">
{comments.map((comment) => {
  const isBeingEdited = commentToEdit?.id === comment.id;

  return (
    <div
      key={comment.id}
      className={`border p-3 rounded-md relative transition-colors ${
        isBeingEdited ? "border-blue-500 bg-blue-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <Image
          src={comment.authorAvatar || "/default-avatar.png"}
          alt="avatar"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">
                {comment.authorName || "Anonim"}
              </p>
              <p className="text-xs text-gray-600">
                {formatDateDisplay(new Date(comment.createdAt))}
                {comment.editedAt && comment.editedAt !== comment.createdAt && (
                  <span className="text-gray-500 text-xs ml-2">
                    (Editat la {formatDateDisplay(new Date(comment.editedAt))})
                  </span>
                )}
              </p>
            </div>

            {comment.authorId === userId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    title="Acțiuni"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => {
                      setCommentToEdit(comment);
                    }}
                  >
                    Editează
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setCommentToDelete(comment);
                      setIsConfirmOpen(true);
                    }}
                    className="text-red-600"
                  >
                    Șterge
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                title="Răspunde"
                className="text-gray-400 hover:text-blue-500"
              >
                <CornerUpRight size={18} />
              </button>
            )}
          </div>

          <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
            {comment.content}
          </p>
        </div>
      </div>

      {/* Replies, dacă există */}
      {comment.replies.length > 0 && (
        <div className="ml-8 mt-3 space-y-2 border-l pl-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Image
                src={reply.authorAvatar || "/default-avatar.png"}
                alt="avatar"
                width={24}
                height={24}
                className="rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">
                    {reply.authorName || "Anonim"}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatDateDisplay(new Date(reply.createdAt))}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
})}


      <ConfirmModal
        isOpen={isConfirmOpen}
        onCancel={() => {
          setIsConfirmOpen(false);
          setCommentToDelete(null);
        }}
        onConfirm={handleDeleteComment}
        title="Șterge comentariul"
        description="Ești sigur că vrei să ștergi acest comentariu?"
        confirmButtonText="Șterge"
        cancelButtonText="Anulează"
      />
    </div>
  );
}
