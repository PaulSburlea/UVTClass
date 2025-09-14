"use client";

import { useState } from "react";
import { PostList } from "@/app/(dashboard)/(routes)/teacher/posts/_components/post-list";

interface PostListWrapperProps {
  courseId: string;
  userId: string;
  userRole: "TEACHER" | "STUDENT";
}

const PostListWrapper = ({
  courseId,
  userId,
  userRole,
}: PostListWrapperProps) => {
  const [refetchKey, setRefetchKey] = useState(0);

  // Callback apelat după crearea/ștergerea/actualizarea unui post
  const handlePostUpdated = () => {
    setRefetchKey((prev) => prev + 1);
  };

  return (
    <PostList
      courseId={courseId}
      refetchKey={refetchKey}
      onPostUpdated={handlePostUpdated}
      editable={false}
      userId={userId}
      userRole={userRole}
    />
  );
};

export default PostListWrapper;
