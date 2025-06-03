// frontend/app/api/grades/route.ts

import { NextRequest, NextResponse }    from "next/server";
import { db }                          from "@/lib/db";
import { GradeCategory } from "@/app/types/grade";
import { auth, clerkClient }           from "@clerk/nextjs/server";
import { sendMail }                    from "@/lib/mailer";

// etichete prietenoase pentru categorii
const categoryLabels: Record<GradeCategory, string> = {
  EXAM:     "Examen",
  QUIZ:     "Test",
  HOMEWORK: "Temă",
  PROJECT:  "Proiect",
  OTHER:    "Altceva",
};

interface GradePayload {
  id?:       string;
  category:  GradeCategory;
  title:     string;
  date:      string;
  score:     number;
  weight:    number;
  position:  number;
}

// GET: aduce notele ordonate după `position`
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId  = searchParams.get("courseId");
  const studentId = searchParams.get("studentId");

  if (!courseId || !studentId) {
    return NextResponse.json({ error: "Missing courseId or studentId" }, { status: 400 });
  }

  const grades = await db.grade.findMany({
    where:   { courseId, studentId },
    orderBy:{ position: "asc" },
  });

  return NextResponse.json(grades);
}

// DELETE: șterge o notă după id
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gradeId = searchParams.get("id");
  if (!gradeId) {
    return NextResponse.json({ error: "Missing gradeId" }, { status: 400 });
  }
  await db.grade.delete({ where: { id: gradeId } });
  return NextResponse.json({ success: true });
}

// POST: înlocuiește toate notele și apoi notifică studentul
export async function POST(req: NextRequest) {
  // 1. Autentificare
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. Construim client Clerk
  const client = await clerkClient();

  // 3. Parse body
  const { courseId, studentId, grades } = (await req.json()) as {
    courseId: string;
    studentId: string;
    grades:   GradePayload[];
  };
  if (!courseId || !studentId || !Array.isArray(grades)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // 4. Șterge toate notele existente
  await db.grade.deleteMany({ where: { courseId, studentId } });

  // 5. Creează noile note cu poziție
  const created = await db.grade.createMany({
    data: grades.map((g, idx) => ({
      courseId,
      studentId,
      category: g.category,
      title:    g.title,
      date:     new Date(g.date),
      score:    g.score,
      weight:   g.weight ?? 0,
      position: idx,
    })),
  });

  // 6. Preia numele cursului și id‑ul profesorului
  const classroom = await db.classroom.findUnique({
    where:  { id: courseId },
    select: { name: true, userId: true },
  });
  const courseName = classroom?.name ?? "cursul tău";
if (!classroom || !classroom.userId) {
  return NextResponse.json({ error: "Invalid classroom" }, { status: 404 });
}
const profId = classroom.userId;

  // 7. Preia numele profesorului din Clerk
  const prof     = await client.users.getUser(profId);
  const profName = [prof.firstName, prof.lastName].filter(Boolean).join(" ") || "Profesor";

  // 8. Construiește sumarul cu etichete prietenoase
  const lines = grades
    .map(g => `• ${categoryLabels[g.category]} "${g.title}": ${g.score} (pond. ${g.weight}%)`)
    .join("<br/>");

  // 9. Obține datele studentului
  const student = await client.users.getUser(studentId);
  const to = student.primaryEmailAddress?.emailAddress
    ?? student.emailAddresses[0]?.emailAddress
    ?? "";
  const studentName = [student.firstName, student.lastName].filter(Boolean).join(" ") || "Student";

  // 10. Link către pagina de note (dev/prod)
  const url       = new URL(req.url);
  const baseUrl   = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const gradesUrl = `${baseUrl}/student/grades/${courseId}`;

  // 11. Trimite emailul
  sendMail({
    to,
    fromName: profName,
    subject:  `${profName} a actualizat notele pentru cursul „${courseName}”`,
    html:     `
      <p>Bună, ${studentName},</p>
      <p><strong>${profName}</strong> a adăugat/actualizat următoarele note la cursul <em>${courseName}</em>:</p>
      <p>${lines}</p>
      <p>Vezi toate notele aici: <a href="${gradesUrl}">${courseName} – Note</a></p>
      <hr/>
      <p>Mult succes!</p>
    `,
  }).catch(err => {
    console.error("Eroare la trimiterea email-ului:", err);
  });

  // 12. Răspuns
  return NextResponse.json({ success: true, count: created.count });
}
