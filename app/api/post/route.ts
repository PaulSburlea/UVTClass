import { NextResponse } from "next/server";
import { db }           from "@/lib/db";
import type { Prisma }  from "@prisma/client";

type PostWithCount = Prisma.PostGetPayload<{
  include: {
    materials: true;
    _count: { select: { comments: true } };
  };
}>;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) {
    return new NextResponse("Missing courseId", { status: 400 });
  }

  try {
    // 1) Aduce postările, incluzând 'materials' și '_count.comments'
    const postsWithCount: PostWithCount[] = await db.post.findMany({
      where: { classroomId: courseId },
      include: {
        materials: true,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2) Map-uim: extragem '_count' și adăugăm 'commentCount'
    const posts = postsWithCount.map((p) => {
      const { _count, ...rest } = p;
      return {
        ...rest,
        commentCount: _count.comments,
      };
    });

    // 3) Returnăm JSON
    return NextResponse.json(posts);
  } catch (err) {
    console.error("Eroare la preluarea postărilor:", err);
    return new NextResponse("Eroare la server", { status: 500 });
  }
}
