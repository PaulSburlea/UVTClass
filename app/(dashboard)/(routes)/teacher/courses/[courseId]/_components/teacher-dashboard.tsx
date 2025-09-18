"use client";


import useSWR from "swr";

import { CourseCard } from "./course-card";
import type { Classroom } from "@/app/types/classroom";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const TeacherDashboard = ({ userId }: { userId: string }) => {
  // Preia lista de cursuri de la endpoint-ul API
  const { data: courses } = useSWR<Classroom[]>("/api/courses", fetcher);

  if (!userId) return null;

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-7">Cursurile tale</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          // Randează un card pentru fiecare curs
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
