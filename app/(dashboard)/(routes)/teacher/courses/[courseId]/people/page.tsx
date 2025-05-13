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
  params: { courseId: string };
}

const CoursePeoplePage = async ({ params }: CoursePeoplePageProps) => {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  const classroom = await db.classroom.findUnique({
    where: { id: params.courseId },
    include: { users: true },
  });
  if (!classroom) return redirect("/");

  // doar profesorii pot intra aici
  const isTeacher = classroom.users.some(
    (u) => u.userId === userId && u.role === "TEACHER"
  );
  if (!isTeacher) {
    // dacă nu e profesor, redirecționăm studentul spre pagina lui
    return redirect(`/student/courses/${params.courseId}/people`);
  }

  // extragem profesorul
  const teacherEntry = classroom.users.find((u) => u.role === "TEACHER")!;
  const res = await clerkClient();
  const prof = await res.users.getUser(teacherEntry.userId);
  const teacher: Person = {
    id: prof.id,
    firstName: prof.firstName ?? undefined,
    lastName:  prof.lastName  ?? undefined,
    imageUrl:  prof.imageUrl   ?? undefined,
    email:     prof.emailAddresses?.[0]?.emailAddress ?? undefined,
  };

  // studenții
  const studentIds = classroom.users
    .filter((u) => u.role === "STUDENT")
    .map((u) => u.userId);
  const list     = await res.users.getUserList({ userId: studentIds });
  const students: Person[] = list.data.map((u) => ({
    id:        u.id,
    firstName: u.firstName ?? undefined,
    lastName:  u.lastName  ?? undefined,
    imageUrl:  u.imageUrl   ?? undefined,
    email:     u.emailAddresses?.[0]?.emailAddress ?? undefined,
  }));

  return (
    <>
      <CourseSubNavbar courseId={params.courseId} />
      <div className="pt-20 px-6">
        <ClassroomPeople
          teacher={teacher}
          students={students}
          courseId={params.courseId}
          canRemove={true}   // profesorul poate elimina studenți
        />
      </div>
    </>
  );
};

export default CoursePeoplePage;
