import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { MaterialType } from "@prisma/client";

export async function POST(req: Request) {
  // Verifică autentificarea utilizatorului
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // Obține detalii despre utilizator din Clerk
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userName = user.firstName + " " + (user.lastName || "");  // Folosește doar firstName dacă lastName este absent

  const formData = await req.formData();
  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;


  // Verifică dacă datele necesare sunt prezente
  if (!courseId || !content || !title) {
    return new NextResponse("Missing data", { status: 400 });
  }

  // Creează postarea în baza de date
  const post = await db.post.create({
    data: {
      authorId: userId,
      authorName: userName, // Salvează numele autorului
      classroomId: courseId,
      title,
      content,
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
  
  // Creează fișiere
  const files = formData.getAll("files") as File[];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(uploadPath, buffer);

    await db.material.create({
      data: {
        name: file.name,  // Setează numele fișierului
        title: file.name, // Poți folosi numele fișierului și pentru titlu
        type: "FILE",
        filePath: `/uploads/${fileName}`,
        postId: post.id,
      },
    });
  }

  return NextResponse.json(post);
}
