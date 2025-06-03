// frontend/app/api/post/[postId]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { MaterialType } from "@prisma/client";

async function requireEnrollment(postId: string, userId: string) {
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) return false;
  // orice rol (TEACHER sau STUDENT) permite GET
  const e = await db.userClassroom.findFirst({
    where: { classroomId: post.classroomId, userId },
  });
  return !!e;
}

async function requireTeacher(postId: string, userId: string) {
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) return false;
  // doar TEACHER poate modifica/șterge
  const e = await db.userClassroom.findFirst({
    where: {
      classroomId: post.classroomId,
      userId,
      role: "TEACHER",
    },
  });
  return !!e;
}

// ── DELETE ─────────────────────────────────────────────────────────────────────
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  if (!(await requireTeacher(postId, userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    await db.material.deleteMany({ where: { postId } });
    await db.post.delete({ where: { id: postId } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Eroare la ștergerea postării:", err);
    return new NextResponse("Eroare la server", { status: 500 });
  }
}

// ── PUT ────────────────────────────────────────────────────────────────────────
export async function PUT(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  if (!(await requireTeacher(postId, userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const formData = await request.formData();
  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString() ?? null;
  if (!title) return new NextResponse("Titlul este obligatoriu", { status: 400 });

  const removedIds = formData.getAll("removedIds").map((id) => id.toString());

  try {
    if (removedIds.length) {
      await db.material.deleteMany({ where: { id: { in: removedIds } } });
    }
    const updatedPost = await db.post.update({
      where: { id: postId },
      data: { title, content, editedAt: new Date() },
    });

    const links = formData.getAll("links") as string[];
    const types = formData.getAll("types") as string[];
    for (let i = 0; i < links.length; i++) {
      const url = links[i];
      const typeStr = types[i] as keyof typeof MaterialType;
      const type = MaterialType[typeStr] || MaterialType.LINK;
      await db.material.create({
        data: { title: "Material extern", name: url, type, url, postId },
      });
    }

    const files = formData.getAll("files") as Blob[];
    for (const blob of files) {
      const file = blob as File;
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name);
      const fileName = `${uuidv4()}${ext}`;
      const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(uploadPath, buffer);
      await db.material.create({
        data: {
          name: file.name,
          title: file.name,
          type: MaterialType.FILE,
          filePath: `/uploads/${fileName}`,
          postId,
        },
      });
    }
    return NextResponse.json(updatedPost);
  } catch (err) {
    console.error("Eroare la actualizarea postării:", err);
    return new NextResponse("Eroare la server", { status: 500 });
  }
}

// ── GET ────────────────────────────────────────────────────────────────────────
export async function GET(
  _request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  if (!(await requireEnrollment(postId, userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: { materials: true },
    });
    if (!post) return new NextResponse("Post not found", { status: 404 });
    return NextResponse.json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    return new NextResponse("Error fetching post", { status: 500 });
  }
}
