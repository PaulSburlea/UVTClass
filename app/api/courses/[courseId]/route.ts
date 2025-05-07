import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = await auth()
        const { courseId } = params;
        const values = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const course = await db.classroom.update({
            where: {
                id: courseId,
                userId
            },
            data: {
                ...values,
            }
        });

        return NextResponse.json(course)

    } catch (error) {
        console.error("[COURSE_ID]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }    
}

export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string } }
  ) {
    try {
      const { userId } = await auth();
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const course = await db.classroom.delete({
        where: {
          id: params.courseId,
          userId, // doar creatorul poate șterge
        },
      });
  
      return NextResponse.json(course);
    } catch (error) {
      console.error("[COURSE_DELETE]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }