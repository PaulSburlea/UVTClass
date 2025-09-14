import { NextResponse } from "next/server";
import { utapi }        from "@/server/uploadthing";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new NextResponse("No file uploaded", { status: 400 });
  }

  try {
    // Upload fișier folosind UploadThing API
    const results = await utapi.uploadFiles([file]);
    const res = results[0];
    if (res.error || !res.data) {
      console.error("UploadThing error:", res.error);
      return new NextResponse("Error uploading file", { status: 500 });
    }
    const uf = res.data;

    return NextResponse.json({ success: true, url: uf.ufsUrl });
  } catch (err) {
    console.error("UploadThing upload error:", err);
    return new NextResponse("Error uploading file", { status: 500 });
  }
}
