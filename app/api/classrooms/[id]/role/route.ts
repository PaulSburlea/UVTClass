import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Obținem utilizatorul curent; dacă nu e autentificat, 401
  const user = await currentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

   // Extragem ID-ul clasei din URL: /api/classrooms/[classroomId]/role
  const pathname = req.nextUrl.pathname;
  const match = pathname.match(/\/api\/classrooms\/([^/]+)\/role/);
  const id = match?.[1];

  if (!id) return new NextResponse("Invalid ID", { status: 400 });

  // Căutăm în tabelă rolul utilizatorului pentru acea clasă
  const membership = await db.userClassroom.findFirst({
    where: {
      userId: user.id,
      classroomId: id,
    },
    select: { role: true },
  });

  if (!membership) return new NextResponse("Not found", { status: 404 });

  // Returnăm rolul (TEACHER/STUDENT)
  return NextResponse.json({ role: membership.role });
}
