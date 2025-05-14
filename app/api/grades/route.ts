import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { GradeCategory } from "@prisma/client";

// GET: aduce notele ordonate după `position`
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const studentId = searchParams.get("studentId");

  if (!courseId || !studentId) {
    return NextResponse.json({ error: "Missing courseId or studentId" }, { status: 400 });
  }

  const grades = await db.grade.findMany({
    where: { courseId, studentId },
    orderBy: { position: "asc" },  // ordonăm după poziție
  });

  return NextResponse.json(grades);
}

// POST: șterge toate notele, apoi le recreează cu poziție din index
export async function POST(req: NextRequest) {
  const { courseId, studentId, grades } = await req.json();

  if (!courseId || !studentId || !Array.isArray(grades)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // șterge toate
  await db.grade.deleteMany({ where: { courseId, studentId } });

  // recreează cu position
  const created = await db.grade.createMany({
    data: grades.map((g: any, idx: number) => ({
      courseId,
      studentId,
      category: g.category as GradeCategory,
      title: g.title,
      date: new Date(g.date),
      score: g.score,
      weight: g.weight ?? 0,
      position: idx,            // poziția exactă din array
    })),
  });

  return NextResponse.json({ success: true, count: created.count });
}

// DELETE pe id-ul unei note individuale
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gradeId = searchParams.get("id");
  if (!gradeId) {
    return NextResponse.json({ error: "Missing gradeId" }, { status: 400 });
  }
  await db.grade.delete({ where: { id: gradeId } });
  return NextResponse.json({ success: true });
}
