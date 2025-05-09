// app/(dashboard)/student/courses/[courseId]/page.tsx
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseSubNavbar } from "@/app/(dashboard)/_components/course-sub-navbar";
import CourseCard from "../../../teacher/courses/[courseId]/_components/course-info";

export const dynamic = "force-dynamic";

interface CourseIdPageProps {
  params: Promise<{ courseId: string }>;
}

const StudentCoursePage = async (props: CourseIdPageProps) => {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) return redirect("/");

  // Verificăm dacă studentul este înscris
  const enrollment = await db.userClassroom.findFirst({
    where: {
      classroomId: params.courseId,
      userId: userId,
    },
  });

  if (!enrollment) return redirect("/student/courses");

  const course = await db.classroom.findUnique({
    where: { id: params.courseId },
  });

  if (!course) return redirect("/student/courses");

  return (
    <>
      <CourseSubNavbar courseId={params.courseId} />
      <div className="pt-[50px] px-20 flex justify-center">
        <CourseCard course={course} currentUserId={userId} />
      </div>
    </>
  );
};

export default StudentCoursePage;
