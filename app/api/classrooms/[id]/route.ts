import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Extragem ID-ul din URL-ul rutei (ultimul segment din path).
  const id = req.nextUrl.pathname.split("/").pop();
  if (!id) {
    // Returnăm eroare 400 dacă ID-ul lipsește din URL.
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Returnăm eroare 400 dacă ID-ul lipsește din URL.
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

  // Returnăm detaliile classroom-ului în format JSON.
  return NextResponse.json(classroom);
}
