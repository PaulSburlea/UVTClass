import { NextRequest, NextResponse }    from "next/server";
import { db }                          from "@/lib/db";
import { GradeCategory } from "@/app/types/grade";
import { auth, clerkClient }           from "@clerk/nextjs/server";
import { sendMail }                    from "@/lib/mailer";

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

export async function GET(req: NextRequest) {
  // Primeste courseId și studentId din query params și returneaza lista de note pentru acel student în curs,
  // ordonată după câmpul `position`
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

export async function DELETE(req: NextRequest) {
  // Primeste id-ul notei din query param și o șterge din baza de date
  const { searchParams } = new URL(req.url);
  const gradeId = searchParams.get("id");
  if (!gradeId) {
    return NextResponse.json({ error: "Missing gradeId" }, { status: 400 });
  }
  await db.grade.delete({ where: { id: gradeId } });
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  // Autentifica: dacă nu este userLogat, refuza cu 401
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const client = await clerkClient();

  const { courseId, studentId, grades } = (await req.json()) as {
    courseId: string;
    studentId: string;
    grades:   GradePayload[];
  };
  if (!courseId || !studentId || !Array.isArray(grades)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Șterge toate notele existente pentru acel student în curs
  await db.grade.deleteMany({ where: { courseId, studentId } });

  // Creeaza noile înregistrări de note, poziționate după indexul din array
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

  const classroom = await db.classroom.findUnique({
    where:  { id: courseId },
    select: { name: true, userId: true },
  });
  const courseName = classroom?.name ?? "cursul tău";
if (!classroom || !classroom.userId) {
  return NextResponse.json({ error: "Invalid classroom" }, { status: 404 });
}
const profId = classroom.userId;

  const prof     = await client.users.getUser(profId);
  const profName = [prof.firstName, prof.lastName].filter(Boolean).join(" ") || "Profesor";

  const lines = grades
    .map(g => `• ${categoryLabels[g.category]} "${g.title}": ${g.score} (pond. ${g.weight}%)`)
    .join("<br/>");

  const student = await client.users.getUser(studentId);
  const to = student.primaryEmailAddress?.emailAddress
    ?? student.emailAddresses[0]?.emailAddress
    ?? "";
  const studentName = [student.firstName, student.lastName].filter(Boolean).join(" ") || "Student";

  const url       = new URL(req.url);
  const baseUrl   = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const gradesUrl = `${baseUrl}/student/grades/${courseId}`;

  // Trimite email către student cu notificarea despre actualizarea notelor
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

  return NextResponse.json({ success: true, count: created.count });
}
