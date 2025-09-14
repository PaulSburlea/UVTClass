import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function DashboardLanding() {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  // 1. admin?
  const isAdmin = await db.admin.findUnique({ where: { userId } });
  if (isAdmin) return redirect("/admin");

  // 2. teacher?
  const isTeacher = await db.teacher.findUnique({ where: { userId } });
  if (isTeacher) return redirect("/teacher");

  // 3. student
  return redirect("/student");

  
}
