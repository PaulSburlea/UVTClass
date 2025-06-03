// frontend/app/api/post/create/route.ts

import { auth }           from "@clerk/nextjs/server";
import { db }             from "@/lib/db";
import { NextResponse }   from "next/server";
import { v4 as uuidv4 }   from "uuid";
import { writeFile }      from "fs/promises";
import path               from "path";

import type { MaterialType } from "@/app/types/material"; // folosim tipurile tale custom

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const courseId   = formData.get("courseId") as string;
  const content    = formData.get("content") as string;
  const title      = formData.get("title") as string;
  const typeString = formData.get("type") as string;

  // Validăm că typeString este unul dintre valorile permise; altfel fallback la "LINK"
  let type = (typeString as MaterialType);
  if (!["FILE", "YOUTUBE", "DRIVE", "LINK"].includes(type)) {
    type = "LINK";
  }

  if (!courseId || !content) {
    return new NextResponse("Missing data", { status: 400 });
  }

  // Creăm postarea
  const post = await db.post.create({
    data: {
      authorId:    userId,
      classroomId: courseId,
      title,
      content,
    },
  });

  // Procesăm link-urile
  const links = formData.getAll("links") as string[];
  for (const url of links) {
    await db.material.create({
      data: {
        title:  "Link",
        name:   url,
        type,       // tipul validat mai sus: "YOUTUBE" | "DRIVE" | "LINK" sau fallback "LINK"
        url,
        postId: post.id,
      },
    });
  }

  // Procesăm fișierele încărcate
  const files = formData.getAll("files") as File[];
  for (const file of files) {
    const buffer   = Buffer.from(await file.arrayBuffer());
    const ext      = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(uploadPath, buffer);

    await db.material.create({
      data: {
        title:    file.name,
        name:     file.name,
        type:     "FILE",                // pentru fișiere setăm direct "FILE"
        filePath: `/uploads/${fileName}`,
        postId:   post.id,
      },
    });
  }

  return NextResponse.json(post);
}
