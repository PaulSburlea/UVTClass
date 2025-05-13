import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { studentId } = await req.json();

  // Verifică dacă userul curent este profesorul acelui curs
  const course = await db.classroom.findUnique({
    where: { id: params.courseId },
    include: { users: true },
  });

  const isTeacher = course?.users.some((u) => u.userId === userId && u.role === "TEACHER");
  if (!isTeacher) return new NextResponse("Forbidden", { status: 403 });

  await db.classroom.update({
    where: { id: params.courseId },
    data: {
      users: {
        deleteMany: {
          userId: studentId,
        },
      },
    },
  });

  return NextResponse.json({ success: true });
}
