// frontend/app/api/admin/teachers/route.ts

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  // 1. authorize
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = await db.admin.findUnique({ where: { userId } });
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. preluăm toți profesorii (TS îi vede ca { userId: string }[])
  const teachers = await db.teacher.findMany({
    select: { userId: true },
  });

  // 3. build răspuns „enhanced”
  const enhanced = await Promise.all(
    teachers.map(async (t: { userId: string }) => {
      // 3a. info Clerk
      const client = await clerkClient();
      const user = await client.users.getUser(t.userId);
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || "N/A";
      const email = user.emailAddresses?.[0]?.emailAddress || "N/A";

      // 3b. cursurile pe care le-a creat (model Classroom.userId)
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
