import { useEffect, useState } from "react";

export function useIsTeacher(classroomId: string) {
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const res = await fetch(`/api/classrooms/${classroomId}/role`);
      if (!res.ok) return;
      const data = await res.json();
      setIsTeacher(data.role === "TEACHER");
    };
    checkRole();
  }, [classroomId]);

  return isTeacher;
}
