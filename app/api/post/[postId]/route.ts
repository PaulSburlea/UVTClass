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
