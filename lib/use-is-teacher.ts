import { useEffect, useState } from "react";

export function useIsTeacher(classroomId: string) {
  const [isTeacher, setIsTeacher] = useState(false);

useEffect(() => {
  const checkRole = async () => {
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/role`);
      if (!res.ok) return;
      const data = await res.json();
      setIsTeacher(data.role === "TEACHER");
    } catch {
      // pur și simplu rămâne false, nu aruncăm mai departe
    }
  };
  checkRole();
}, [classroomId]);


  return isTeacher;
}
