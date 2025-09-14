import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BookOpen } from "lucide-react";
import { PostActions } from "./_components/post-action";
import { currentUser } from "@clerk/nextjs/server";

import { CommentSection } from "./_components/comment-section";
import { PostMaterials } from "../../../../posts/_components/post-materials";

import type { Material } from "@/app/types/material";

interface Props {
  params: Promise<{
    courseId: string;
    postId: string;
    postAuthorId: string;
  }>;
}

export default async function PostDetailsPage({ params }: Props) {
  const { courseId, postId, postAuthorId } = await params;

  // Verificăm dacă utilizatorul este autentificat
  const user = await currentUser();
  const avatarUrl = user?.imageUrl ?? "/default-avatar.png";

  // Verificăm permisiunea: doar profesorii (role="TEACHER") pot accesa această pagină
  const enrollment = await db.userClassroom.findFirst({
    where: {
      classroomId: courseId,
      userId: user?.id,
      role: "TEACHER",
    },
  });

  if (!enrollment) {
    return notFound();
  }

  // Preluăm postarea și materialele sale din baza de date
  const post = await db.post.findUnique({
    where: { id: postId },
    include: { materials: true },
  });

  if (!post) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header cu titlul și detaliile postării */}
      <div className="border-b pb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Icon reprezentativ */}
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <BookOpen size={20} />
          </div>
          <div>
            {/* Titlu și autor/timestamp */}
            <h1 className="text-xl font-semibold text-gray-800">
              {post.title}
            </h1>
            <p className="text-sm text-gray-500">
              {/* Nume autor și oră */}
              {post.authorName ?? "Necunoscut"} ·{" "}
              {new Date(post.createdAt).toLocaleTimeString("ro-RO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {/* Afișăm și data ultimei modificări, dacă există */}
              {post.editedAt && post.editedAt !== post.createdAt && (
                <span className="ml-2 text-gray-400 text-xs">
                  (Ultima modificare:{" "}
                  {new Date(post.editedAt).toLocaleDateString("ro-RO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  )
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Componente pentru editare/ștergere post */}
        <PostActions
          courseId={courseId}
          postId={postId}
          postTitle={post.title}
          postContent={post.content ?? ""}
          postMaterials={post.materials.map((material: Material) => ({
            id: material.id,
            title: material.title,
            type: material.type,
            filePath: material.filePath ?? undefined,
            url: material.url ?? undefined,
          }))}
        />
      </div>

      {/* Afișăm materialele atașate postării (fișiere, linkuri etc.) */}
      <PostMaterials
        post={{ ...post, content: post.content ?? undefined }}
        materials={post.materials}
      />

      {/* Secțiunea de comentarii cu toată logica de fetch, adăugare, edit, ștergere */}
      <CommentSection
        avatarUrl={avatarUrl}
        postId={postId}
        postAuthorId={postAuthorId}
        classroomId={courseId}
      />
    </div>
  );
}
