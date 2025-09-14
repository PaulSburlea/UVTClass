import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ClassroomPeople } from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/people/_components/people";
import { CourseSubNavbar } from "@/app/(dashboard)/_components/course-sub-navbar";

interface Person {
  id: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  email?: string;
}

interface PageProps {
  params: Promise<{ courseId: string }>;
}

type UserClassroomMinimal = {
  role: string;
  userId: string;
};

export default async function StudentCoursePeoplePage(props: PageProps) {
  const { courseId } = await props.params;
  const { userId } = await auth();
  if (!userId) return redirect("/");

  // Verifica dacă utilizatorul este înscris ca student în curs
  const enr = await db.userClassroom.findFirst({
    where: { classroomId: courseId, userId, role: "STUDENT" },
  });
  if (!enr) {
    // Dacă nu e student, redirecționează la versiunea de profesor
    return redirect(`/teacher/courses/${courseId}/people`);
  }

  // Încarcă detaliile clasei și lista de utilizatori
  const classroom = await db.classroom.findUnique({
    where: { id: courseId },
    include: { users: true },
  });
  if (!classroom) return redirect("/student");

  // Extrage intrarea profesorului din lista de utilizatori
  const teacherEntry = (classroom.users as UserClassroomMinimal[]).find(
    (u) => u.role === "TEACHER"
  )!;

  // Preia datele profesorului de la Clerk
  const res = await clerkClient();
  const prof = await res.users.getUser(teacherEntry.userId);
  const teacher: Person = {
    id: prof.id,
    firstName: prof.firstName ?? undefined,
    lastName: prof.lastName ?? undefined,
    imageUrl: prof.imageUrl ?? undefined,
    email: prof.emailAddresses?.[0]?.emailAddress ?? undefined,
  };

  // Colectează ID-urile studenților și preia datele lor
  const studentIds = (classroom.users as UserClassroomMinimal[])
    .filter((u) => u.role === "STUDENT")
    .map((u) => u.userId);

  const list = await res.users.getUserList({ userId: studentIds });
  const students: Person[] = list.data.map((u) => ({
    id: u.id,
    firstName: u.firstName ?? undefined,
    lastName: u.lastName ?? undefined,
    imageUrl: u.imageUrl ?? undefined,
    email: u.emailAddresses?.[0]?.emailAddress ?? undefined,
  }));

  return (
    <>
      {/* Sub-navbar specific cursului */}
      <CourseSubNavbar courseId={courseId} />

      <div className="pt-20 px-6">
        {/* Afișează profesorul și studenții înscriși */}
        <ClassroomPeople
          teacher={teacher}
          students={students}
          courseId={courseId}
          canRemove={false}
        />
      </div>
    </>
  );
}
