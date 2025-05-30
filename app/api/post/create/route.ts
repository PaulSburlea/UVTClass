// frontend/app/api/post/create/route.ts

import { NextResponse }             from "next/server";
import { auth, clerkClient }        from "@clerk/nextjs/server";
import { db }                       from "@/lib/db";
import { writeFile }                from "fs/promises";
import path                         from "path";
import { v4 as uuidv4 }             from "uuid";
import { MaterialType, UserRole }   from "@prisma/client";
import { sendMail }                 from "@/lib/mailer";

export async function POST(req: Request) {
  // ————————————————— existing logic —————————————————
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  const formData = await req.formData();
  const courseId = formData.get("courseId") as string;
  const title    = formData.get("title") as string;
  const content  = formData.get("content")?.toString().trim();

  if (!courseId || !title) {
    return new NextResponse("Missing required data", { status: 400 });
  }

  const post = await db.post.create({
    data: {
      authorId:    userId,
      authorName:  userName,
      classroomId: courseId,
      title,
      content:     content || undefined,
    },
  });

  const links = formData.getAll("links") as string[];
  const types = formData.getAll("types") as string[];

  for (let i = 0; i < links.length; i++) {
    const url     = links[i];
    const typeKey = types[i] as keyof typeof MaterialType;
    const type    = MaterialType[typeKey] ?? MaterialType.LINK;

    await db.material.create({
      data: {
        title:  "Material extern",
        name:   url,
        type,
        url,
        postId: post.id,
      },
    });
  }

  const files = formData.getAll("files") as File[];
  for (const file of files) {
    const buffer     = Buffer.from(await file.arrayBuffer());
    const ext        = path.extname(file.name);
    const fileName   = `${uuidv4()}${ext}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(uploadPath, buffer);

    await db.material.create({
      data: {
        name:     file.name,
        title:    file.name,
        type:     MaterialType.FILE,
        filePath: `/uploads/${fileName}`,
        postId:   post.id,
      },
    });
  }
  // ——————————————————————————————————————————————

  // ————————— email notification logic ——————————
// … (toate importurile şi logica de salvare de mai sus rămân neschimbate) …

  // ————————— email notification logic ——————————
  // 1. Preluăm studenții înscriși
  const enrollments = await db.userClassroom.findMany({
    where: {
      classroomId: courseId,
      role:        UserRole.STUDENT,
    },
    select: { userId: true },
  });
  const studentIds = enrollments.map(e => e.userId);

  // 2. Luăm obiectele User din Clerk
  const studentResponse = await client.users.getUserList({ userId: studentIds });
  const students = studentResponse.data;

  // 3. Construim link-ul către postare
  const baseUrl    = process.env.NEXT_PUBLIC_BASE_URL;
  const linkToPost = `${baseUrl}/student/courses/${courseId}/details/${post.id}`;

  // 4. Trimitem câte un email fiecărui student
  const emailJobs = students.map((stu) => {
    const to = stu.primaryEmailAddress?.emailAddress
      ?? stu.emailAddresses[0]?.emailAddress
      ?? "";
    const name = [stu.firstName, stu.lastName].filter(Boolean).join(" ") || "student";

    return sendMail({
      to,
      subject: `${userName} a adăugat un material nou la cursul tău`,  // ← aici
      html:    `
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

  // 5. Așteptăm toate promisiunile (allSettled pentru robustețe)
  const results = await Promise.allSettled(emailJobs);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `❌ Email către ${students[i].id} (${students[i].primaryEmailAddress?.emailAddress}) a eșuat:`,
        r.reason
      );
    }
  });
  // ——————————————————————————————————————————————

  return NextResponse.json(post);
}
