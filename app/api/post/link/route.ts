import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";
import path from "path";
import { MaterialType } from "@prisma/client"; // ✅ import enum

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const courseId = formData.get("courseId") as string;
  const content = formData.get("content") as string;
  const title = formData.get("title") as string;
  const typeString = formData.get("type") as string;

  // ✅ convertim stringul într-o valoare din enum
  const type = MaterialType[typeString as keyof typeof MaterialType] ?? MaterialType.LINK;

  if (!courseId || !content) {
    return new NextResponse("Missing data", { status: 400 });
  }

  const post = await db.post.create({
    data: {
      authorId: userId,
      classroomId: courseId,
      title,
      content,
    },
  });

  const links = formData.getAll("links") as string[];
  for (const url of links) {
    await db.material.create({
      data: {
        title: "Link",
        name: url,
        type,
        url,
        postId: post.id,
      },
    });
  }

  const files = formData.getAll("files") as File[];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(uploadPath, buffer);

    await db.material.create({
      data: {
        title: file.name,
        name: file.name,
        type: MaterialType.FILE,
        filePath: `/uploads/${fileName}`,
        postId: post.id,
      },
    });
  }

  return NextResponse.json(post);
}
