// app/api/classroom/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();           // opțional, dacă vrei verificare
  const id = req.nextUrl.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const classroom = await db.classroom.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      section: true,
      code: true,
    },
  });

  if (!classroom) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(classroom);
}
