"use client";


import useSWR from "swr";
import { CourseCard } from "./course-card";
import { Classroom } from "@prisma/client";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const TeacherDashboard = ({ userId }: { userId: string }) => {
  const { data: courses } = useSWR<Classroom[]>("/api/courses", fetcher); // ✅ tiparește

  if (!userId) return null;

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-7">Cursurile tale</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            currentUserId={userId}
          />
        ))}
      </div>
    </div>
  );
};
