// frontend/app/api/admin/assign-teacher/route.ts
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1) Autentifică și autorizează doar Admin
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.redirect("/");

  const isAdmin = await db.admin.findUnique({ where: { userId: adminId } });
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2) Extrage email din body
  const { email } = await req.json();

  // 3) Apelează funcţia clerkClient() și apoi getUserList
  const res = await clerkClient();
  const usersRes = await res.users.getUserList({ emailAddress: [email] });
  const users = usersRes.data;
  if (users.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const teacherUserId = users[0].id;

  // 4) Upsert în Prisma → model Teacher
  await db.teacher.upsert({
    where:  { userId: teacherUserId },
    update: {},
    create: { userId: teacherUserId },
  });

  return NextResponse.json({ success: true });
}
