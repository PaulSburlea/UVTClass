import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Șterge recursiv un comentariu și toate comentariile sale copil
async function deleteCommentRecursively(id: string) {
  // Găsește toate comentariile care au parentCommentId = id
  const children = await db.comment.findMany({
    where: { parentCommentId: id },
    select: { id: true },
  });

  // Pentru fiecare copil, șterge recursiv
  for (const { id: childId } of children) {
    await deleteCommentRecursively(childId);
  }

  // După ce toți copiii au fost șterși, șterge comentariul curent
  await db.comment.delete({ where: { id } });
}

export async function DELETE(req: NextRequest) {
  // Extragem ID-ul comentariului din ultima parte a path-ului
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  const commentId = segments[segments.length - 1];

  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Găsim comentariul pentru a verifica autorul și postId-ul
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    });

    if (!comment) return new NextResponse("Not found", { status: 404 });

    // Găsim postul ca să putem verifica dacă utilizatorul este autor al postului sau profesor în clasă
    const post = await db.post.findUnique({
      where: { id: comment.postId },
      select: { authorId: true, classroomId: true },
    });

    if (!post) return new NextResponse("Post not found", { status: 404 });

    // Verificăm dacă utilizatorul este profesor în clasa asociată postului
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

    // Dacă nu este autor al comentariului, nici autor al postului, nici profesor, refuzăm
    if (!isAuthorOfComment && !isAuthorOfPost && !isTeacher) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Ștergem comentariul și toate subcomentariile
    await deleteCommentRecursively(commentId);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[COMMENT_DELETE]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}


export async function PATCH(
  req: Request,
  context: { params: Promise<{ commentId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { content } = await req.json();
    if (!content) {
      return new NextResponse("Content required", { status: 400 });
    }

    const existing = await db.comment.findUnique({
      where: { id: (await context.params).commentId },
    });

    if (!existing || existing.authorId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Actualizăm conținutul și timestamp-ul de editare
    const updated = await db.comment.update({
      where: { id: (await context.params).commentId },
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
