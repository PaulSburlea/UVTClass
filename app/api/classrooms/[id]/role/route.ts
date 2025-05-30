import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  // extrage ID-ul din URL
  const pathname = req.nextUrl.pathname;
  const match = pathname.match(/\/api\/classrooms\/([^/]+)\/role/);
  const id = match?.[1];

  if (!id) return new NextResponse("Invalid ID", { status: 400 });

  const membership = await db.userClassroom.findFirst({
    where: {
      userId: user.id,
      classroomId: id,
    },
    select: { role: true },
  });

  if (!membership) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json({ role: membership.role });
}
