import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;

  if (!postId) {
    return new NextResponse("Missing postId", { status: 400 });
  }

  try {
    await db.post.delete({
      where: { id: postId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Eroare la ștergerea postării:", error);
    return new NextResponse("Eroare la server", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const body = await req.json();
  const { title, content } = body;

  if (!postId || !title || !content) {
    return new NextResponse("Lipsesc date necesare", { status: 400 });
  }

  try {
    const updatedPost = await db.post.update({
      where: { id: postId },
      data: { title, content },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Eroare la actualizarea postării:", error);
    return new NextResponse("Eroare la server", { status: 500 });
  }
}
