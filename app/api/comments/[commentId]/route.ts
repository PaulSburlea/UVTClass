import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// DELETE: șterge un comentariu
export async function DELETE(
  req: Request,
  context: { params: { commentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { commentId } = await context.params;

    const existing = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!existing || existing.authorId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.comment.delete({
      where: { id: commentId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COMMENT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH: editează un comentariu
export async function PATCH(
  req: Request,
  context: { params: { commentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { content } = await req.json();
    if (!content) {
      return new NextResponse("Content required", { status: 400 });
    }

    // Găsim comentariul existent în baza de date
    const existing = await db.comment.findUnique({
      where: { id: context.params.commentId },
    });

    if (!existing || existing.authorId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Actualizăm comentariul și adăugăm data ultimei editări
    const updated = await db.comment.update({
      where: { id: context.params.commentId },
      data: {
        content,
        editedAt: new Date(),  // Adăugăm data editării
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[COMMENT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
