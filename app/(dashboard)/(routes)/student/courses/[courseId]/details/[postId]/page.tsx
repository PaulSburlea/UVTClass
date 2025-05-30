import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BookOpen } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { CommentSection } from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/details/[postId]/_components/comment-section";
import { PostMaterials } from "@/app/(dashboard)/(routes)/teacher/posts/_components/post-materials";

interface Props {
  params: Promise<{
    courseId: string;
    postId: string;
    postAuthorId: string;
  }>;
}

export default async function StudentPostDetails(props: Props) {
  const params = await props.params;
  const { courseId, postId, postAuthorId } = params;

  // 1) Îl folosim pe Clerk pentru a obține avatarul
  const user = await currentUser();
  const avatarUrl = user?.imageUrl ?? "/default-avatar.png";

  // 2) Luăm postarea + materiale
  const post = await db.post.findUnique({
    where: { id: postId },
    include: { materials: true },
  });
  if (!post) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {post.title}
            </h1>
            <p className="text-sm text-gray-500">
              {post.authorName ?? "Necunoscut"} ·{" "}
              {new Date(post.createdAt).toLocaleTimeString("ro-RO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

    <PostMaterials post={{ ...post, content: post.content ?? undefined }} materials={post.materials} />

      {/* Comentarii */}
      <CommentSection postId={postId} avatarUrl={avatarUrl} postAuthorId={postAuthorId} classroomId={courseId}/>
    </div>
  );
}
