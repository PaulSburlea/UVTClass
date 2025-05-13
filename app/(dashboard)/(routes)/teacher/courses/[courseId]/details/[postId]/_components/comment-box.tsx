"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { SendHorizontal } from "lucide-react";

export function CommentBox({
  avatarUrl,
  postId,
  onCommentAdded,
  commentToEdit,
  onEditDone,
}: {
  avatarUrl: string;
  postId: string;
  onCommentAdded?: () => void;
  commentToEdit?: { id: string; content: string };
  onEditDone?: () => void;
}) {
  const [value, setValue] = useState(commentToEdit?.content || "");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(commentToEdit?.content || "");
  }, [commentToEdit]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [value]);

  const handleSubmit = async () => {
    if (!value.trim()) return;

    try {
      if (commentToEdit) {
        await fetch(`/api/comments/${commentToEdit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: value }),
        });
        onEditDone?.();
      } else {
        await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, content: value }),
        });
        onCommentAdded?.();
      }

      setValue("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  return (
    <div className="flex items-start gap-3 mt-4">
      {/* Avatar */}
      <Image
        src={avatarUrl}
        alt="Avatar"
        width={32}
        height={32}
        className="rounded-full object-cover"
      />

      {/* Textarea și buton */}
      <div className="flex flex-1 items-start gap-2">
        {/* Textarea */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            placeholder="Adaugă un comentariu..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={1}
            className="w-full resize-none overflow-hidden border border-gray-300 rounded-2xl px-4 py-2 text-sm focus:outline-none"
          />
          {commentToEdit && (
            <div className="flex justify-between text-xs mt-1 text-blue-600">
              <span className="italic">Editare comentariu...</span>
              <button
                onClick={onEditDone}
                className="underline text-blue-600 hover:text-blue-800"
              >
                Anulează
              </button>
            </div>
          )}
        </div>

        {/* Butonul în afara chenarului */}
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
