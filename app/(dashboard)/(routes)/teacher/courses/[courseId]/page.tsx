// app/(dashboard)/teacher/courses/[courseId]/page.tsx
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseSubNavbar } from "@/app/(dashboard)/_components/course-sub-navbar";
import CourseCard from "./_components/course-info";
import { PostForm } from "./_components/post-form";
import { PostList } from "./_components/post-list";



export const dynamic = "force-dynamic";

interface CourseIdPageProps {
  params: { courseId: string };
}

const CourseIdPage = async ({ params }: CourseIdPageProps) => {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  const course = await db.classroom.findUnique({
    where: { id: params.courseId },
  });
  if (!course) return redirect("/");

  return (
    <>
      <CourseSubNavbar courseId={params.courseId} />
      <div className="pt-[50px] px-20 flex flex-col items-center">
        <CourseCard course={course} currentUserId={userId} />
        <PostForm courseId={params.courseId} />
        <PostList courseId={params.courseId} refetchKey={0} />
      </div>
    </>
  );
};

export default CourseIdPage;
