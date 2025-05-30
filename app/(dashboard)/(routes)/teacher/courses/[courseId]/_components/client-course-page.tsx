"use client";

import { useState } from "react";
import CourseCard from "./course-info";
import { PostForm } from "../../../posts/_components/post-form";
import { PostList } from "../../../posts/_components/post-list";

// Tip care descrie proprietățile unui curs
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

  // Handler pentru actualizarea listei de postări
  const handlePostUpdated = () => setRefetchKey((prev) => prev + 1);

  return (
    <div className="pt-[50px] px-20 flex flex-col items-center">
      <CourseCard course={course} currentUserId={userId} />
      <PostForm courseId={courseId} onMaterialAdded={handlePostUpdated} />
      <PostList
        courseId={courseId}
        refetchKey={refetchKey}
        onPostUpdated={handlePostUpdated}
        userRole={userRole}
      />
    </div>
  );
};