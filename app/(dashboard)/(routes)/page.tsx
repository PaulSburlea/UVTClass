import { getEnrolledCourses } from "@/lib/get-enrolled-courses";
import { CourseCard } from "./teacher/courses/[courseId]/_components/course-card";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
  const { userId } = await auth();
  const courses = await getEnrolledCourses();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {courses.map((course) => (
        <CourseCard
        key={course.id}
        course={course}
        currentUserId={userId!}
      />
      
      ))}
    </div>
  );
}
