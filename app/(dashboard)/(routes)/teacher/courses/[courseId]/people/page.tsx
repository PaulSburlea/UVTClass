// app/(dashboard)/(routes)/teacher/courses/[courseId]/people/page.tsx

import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClassroomPeople } from "./_components/people";
import { CourseSubNavbar } from "@/app/(dashboard)/_components/course-sub-navbar";

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

  const classroom = await db.classroom.findUnique({
    where: { id: courseId },
    include: { users: true },
  });

  if (!classroom) return redirect("/");

  // doar profesorii pot intra aici
  const isTeacher = classroom.users.some(
    (u) => u.userId === userId && u.role === "TEACHER"
  );
  if (!isTeacher) {
    return redirect(`/student/courses/${courseId}/people`);
  }

  // extragem profesorul
  const teacherEntry = classroom.users.find((u) => u.role === "TEACHER");
  if (!teacherEntry) return redirect("/");

  const client = await clerkClient();

  const prof = await client.users.getUser(teacherEntry.userId);
  const teacher: Person = {
    id: prof.id,
    firstName: prof.firstName ?? undefined,
    lastName: prof.lastName ?? undefined,
    imageUrl: prof.imageUrl ?? undefined,
    email: prof.emailAddresses?.[0]?.emailAddress ?? undefined,
  };

  const studentIds: string[] = classroom.users
    .filter((u) => u.role === "STUDENT")
    .map((u) => u.userId);

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
