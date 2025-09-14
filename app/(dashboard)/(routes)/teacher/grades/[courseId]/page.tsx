import { auth, clerkClient, type User } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

import StudentsSearchList from "./_components/students-search-list";
import { CourseSubNavbar } from "@/app/(dashboard)/_components/course-sub-navbar";

interface ServerProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseStudentsPage(props: ServerProps) {
  const params = await props.params;
  const { courseId } = params;

  // Verificăm dacă utilizatorul este autentificat
  const { userId } = await auth();
  if (!userId) return null;

  // Verificăm dacă utilizatorul este profesor în cursul respectiv
  const membership = await db.userClassroom.findUnique({
    where: { classroomId_userId: { classroomId: courseId, userId } },
  });
  if (!membership || membership.role !== "TEACHER") return null;

  // Obținem toți studenții înscriși în cursul respectiv
  // și extragem ID-urile lor pentru a le folosi în interogarea Clerk
  const studentEntries = await db.userClassroom.findMany({
    where: { classroomId: courseId, role: "STUDENT" },
    select: { userId: true },
  });

  const client = await clerkClient();

  const students: { id: string; name: string }[] = await Promise.all(
    studentEntries.map(async ({ userId }: { userId: string }) => {
      const u: User = await client.users.getUser(userId);
      return {
        id: u.id,
        name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
      };
    })
  );

  return (
    <>
    {/* Sub-navbar pentru navigarea în cadrul cursului */}
      <CourseSubNavbar courseId={courseId} />

      <div className="pt-20 px-6 space-y-6">
        <h1 className="text-xl font-semibold">Studenți înscriși</h1>
        {/* Lista cu căutare și link-uri către fiecare student */}
        <StudentsSearchList
          students={students} 
          courseId={courseId}
        />
      </div>
    </>
  );
}
