import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateCourseCode(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateUniqueCode(): Promise<string> {
  let code: string;
  let exists = true;

  while (exists) {
    code = generateCourseCode(5 + Math.floor(Math.random() * 4)); // 5–8 caractere
    const found = await db.classroom.findUnique({ where: { code } });
    exists = !!found;
  }

  return code!;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();
    const code = await generateUniqueCode();

    // Tranzacție: creăm simultan cursul și link‑ul user–curs
    const [course] = await db.$transaction([
      // 1) Creare classroom
      db.classroom.create({
        data: { userId, name, code },
      }),

      // 2) Legarea creatorului ca profesor (în aceeași tranzacție)
      // (notă: se poate face nested, dar Prisma nu suportă
      //  referințe la id creat inline în același array)
    ]);

    // După ce avem ID-ul noului curs, creăm recordul în UserClassroom
    // pentru rolul de TEACHER:
    await db.userClassroom.create({
      data: {
        classroomId: course.id,
        userId,
        role: "TEACHER",
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSES.POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(_req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const courses = await db.classroom.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(courses);
  } catch (error) {
    console.error("[COURSES.GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
