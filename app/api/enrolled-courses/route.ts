// frontend/app/api/enrolled-courses/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Găsim toate legăturile user–curs
    const rels = await db.userClassroom.findMany({
      where: { userId },
      include: { classroom: true },
      orderBy: { createdAt: "desc" },
    });

    // Extragem doar obiectele Classroom
    const courses = rels.map(r => r.classroom);

    return NextResponse.json(courses);
  } catch (err) {
    console.error("[GET /api/enrolled-courses]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
