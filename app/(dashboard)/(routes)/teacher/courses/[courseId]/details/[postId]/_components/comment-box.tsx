"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { SendHorizontal } from "lucide-react";

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  replies?: Comment[];
}

export function CommentBox({
  avatarUrl,
  postId,
  onCommentAdded,
  commentToEdit,
  onEditDone,
  onCommentUpdated,
  replyTo,
  onCancelReply,
}: {
  avatarUrl: string;
  postId: string;
  onCommentAdded?: () => void;
  commentToEdit?: Comment | null;
  onEditDone?: () => void;
  onCommentUpdated?: (updatedComment: Comment) => void;
  replyTo?: { id: string; authorName: string; authorEmail: string };
  onCancelReply?: () => void;

}) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inițializează valoarea textarea la răspuns sau edit
  useEffect(() => {
    if (replyTo) {
      setValue(`${replyTo.authorEmail} `);
    } else if (commentToEdit) {
      setValue(commentToEdit.content);
    } else {
      setValue("");
    }
  }, [replyTo, commentToEdit]);

  // Ajustează înălțimea textarea pe baza conținutului
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [value]);

  // Trimite POST sau PATCH în funcție de context (edit sau nou)
  const handleSubmit = async () => {
    if (!value.trim()) return;

    try {
      if (commentToEdit) {
        // Actualizare comentariu existent
        await fetch(`/api/comments/${commentToEdit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: value }),
        });

        onCommentUpdated?.({
          ...commentToEdit,
          content: value,
        });
        setValue("");
        onEditDone?.();
      } else {
        // Adăugare comentariu nou sau răspuns
        await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId,
            content: value,
            parentCommentId: replyTo?.id || null,
          }),
        });
        onCommentAdded?.();
      }

      setValue("");
      onCancelReply?.();
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  return (
    <div className="flex items-start gap-3 mt-4">
      {/* Avatar utilizator */}
      <Image
        src={avatarUrl}
        alt="Avatar"
        width={32}
        height={32}
        className="rounded-full object-cover"
      />

      <div className="flex flex-1 items-start gap-2">
        <div className="flex-1">
          {/* Banner pentru răspuns */}
          {replyTo && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-t-md mb-1 flex justify-between items-center">
              <span>
                Răspunzi lui <strong>{replyTo.authorEmail}</strong>
              </span>
              <button
                onClick={onCancelReply}
                className="text-xs text-blue-600 underline hover:text-blue-800"
              >
                Anulează
              </button>
            </div>
          )}

          {/* Textarea pentru comentariu/edit */}
          <textarea
            ref={textareaRef}
            placeholder={
              commentToEdit ? "Editează comentariul..." : "Adaugă un comentariu..."
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={1}
            className="w-full resize-none overflow-hidden border border-gray-300 rounded-2xl px-4 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* Buton de trimitere */}
        <button
          type="button"
          onClick={() => startTransition(handleSubmit)}
          disabled={isPending || !value.trim()}
          className="mt-1 p-2 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SendHorizontal size={20} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}
