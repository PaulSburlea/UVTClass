"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { ConfirmModal } from "./confirm-modal";
import { EditPostModal } from "./edit-post-modal";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  title: string;
  materials: Material[];
}

interface Material {
  id: string;
  title: string;
  type: "FILE" | "YOUTUBE" | "DRIVE" | "LINK";
  filePath?: string;
  url?: string;
  uploadedAt: string;
}

export function PostList({
  courseId,
  refetchKey,
  onPostUpdated, // Primiți funcția pentru a notifica că postarea a fost actualizată
}: {
  courseId: string;
  refetchKey: number;
  onPostUpdated: () => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

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

  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await fetch(`/api/post/${postToDelete.id}`, {
        method: "DELETE",
      });
      toast.success("Postarea a fost ștearsă cu succes!");
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
    } catch (err) {
      console.error("Eroare la ștergerea postării:", err);
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
            {/* Icon în cerc */}
            <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full text-white">
              <BookOpen size={20} />
            </div>

            {/* Textul postării */}
            <div className="flex-1">
              <div className="text-lg text-gray-800">
                <strong>{post.authorName}</strong> a postat un material nou:{" "}
                <em className="text-gray-700 truncate">
                  {post.title.split("\n")[0]}
                </em>
              </div>

              <div className="text-xs text-gray-500">
                Postat pe{" "}
                {new Date(post.createdAt).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Meniu cu 3 puncte */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded hover:bg-gray-100 flex items-center justify-center">
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
                  <DropdownMenuItem onClick={() => handleEdit(post)}>Editează</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(post)}
                    className="text-red-600"
                  >
                    Șterge
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}

      {/* Confirm Modal */}
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
            onPostUpdated();  // Apelează funcția de actualizare a listei
          }}
        />
      )}
    </div>
  );
}
