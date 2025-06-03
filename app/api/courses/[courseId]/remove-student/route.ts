import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { studentId } = await req.json();

  // Verifică dacă userul curent este profesorul acelui curs
  const course = await db.classroom.findUnique({
    where: { id: params.courseId },
    include: { users: true },
  });

  // Tipăm `u` ca obiect cu proprietățile folosite
  const isTeacher = course?.users.some(
    (u: { userId: string; role: string }) =>
      u.userId === userId && u.role === "TEACHER"
  );
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
