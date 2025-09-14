import { NextResponse } from "next/server";
import { auth }        from "@clerk/nextjs/server";
import { db }          from "@/lib/db";
import type { MaterialType } from "@/app/types/material";
import { utapi }       from "@/server/uploadthing";

// Verifică dacă userul este înscris la clasa asociată postului
async function requireEnrollment(postId: string, userId: string) {
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) return false;
  const enrollment = await db.userClassroom.findFirst({
    where: { classroomId: post.classroomId, userId },
  });
  return Boolean(enrollment);
}

// Verifică dacă userul are rol de TEACHER în clasa asociată postului
async function requireTeacher(postId: string, userId: string) {
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) return false;
  const roleEntry = await db.userClassroom.findFirst({
    where: {
      classroomId: post.classroomId,
      userId,
      role: "TEACHER",
    },
  });
  return Boolean(roleEntry);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!(await requireTeacher(postId, userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    // 1) Găsim toate materialele de tip FILE asociate postării
    const fileMaterials = await db.material.findMany({
      where: {
        postId,
        type: "FILE",
      },
      select: {
        id: true,
        fileKey: true,
      },
    });

    // 2) Pentru fiecare material, ștergem fișierul din UploadThing
    for (const mat of fileMaterials) {
      if (mat.fileKey) {
        try {
          await utapi.deleteFiles(mat.fileKey);
        } catch (deleteErr) {
          console.error("Eroare la ștergerea UploadThing pentru key:", mat.fileKey, deleteErr);
        }
      }
    }

    // 3) Ștergem materialele din baza de date
    await db.material.deleteMany({
      where: { postId },
    });

    // 4) Ștergem postarea
    await db.post.delete({ where: { id: postId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Eroare la ștergerea postării:", error);
    return new NextResponse("Eroare la server", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!(await requireTeacher(postId, userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const formData = await request.formData();
    const title   = formData.get("title")?.toString().trim();
    const content = formData.get("content")?.toString() ?? null;
    if (!title) {
      return new NextResponse("Titlul este obligatoriu", { status: 400 });
    }

    // 1) Ștergem materialele eliminate din frontend
    const removedIds = formData.getAll("removedIds").map((id) => id.toString());
    if (removedIds.length > 0) {
      await db.material.deleteMany({ where: { id: { in: removedIds } } });
    }

    // 2) Actualizăm postarea
    const updatedPost = await db.post.update({
      where: { id: postId },
      data: { title, content, editedAt: new Date() },
    });

    // 3) Procesăm link-urile externe (YOUTUBE / DRIVE / LINK)
    const links = formData.getAll("links") as string[];
    const types = formData.getAll("types") as string[];
    for (let i = 0; i < links.length; i++) {
      const url   = links[i];
      let typeStr = types[i] as MaterialType;
      if (!["FILE", "YOUTUBE", "DRIVE", "LINK"].includes(typeStr)) {
        typeStr = "LINK";
      }
      await db.material.create({
        data: {
          title:  "Material extern",
          name:   url,
          type:   typeStr,
          url,
          postId,
        },
      });
    }

    // 4) Încarcăm eventualele fișiere noi prin UploadThing
    const files     = formData.getAll("files") as File[];
    const fileNames = formData.getAll("fileNames").map((f) => f.toString());
    if (files.length > 0) {
      // utapi.uploadFiles returnează un array de { key, url, mimeType, size }
      const results = await utapi.uploadFiles(files);

      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        if (res.error) {
          console.error("UploadThing error la fișier index", i, res.error);
          continue;
        }
        const uf = res.data; 

        await db.material.create({
          data: {
            title:    fileNames[i],
            name:     fileNames[i],
            filePath: fileNames[i], 
            fileKey:  uf.key, 
            type:     "FILE",
            url:      uf.ufsUrl,
            postId,
          },
        });
      }
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Eroare la actualizarea postării:", error);
    return new NextResponse("Eroare la server", { status: 500 });
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!(await requireEnrollment(postId, userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    // Preluăm postarea cu materialele asociate
    const post = await db.post.findUnique({
      where: { id: postId },
      include: { materials: true },
    });
    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return new NextResponse("Error fetching post", { status: 500 });
  }
}
