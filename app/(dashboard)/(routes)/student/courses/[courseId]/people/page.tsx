// app/(dashboard)/(routes)/student/courses/[courseId]/people/page.tsx
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

export default async function StudentCoursePeoplePage(props: PageProps) {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) return redirect("/");

  // doar studenții înscriși pot intra
  const enr = await db.userClassroom.findFirst({
    where: { classroomId: params.courseId, userId, role: "STUDENT" },
  });
  if (!enr) {
    // dacă nu e student, redirecționăm la profesor
    return redirect(`/teacher/courses/${params.courseId}/people`);
  }

  const classroom = await db.classroom.findUnique({
    where: { id: params.courseId },
    include: { users: true },
  });
  if (!classroom) return redirect("/student");

  // obținem profesorul
  const teacherEntry = classroom.users.find((u) => u.role === "TEACHER")!;
  const res   = await clerkClient();
  const prof  = await res.users.getUser(teacherEntry.userId);
  const teacher: Person = {
    id: prof.id,
    firstName: prof.firstName ?? undefined,
    lastName:  prof.lastName  ?? undefined,
    imageUrl:  prof.imageUrl   ?? undefined,
    email:     prof.emailAddresses?.[0]?.emailAddress ?? undefined,
  };

  // ceilalți studenți
  const ids      = classroom.users.filter((u) => u.role === "STUDENT").map((u) => u.userId);
  const list     = await res.users.getUserList({ userId: ids });
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
          canRemove={false}  // student nu poate elimina
        />
      </div>
    </>
  );
}
