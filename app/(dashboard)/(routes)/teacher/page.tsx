import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TeacherDashboard } from "./courses/[courseId]/_components/teacher-dashboard";
import { db } from "@/lib/db";

const TeacherPage = async () => {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  const isTeacher = await db.teacher.findUnique({ where: { userId } });
  if (!isTeacher) return redirect("/");

  return <TeacherDashboard userId={userId} />;
};

export default TeacherPage;
