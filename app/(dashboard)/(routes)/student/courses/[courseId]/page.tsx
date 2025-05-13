// frontend/app/(dashboard)/(routes)/student/courses/[courseId]/page.tsx
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseSubNavbar } from "@/app/(dashboard)/_components/course-sub-navbar";
import CourseCard from "../../../teacher/courses/[courseId]/_components/course-info";
import PostListWrapper from "./_components/post-list-wrapper";

export const dynamic = "force-dynamic";

interface CourseIdPageProps {
  params: Promise<{ courseId: string }>;
}

const StudentCoursePage = async ({ params }: CourseIdPageProps) => {
  const { courseId } = await params;
  const { userId } = await auth();
  if (!userId) return redirect("/");

  const enrollment = await db.userClassroom.findFirst({
    where: { classroomId: courseId, userId },
  });
  if (!enrollment) return redirect("/student/courses");

  const course = await db.classroom.findUnique({ where: { id: courseId } });
  if (!course) return redirect("/student/courses");

  // rolul vine din tabela userClassroom
  const userRole = enrollment.role; 

  return (
    <>
      <CourseSubNavbar courseId={courseId} />
      <div className="pt-[50px] px-20 flex flex-col items-center">
        <CourseCard course={course} currentUserId={userId} />
        <PostListWrapper
          courseId={courseId}
          userId={userId}
          userRole={userRole}
        />
      </div>
    </>
  );
};

export default StudentCoursePage;
