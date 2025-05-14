// app/api/student/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Găsim înscrierile STUDENT pentru acest user
  const enrollments = await db.userClassroom.findMany({
    where: { userId, role: "STUDENT" },
    include: {
      classroom: {
        select: {
          id: true,
          name: true,
          section: true,
          code: true,
          userId: true, // profesorul creator
        },
      },
    },
  });

  // Formăm lista de cursuri
  const courses = await Promise.all(
    enrollments.map(async (enr) => {
      const cls = enr.classroom;
      // Dacă vrei numele profesorului, îl poți prelua din tabela Teacher sau User
      // aici pur și simplu vom afișa un placeholder:
      const teacherName = "—"; 

      return {
        id: cls.id,
        name: cls.name,
        section: cls.section,
        code: cls.code,
        teacherName,
      };
    })
  );

  return NextResponse.json(courses);
}
