import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

import { TeacherDashboard } from "./courses/[courseId]/_components/teacher-dashboard";


const TeacherPage = async () => {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  const isTeacher = await db.teacher.findUnique({ where: { userId } });
  if (!isTeacher) return redirect("/");

  return <TeacherDashboard userId={userId} />;
};

export default TeacherPage;
