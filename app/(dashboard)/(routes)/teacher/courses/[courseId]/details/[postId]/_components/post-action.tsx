"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { EditPostModal } from "../../../../../posts/_components/edit-post-modal";
import { ConfirmModal } from "../../../../../../../../../components/confirm-modal";


interface PostActionsProps {
  courseId: string;
  postId: string;
  postTitle: string;
  postContent: string;
  postMaterials: {
    id: string;
    title: string;
    type: string;
    filePath?: string;
    url?: string;
  }[];
  onDeleted?: () => void;
}

export const PostActions = ({
  postId,
  postTitle,
  postContent,
  postMaterials,
  onDeleted,
}: PostActionsProps) => {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Când utilizatorul alege să șteargă, păstrăm ID-ul și deschidem modalul
  const handleDeleteClick = (id: string) => {
    setPostToDelete(id);
    setIsConfirmOpen(true);
  };

  // Aici facem cererea DELETE către server
  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      const res = await fetch(`/api/post/${postToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Postarea a fost ștearsă.");
        router.back();
        onDeleted?.();
      } else {
        toast.error("Eroare la ștergerea postării.");
      }
    } catch {
      toast.error("Eroare la rețea.");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      {/* Butonul cu cele trei puncte pentru opțiuni */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:rounded-2xl">
            <MoreVertical className="!h-5 !w-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {/* Deschide modalul de edit */}
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            Editează
          </DropdownMenuItem>
          {/* Setează starea pentru ștergere și afișează modalul de confirmare */}
          <DropdownMenuItem
            onClick={() => handleDeleteClick(postId)}
            className="text-red-600"
          >
            Șterge
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal pentru editarea postării; primește toate datele necesare */}
      <EditPostModal
        post={{
          id: postId,
          title: postTitle,
          content: postContent,
          materials: postMaterials,
        }}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdated={() => {
          router.refresh();
          setIsEditOpen(false);
        }}
      />

      {/* Modalul de confirmare ștergere */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Ești sigur că vrei să ștergi această postare?"
        description="Această acțiune este permanentă și nu poate fi anulată."
      />
    </>
  );
};
