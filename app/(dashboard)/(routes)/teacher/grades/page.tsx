import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { BookOpen } from "lucide-react";

export default async function TeacherGradesPage() {
  const { userId } = await auth();
  if (!userId) return null;

  // Preluăm cursurile la care este profesor (role="TEACHER")
  const courses: { id: string; name: string; code: string }[] =
    await db.classroom.findMany({
      where: { users: { some: { userId, role: "TEACHER" } } },
      select: { id: true, name: true, code: true },
    });

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        // Fiecare card este un Link către lista de studenți pentru notare
        <Link
          key={course.id}
          href={`/teacher/grades/${course.id}`}
          className="group block border border-gray-200 rounded-lg p-5 hover:border-blue-400 transition"
          aria-label={`Vezi studenții cursului ${course.name}`}
        >
          <div className="flex items-center space-x-3">
            {/* Iconiță generică pentru curs */}
            <BookOpen className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition" />
            {/* Numele cursului */}
            <h3 className="text-lg font-medium text-gray-800 group-hover:text-blue-600 transition">
              {course.name}
            </h3>
          </div>
          {/* Afișăm codul cursului */}
          <p className="mt-2 text-sm text-gray-500">
            Cod: <span className="font-mono text-gray-700">{course.code}</span>
          </p>
        </Link>
      ))}
    </div>
  );
}
