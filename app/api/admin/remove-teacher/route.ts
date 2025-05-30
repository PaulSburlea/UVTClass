// frontend/app/api/admin/remove-teacher/route.ts
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = await db.admin.findUnique({ where: { userId } });
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { teacherId } = await req.json();
  if (!teacherId) {
    return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
  }

  try {
    await db.$transaction(async (tx) => {
      // 1) Găsește toate classroom-urile ale teacher-ului
      const classrooms = await tx.classroom.findMany({
        where: { userId: teacherId },
        select: { id: true },
      });
      const classroomIds = classrooms.map((c) => c.id);

      if (classroomIds.length > 0) {
        // 2) Pentru fiecare classroom, găsește toate post-urile
        const posts = await tx.post.findMany({
          where: { classroomId: { in: classroomIds } },
          select: { id: true },
        });
        const postIds = posts.map((p) => p.id);

        if (postIds.length > 0) {
          // 3) Şterge întâi toate reply-urile comentariilor (parentCommentId != null)
          await tx.comment.deleteMany({
            where: {
              postId: { in: postIds },
              parentCommentId: { not: null },
            },
          });
          // 4) Apoi şterge comentariile de nivel 1 (parentCommentId == null)
          await tx.comment.deleteMany({
            where: {
              postId: { in: postIds },
              parentCommentId: null,
            },
          });

          // 5) Şterge materialele din posts (dacă nu ai cascade onDelete)
          await tx.material.deleteMany({
            where: { postId: { in: postIds } },
          });

          // 6) În fine, şterge post-urile
          await tx.post.deleteMany({
            where: { id: { in: postIds } },
          });
        }

        // 7) Şterge legăturile UserClassroom
        await tx.userClassroom.deleteMany({
          where: { classroomId: { in: classroomIds } },
        });

        // 8) Şterge classroom-urile
        await tx.classroom.deleteMany({
          where: { id: { in: classroomIds } },
        });
      }

      // 9) În cele din urmă, şterge teacher-ul în sine
      await tx.teacher.delete({
        where: { userId: teacherId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Remove teacher error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Could not remove teacher", details: message },
      { status: 500 }
    );
  }
}
