import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Classroom } from "@/app/types/classroom";
import type { UserClassroom } from "@/app/types/userClassroom";


export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Preluăm relațiile userClassroom pentru utilizator, incluzând datele despre classroom
    const rels = await db.userClassroom.findMany({
      where: { userId },
      include: { classroom: true },
      orderBy: { createdAt: "desc" },
    });

    // Extragem doar obiectele Classroom din relații
    const courses = rels.map(
      (r: UserClassroom & { classroom: Classroom }) => r.classroom
    );

    return NextResponse.json(courses);
  } catch (err) {
    console.error("[GET /api/enrolled-courses]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
