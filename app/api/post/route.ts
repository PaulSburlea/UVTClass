import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return new NextResponse("Missing courseId", { status: 400 });
  }

  try {
    const posts = await db.post.findMany({
      where: { classroomId: courseId },
      include: {
        materials: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (err) {
    console.error("Eroare la preluarea postărilor:", err);
    return new NextResponse("Eroare la server", { status: 500 });
  }
}
