import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseSubNavbar } from "@/app/(dashboard)/_components/course-sub-navbar";
import { ClientCoursePage } from "./_components/client-course-page";

export const dynamic = "force-dynamic";

interface CourseIdPageProps {
  params: Promise<{ courseId: string }>;
}

const CourseIdPage = async (props: CourseIdPageProps) => {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) return redirect("/");

  const course = await db.classroom.findUnique({
    where: { id: params.courseId },
  });
  if (!course) return redirect("/");

  return (
    <>
      <CourseSubNavbar courseId={params.courseId} />
      <ClientCoursePage courseId={params.courseId} userId={userId} course={course} userRole="TEACHER" />
    </>
  );
};

export default CourseIdPage;
