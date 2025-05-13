import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { MaterialType } from "@prisma/client";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userName = user.firstName + " " + (user.lastName || "");

  const formData = await req.formData();
  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content")?.toString().trim();

  // Doar `courseId` și `title` sunt obligatorii
  if (!courseId || !title) {
    return new NextResponse("Missing required data", { status: 400 });
  }

  const post = await db.post.create({
    data: {
      authorId: userId,
      authorName: userName,
      classroomId: courseId,
      title,
      content: content || undefined, // dacă e gol, îl ignorăm complet
    },
  });

  const links = formData.getAll("links") as string[];
  const types = formData.getAll("types") as string[];

  for (let i = 0; i < links.length; i++) {
    const url = links[i];
    const typeStr = types[i] as keyof typeof MaterialType;
    const type = MaterialType[typeStr] ?? MaterialType.LINK;

    await db.material.create({
      data: {
        title: "Material extern",
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
        name: file.name,
        title: file.name,
        type: "FILE",
        filePath: `/uploads/${fileName}`,
        postId: post.id,
      },
    });
  }

  return NextResponse.json(post);
}
