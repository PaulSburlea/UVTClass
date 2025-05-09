"use client";

import { useState } from "react";
import CourseCard from "./course-info";
import { PostForm } from "./post-form";
import { PostList } from "./post-list";

interface ClientCoursePageProps {
  courseId: string;
  userId: string;
  course: any;
}

export const ClientCoursePage = ({
  courseId,
  userId,
  course,
}: ClientCoursePageProps) => {
  const [refetchKey, setRefetchKey] = useState(0);

  // Handler pentru actualizarea postării
  const handlePostUpdated = () => {
    setRefetchKey((prev) => prev + 1);  // Actualizează refetchKey când o postare este editată
  };

  return (
    <div className="pt-[50px] px-20 flex flex-col items-center">
      <CourseCard course={course} currentUserId={userId} />
      <PostForm courseId={courseId} onMaterialAdded={() => setRefetchKey((prev) => prev + 1)} />
      <PostList 
        courseId={courseId} 
        refetchKey={refetchKey} 
        onPostUpdated={handlePostUpdated}  // Transmite funcția onPostUpdated
      />
    </div>
  );
};
