import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ClassroomPeople } from "./_components/people";
import { CourseSubNavbar } from "@/app/(dashboard)/_components/course-sub-navbar";

import type { UserClassroom } from "@/app/types/userClassroom";

interface Person {
  id: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  email?: string;
}

interface CoursePeoplePageProps {
  params: Promise<{ courseId: string }>;
}

const CoursePeoplePage = async ({ params }: CoursePeoplePageProps) => {
  const { courseId } = await params;
  const { userId } = await auth();
  if (!userId) return redirect("/");

  // Preluăm clasa și utilizatorii înscriși (teacher + students)
  const classroom = await db.classroom.findUnique({
    where: { id: courseId },
    include: { users: true },
  });

  if (!classroom) return redirect("/");

  // Verificăm dacă utilizatorul curent e profesor în această clasă
  const isTeacher = classroom.users.some((u: UserClassroom) =>
    u.userId === userId && u.role === "TEACHER"
  );
  if (!isTeacher) {
    // Dacă nu e profesor, îl trimitem către vizualizarea studentului
    return redirect(`/student/courses/${courseId}/people`);
  }

  const teacherEntry = classroom.users.find(
    (u: UserClassroom) => u.role === "TEACHER"
  );
  if (!teacherEntry) return redirect("/");

  // Folosim Clerk Client pentru a prelua datele complete ale profesorului
  const client = await clerkClient();

  const prof = await client.users.getUser(teacherEntry.userId);
  const teacher: Person = {
    id: prof.id,
    firstName: prof.firstName ?? undefined,
    lastName: prof.lastName ?? undefined,
    imageUrl: prof.imageUrl ?? undefined,
    email: prof.emailAddresses?.[0]?.emailAddress ?? undefined,
  };

  // Colectăm ID-urile studenților și apoi datele lor din Clerk
  const studentIds: string[] = classroom.users
    .filter((u: UserClassroom) => u.role === "STUDENT")
    .map((u: UserClassroom) => u.userId);

  const studentUsers = await Promise.all(
    studentIds.map((id: string) => client.users.getUser(id))
  );

  const students: Person[] = studentUsers.map((u) => ({
    id: u.id,
    firstName: u.firstName ?? undefined,
    lastName: u.lastName ?? undefined,
    imageUrl: u.imageUrl ?? undefined,
    email: u.emailAddresses?.[0]?.emailAddress ?? undefined,
  }));

  return (
    <>
      <CourseSubNavbar courseId={courseId} />
      <div className="pt-16 px-6">
        {/* Componenta care afișează profesorul și lista de studenți */}
        <ClassroomPeople
          teacher={teacher}
          students={students}
          courseId={courseId}
          canRemove={true}
        />
      </div>
    </>
  );
};

export default CoursePeoplePage;
