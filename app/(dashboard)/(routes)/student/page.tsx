import { getEnrolledCourses } from "@/lib/get-enrolled-courses";
import { CourseCard } from "../teacher/courses/[courseId]/_components/course-card";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  const isAdmin = await db.admin.findUnique({ where: { userId } });
  if (isAdmin) return redirect("/admin");

  const isTeacher = await db.teacher.findUnique({ where: { userId } });
  if (isTeacher) return redirect("/teacher");

  const courses = await getEnrolledCourses();

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-7">Cursurile la care te-ai înscris</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            currentUserId={userId!}
          />
        ))}
      </div>
    </div>
  );
}
