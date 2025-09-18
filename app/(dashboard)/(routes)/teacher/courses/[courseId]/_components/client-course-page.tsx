"use client";

import { useState } from "react";

import CourseCard from "./course-info";
import { PostForm } from "../../../posts/_components/post-form";
import { PostList } from "../../../posts/_components/post-list";

interface Course {
  id: string;
  userId: string;
  name: string;
  section: string | null;
  room: string | null;
  subject: string | null;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientCoursePageProps {
  courseId: string;
  userId: string;
  course: Course;
  userRole: "TEACHER" | "STUDENT";
}

export const ClientCoursePage = ({
  courseId,
  userId,
  course,
  userRole,
}: ClientCoursePageProps) => {
  const [refetchKey, setRefetchKey] = useState(0);

  // Callback apelat când se adaugă sau modifică conținutul unui post
  const handlePostUpdated = () => setRefetchKey((prev) => prev + 1);

  return (
    <div className="pt-12 px-4 sm:px-6 lg:px-20 flex flex-col items-center">
      {/* Card cu informații generale despre curs */}
      <div className="w-full max-w-3xl">
        <CourseCard
          course={course}
          currentUserId={userId}
        />
      </div>

      {/* Formular pentru adăugarea de postări */}
      <div className="w-full max-w-3xl mt-6">
        <PostForm
        courseId={courseId}
        onMaterialAdded={handlePostUpdated}
        />
      </div>

      {/* Listă de postări */}
      <div className="w-full max-w-3xl mt-6">
        <PostList
          courseId={courseId}
          refetchKey={refetchKey}
          onPostUpdated={handlePostUpdated}
          userRole={userRole}
        />
      </div>
    </div>
  );
};
