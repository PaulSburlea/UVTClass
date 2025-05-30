// frontend/app/api/admin/assign-teacher/route.ts

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1) Protecție: doar Admin
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.redirect("/");
  if (!(await db.admin.findUnique({ where: { userId: adminId } }))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2) Email din corpul cererii
  const { email } = await req.json();

  // 3) Obține sau crează utilizatorul în Clerk, FĂRĂ trimitere email
  const clerk = await clerkClient();

  // 3a) Caută după email
  const list = await clerk.users.getUserList({ emailAddress: [email] });
  let teacherUserId: string;

  if (list.data.length > 0) {
    // există deja
    teacherUserId = list.data[0].id;
  } else {
    // nu există → crează un user cu email și parolă random
    const newUser = await clerk.users.createUser({
      emailAddress: [email],
      password: Math.random().toString(36).slice(-8), // parolă temporară
      firstName: "",  
      lastName: "",
    });
    teacherUserId = newUser.id;
    // *nu* trimitem magic link sau invitație aici
  }

  // 4) Upsert în Prisma → model Teacher
  await db.teacher.upsert({
    where:  { userId: teacherUserId },
    update: {},
    create: { userId: teacherUserId },
  });

  return NextResponse.json({ success: true });
}
