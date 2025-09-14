import { auth, clerkClient } from "@clerk/nextjs/server";
import { db }                from "@/lib/db";
import { NextResponse }      from "next/server";

export async function GET() {
  // 1. Verificăm autentificarea și rolul de admin
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = await db.admin.findUnique({ where: { userId } });
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Preluăm toți profesorii din baza de date
  const teachers = await db.teacher.findMany({
    select: { userId: true },
  });

  // 3. Construim răspunsul cu informații din Clerk și cursuri
  const enhanced = await Promise.all(
    teachers.map(async (t: { userId: string }) => {
      // 3a. Obținem clientul Clerk
      const client = await clerkClient();

      // 3b. Încercăm să luăm datele de la Clerk; dacă nu există, capturăm eroarea
      let name = "N/A";
      let email = "N/A";
      try {
        const user = await client.users.getUser(t.userId);
        name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "N/A";
        email = user.emailAddresses?.[0]?.emailAddress || "N/A";
      } catch  {
        // Dacă Clerk răspunde cu 404 pentru acest userId, pur și simplu îl ocolim:
        console.warn(`Clerk getUser(${t.userId}) a dat 404, ignorăm acest userId.`);
      }

      // 3c. Preluăm lista de nume ale cursurilor pe care le-a creat profesorul
      const courses = await db.classroom.findMany({
        where: { userId: t.userId },
        select: { name: true },
      });

      return {
        userId: t.userId,
        name,
        email,
        courses: courses.map((c: { name: string }) => c.name),
      };
    })
  );

  return NextResponse.json({ teachers: enhanced });
}
