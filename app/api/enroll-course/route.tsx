import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const { code } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const classroom = await db.classroom.findUnique({
      where: { code },
    });

    if (!classroom) {
      return new NextResponse("Cursul nu a fost găsit", { status: 404 });
    }

    // Verifică dacă studentul este deja înscris
    const alreadyEnrolled = await db.userClassroom.findUnique({
      where: {
        classroomId_userId: {
          classroomId: classroom.id,
          userId,
        },
      },
    });

    if (alreadyEnrolled) {
      return new NextResponse("Te-ai înscris deja la acest curs!", { status: 400 });
    }

    // Creează înregistrarea de legătură
    await db.userClassroom.create({
      data: {
        classroomId: classroom.id,
        userId,
      },
    });

    return NextResponse.json({ message: "Te-ai înscris cu succes la curs!", classroom });
  } catch (error) {
    console.error("[ENROLL_COURSE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
