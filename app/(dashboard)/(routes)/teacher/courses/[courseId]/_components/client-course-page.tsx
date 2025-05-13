"use client";

import { useState } from "react";
import CourseCard from "./course-info";
import { PostForm } from "../../../posts/_components/post-form";
import { PostList } from "../../../posts/_components/post-list";

interface ClientCoursePageProps {
  courseId: string;
  userId: string;
  course: any;
  userRole: "TEACHER" | "STUDENT"; 
}

export const ClientCoursePage = ({
  courseId,
  userId,
  course,
  userRole,
}: ClientCoursePageProps) => {
  const [refetchKey, setRefetchKey] = useState(0);

  // Handler pentru actualizarea postării
  const handlePostUpdated = () => {
    setRefetchKey((prev) => prev + 1);
  };

  return (
    <div className="pt-[50px] px-20 flex flex-col items-center">
      <CourseCard course={course} currentUserId={userId} />
      <PostForm courseId={courseId} onMaterialAdded={() => setRefetchKey((prev) => prev + 1)} />
      <PostList 
        courseId={courseId} 
        refetchKey={refetchKey} 
        onPostUpdated={handlePostUpdated}
        userRole={userRole}
      />
    </div>
  );
};
