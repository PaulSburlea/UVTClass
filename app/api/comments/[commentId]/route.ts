import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Recursivă: șterge comentariul și toți descendenții
async function deleteCommentRecursively(id: string) {
  const children = await db.comment.findMany({
    where: { parentCommentId: id },
    select: { id: true },
  });

  for (const { id: childId } of children) {
    await deleteCommentRecursively(childId);
  }

  await db.comment.delete({ where: { id } });
}

export async function DELETE(
  req: NextRequest,
  context: { params: { commentId: string } }
) {
  const { commentId } = context.params;

  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    });

    if (!comment) return new NextResponse("Not found", { status: 404 });

    const post = await db.post.findUnique({
      where: { id: comment.postId },
      select: { authorId: true, classroomId: true },
    });

    if (!post) return new NextResponse("Post not found", { status: 404 });

    const teacherInClass = await db.userClassroom.findFirst({
      where: {
        classroomId: post.classroomId,
        userId: user.id,
        role: "TEACHER",
      },
    });

    const isAuthorOfComment = comment.authorId === user.id;
    const isAuthorOfPost = post.authorId === user.id;
    const isTeacher = !!teacherInClass;

    if (!isAuthorOfComment && !isAuthorOfPost && !isTeacher) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await deleteCommentRecursively(commentId);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[COMMENT_DELETE]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { commentId: string } }
) {
  const { commentId } = context.params;

  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { content } = await req.json();
    if (!content) return new NextResponse("Content required", { status: 400 });

    const existing = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!existing || existing.authorId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updated = await db.comment.update({
      where: { id: commentId },
      data: {
        content,
        editedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[COMMENT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
