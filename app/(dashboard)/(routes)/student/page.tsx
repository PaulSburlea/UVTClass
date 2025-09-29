import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Classroom } from "@/app/types/classroom";
import { getEnrolledCourses } from "@/lib/get-enrolled-courses";
import { CourseCard } from "../teacher/courses/[courseId]/_components/course-card";

export default async function HomePage() {
  // Verifică autentificarea
  const { userId } = await auth();
  if (!userId) return redirect("/");

  // Redirect dacă e admin
  const isAdmin = await db.admin.findUnique({ where: { userId } });
  if (isAdmin) return redirect("/admin");

  // Redirect dacă e profesor
  const isTeacher = await db.teacher.findUnique({ where: { userId } });
  if (isTeacher) return redirect("/teacher");

  // Fetch cursurile studentului
  // Tipăm rezultatul explicit cu Classroom[]
  const courses: Classroom[] = await getEnrolledCourses();

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-7">Cursurile la care te-ai înscris</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}        // Acum respectă exact tipul Classroom
            currentUserId={userId!}
          />
        ))}
      </div>
    </div>
  );
}
