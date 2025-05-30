// frontend/app/(dashboard)/(routes)/teacher/posts/_components/post-list.tsx
"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/confirm-modal";
import { EditPostModal } from "./edit-post-modal";
import type { Post, Material } from "../../../../../types/posts";

export function PostList({
  courseId,
  refetchKey,
  onPostUpdated,
  editable = true,
  userRole,             // role: "TEACHER" | "STUDENT"
}: {
  courseId: string;
  refetchKey: number;
  onPostUpdated: () => void;
  editable?: boolean;
  userId?: string;
  userRole: "TEACHER" | "STUDENT";
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/post?courseId=${courseId}`);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Eroare la încărcarea postărilor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [courseId, refetchKey]);

  const handleEdit = async (post: Post) => {
    try {
      const res = await fetch(`/api/post/${post.id}`);
      if (!res.ok) throw new Error("Nu am putut încărca detaliile postării");
      const full: Post & { materials: Material[] } = await res.json();
      setEditingPost(full);
    } catch {
      toast.error("Eroare la încărcarea postării pentru editare.");
    }
  };

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await fetch(`/api/post/${postToDelete.id}`, { method: "DELETE" });
      toast.success("Postarea a fost ștearsă cu succes!");
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
    } catch {
      toast.error("Eroare la ștergerea postării.");
    } finally {
      setIsConfirmOpen(false);
      setPostToDelete(null);
    }
  };

  if (loading)
    return <p className="mt-4 text-gray-500">Se încarcă...</p>;
  if (!posts.length)
    return <p className="mt-4 text-gray-500">Nu există materiale.</p>;

  return (
    <div className="mt-6 w-full max-w-screen-lg space-y-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="p-4 border rounded bg-white shadow-sm space-y-2 relative"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full text-white">
              <BookOpen size={20} />
            </div>
            <div className="flex-1">
              <Link
                href={
                  userRole === "TEACHER"
                    ? `/teacher/courses/${courseId}/details/${post.id}`
                    : `/student/courses/${courseId}/details/${post.id}`
                }
              >
                <div className="text-lg text-gray-900 cursor-pointer hover:underline">
                  <strong>{post.authorName}</strong> a postat un material nou:{" "}
                  <em className="text-gray-800 truncate">
                    {post.title.split("\n")[0]}
                  </em>
                </div>
              </Link>
              <div className="space-y-1">
                <div className="text-xs text-gray-700">
                  Postat pe{" "}
                  {new Date(post.createdAt).toLocaleDateString("ro-RO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {post.editedAt && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Ultima modificare:{" "}
                      {new Date(post.editedAt).toLocaleDateString("ro-RO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      )
                    </span>
                  )}
                </div>
                {post.commentCount > 0 && (
                  <div className="text-xs font-medium text-gray-600">
                    {post.commentCount === 1
                      ? "Un comentariu la curs"
                      : `${post.commentCount} comentarii la curs`}
                  </div>
                )}
              </div>
            </div>
            {editable && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-2xl hover:bg-gray-100 flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        className="text-gray-500"
                      >
                        <circle cx="10" cy="3" r="2" />
                        <circle cx="10" cy="10" r="2" />
                        <circle cx="10" cy="17" r="2" />
                      </svg>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => handleEdit(post)}>
                      Editează
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(post)}
                      className="text-red-600"
                    >
                      Șterge
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          {editable && (
            <>
              <ConfirmModal
                isOpen={isConfirmOpen}
                onCancel={() => {
                  setIsConfirmOpen(false);
                  setPostToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Confirmă ștergerea"
                description={`Ești sigur că vrei să ștergi postarea „${postToDelete?.title}”?`}
                confirmButtonText="Șterge"
                cancelButtonText="Anulează"
              />
              {editingPost && (
                <EditPostModal
                  post={editingPost}
                  isOpen={!!editingPost}
                  onClose={() => setEditingPost(null)}
                  onUpdated={() => {
                    setEditingPost(null);
                    onPostUpdated();
                  }}
                />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
