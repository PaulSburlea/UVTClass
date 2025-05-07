import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

// Funcție care generează un cod alfanumeric
function generateCourseCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function generateUniqueCode(): Promise<string> {
    let code = "";
    let exists = true;

    while (exists) {
        code = generateCourseCode(5 + Math.floor(Math.random() * 4)); // 5–8 caractere
        const existing = await db.classroom.findUnique({
            where: { code },
        });
        exists = !!existing;
    }

    return code;
}


export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const { name } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const code = await generateUniqueCode();

        const course = await db.classroom.create({
            data: {
                userId: userId,
                name: name,
                code,
            },
        });

        return NextResponse.json(course);
    } catch (error) {
        console.log("[COURSES]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
      const { userId } = await auth();
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const courses = await db.classroom.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
  
      return NextResponse.json(courses);
    } catch (error) {
      console.error("[GET_COURSES]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }
  