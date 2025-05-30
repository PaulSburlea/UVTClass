import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET( props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await currentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const membership = await db.userClassroom.findFirst({
    where: {
      userId: user.id,
      classroomId: params.id,
    },
    select: { role: true },
  });

  if (!membership) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json({ role: membership.role });
}
