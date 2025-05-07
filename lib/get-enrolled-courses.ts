import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const getEnrolledCourses = async () => {
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
