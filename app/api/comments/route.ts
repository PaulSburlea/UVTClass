import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { postId, content, parentCommentId } = await req.json();

    if (!postId || !content) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const comment = await db.comment.create({
      data: {
        postId,
        content,
        parentCommentId,
        authorId: user.id,
        authorName: user.fullName ?? "Anonim",
        authorAvatar: user.imageUrl ?? null,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return new NextResponse("Missing postId", { status: 400 });
    }

    const comments = await db.comment.findMany({
      where: { postId, parentCommentId: null },
      include: {
        replies: {
          include: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("[COMMENT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

