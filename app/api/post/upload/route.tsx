import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { mkdir } from "fs/promises";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExt = path.extname(file.name);
  const fileName = `${uuidv4()}${fileExt}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true }); // asigură-te că folderul există

  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  const publicUrl = `/uploads/${fileName}`;
  return NextResponse.json({ success: true, url: publicUrl });
}
