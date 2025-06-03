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
  const { userId } = await auth();
  if (!userId) return null;

  // verificăm că e teacher
  const membership = await db.userClassroom.findUnique({
    where: { classroomId_userId: { classroomId: courseId, userId } },
  });
  if (!membership || membership.role !== "TEACHER") return null;

  // luăm studenții înscriși (TS află că rezultatul are forma { userId: string }[])
  const studentEntries = await db.userClassroom.findMany({
    where: { classroomId: courseId, role: "STUDENT" },
    select: { userId: true },
  });

  // instanțiem Clerk client
  const client = await clerkClient();

  // tipăm expliciti parametrul { userId } ca fiind string
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
      {/* Sub-navbar fixed */}
      <CourseSubNavbar courseId={courseId} />

      {/* Conținutul are padding-top pentru a nu fi acoperit de sub-navbar */}
      <div className="pt-20 px-6 space-y-6">
        <h1 className="text-xl font-semibold">Studenți înscriși</h1>
        <StudentsSearchList students={students} courseId={courseId} />
      </div>
    </>
  );
}
