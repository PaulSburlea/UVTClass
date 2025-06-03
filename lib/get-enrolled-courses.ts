import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { Classroom } from "@/app/types/classroom";

export const getEnrolledCourses = async (): Promise<Classroom[]> => {
  const { userId } = await auth();
  if (!userId) return [];

  const courses = await db.classroom.findMany({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return courses;
};
