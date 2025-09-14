import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Crează un comentariu asociat unui post (și opțional unui comentariu părinte)
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Parsăm câmpurile din corpul cererii
    const { postId, content, parentCommentId } = await req.json();
    // Validăm prezența câmpurilor necesare și că textul nu e gol după trim()
    if (!postId || !content?.trim()) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Creăm comentariul în baza de date
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

    // Returnăm comentariul creat ca JSON
    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Returnează lista de comentarii pentru un post, eventual filtrate după parentCommentId
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const parentCommentId = searchParams.get("parentCommentId");

  if (!postId) {
    return new NextResponse("Missing postId", { status: 400 });
  }

  // Construim obiectul where: dacă parentCommentId există, filtrăm după el; altfel căutăm comentarii de nivel rădăcină
  const where = parentCommentId
    ? { postId, parentCommentId }
    : { postId, parentCommentId: null };

  // Preluăm comentariile ordonate cronologic ascendent
  const comments = await db.comment.findMany({
    where,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      editedAt: true,
      authorId: true,
      authorName: true,
      authorAvatar: true,
    },
  });

  return NextResponse.json(comments);
}
