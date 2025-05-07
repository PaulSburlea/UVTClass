import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TeacherDashboard } from "./courses/[courseId]/_components/teacher-dashboard";

const TeacherPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  return <TeacherDashboard userId={userId} />;
};

export default TeacherPage;
