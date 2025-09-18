import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.redirect("/");
  if (!(await db.admin.findUnique({ where: { userId: adminId } }))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Extragem emailul profesorului din request body
  const { email } = await req.json();
  const clerk = await clerkClient();

  // Căutăm userul în Clerk după email
  const list = await clerk.users.getUserList({ emailAddress: [email] });
  let teacherUserId: string;

  if (list.data.length > 0) {
    teacherUserId = list.data[0].id;
  } else {
    const newUser = await clerk.users.createUser({
      emailAddress: [email],
      password: Math.random().toString(36).slice(-8),
      firstName: "",  
      lastName: "",
    });
    teacherUserId = newUser.id;
  }

  // Legăm userul ca profesor în baza noastră
  await db.teacher.upsert({
    where:  { userId: teacherUserId },
    update: {},
    create: { userId: teacherUserId },
  });

  return NextResponse.json({ success: true });
}
