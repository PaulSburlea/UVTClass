import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Generează un cod aleator pentru curs, de lungime dată
function generateCourseCode(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generează un cod unic în baza de date
async function generateUniqueCode(): Promise<string> {
  let code: string;
  let exists = true;

  // Repetă până găsește un cod care nu există deja
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

    // Parsăm datele din corp; așteptăm cel puțin 'name'
    const { name } = await req.json();
    // Generăm cod unic pentru curs
    const code = await generateUniqueCode();

    // Creăm cursul și, ulterior, asocierea profesorului.
    const [course] = await db.$transaction([
      db.classroom.create({
        data: { userId, name, code },
      }),

    ]);

    // Asociem creatorul ca profesor în clasa nou creată
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

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Preluăm toate cursurile create de utilizator, ordonate descrescător după dată
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
