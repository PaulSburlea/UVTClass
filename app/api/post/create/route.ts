// frontend/app/api/post/create/route.ts

import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { MaterialType } from "@/app/types/material";
import { sendMail } from "@/lib/mailer";

import { utapi } from "@/server/uploadthing";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  const formData = await req.formData();
  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content")?.toString().trim();

  if (!courseId || !title) {
    return new NextResponse("Missing required data", { status: 400 });
  }

  const post = await db.post.create({
    data: {
      authorId: userId,
      authorName: userName,
      classroomId: courseId,
      title,
      content: content || undefined,
    },
  });

  const links = formData.getAll("links") as string[];
  const types = formData.getAll("types") as string[];
  for (let i = 0; i < links.length; i++) {
    const url = links[i];
    let typeStr = types[i] as MaterialType;
    if (!["FILE", "YOUTUBE", "DRIVE", "LINK"].includes(typeStr)) {
      typeStr = "LINK";
    }

    await db.material.create({
      data: {
        title: "Material extern",
        name: url,
        type: typeStr,
        url,
        postId: post.id,
      },
    });
  }

  const files = formData.getAll("files") as File[];
  const fileNames = formData.getAll("fileNames") as string[];

  if (files.length > 0) {
    try {
      const results = await utapi.uploadFiles(files);

      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        if (res.error) {
          console.error("UploadThing error la index", i, res.error);
          continue;
        }

        const uf = res.data;
        const originalName = fileNames[i] || uf.key;

        await db.material.create({
          data: {
            title: originalName,
            name: originalName,
            filePath: originalName,
            type: "FILE",
            url: uf.ufsUrl,
            fileKey: uf.key,
            postId: post.id,
          },
        });
      }
    } catch (err) {
      console.error("UploadThing upload error:", err);
      return new NextResponse("Error uploading files", { status: 500 });
    }
  }

  // ─── Notificări email către studenți ──────────────────────────────
  const enrollments = await db.userClassroom.findMany({
    where: { classroomId: courseId, role: "STUDENT" },
    select: { userId: true },
  });
  const studentIds = enrollments.map((e) => e.userId);
  const studentResponse = await client.users.getUserList({ userId: studentIds });
  const students = studentResponse.data;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const linkToPost = `${baseUrl}/student/courses/${courseId}/details/${post.id}`;

  const emailJobs = students.map((stu) => {
    const to =
      stu.primaryEmailAddress?.emailAddress ??
      stu.emailAddresses[0]?.emailAddress ??
      "";
    const name = [stu.firstName, stu.lastName].filter(Boolean).join(" ") || "student";

    return sendMail({
      to,
      subject: `${userName} a adăugat un material nou la cursul tău`,
      html: `
        <p>Bună, ${name},</p>
        <p><strong>${userName}</strong> a adăugat un material nou la curs: <strong>${title}</strong>.</p>
        ${content ? `<p>${content}</p>` : ""}
        <p>Vezi materialul aici: <a href="${linkToPost}">${title}</a></p>
        <hr/>
        <p>O zi bună!</p>
      `,
      fromName: userName,
    });
  });

  const emailResults = await Promise.allSettled(emailJobs);
  emailResults.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`❌ Email către student idx ${i} a eșuat:`, r.reason);
    }
  });

  return NextResponse.json(post);
}
