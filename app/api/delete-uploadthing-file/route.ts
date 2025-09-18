import { NextResponse } from "next/server";
import { utapi } from "@/server/uploadthing";

// Endpoint pentru ștergerea unui fișier prin UploadThing API, pe baza unui fileKey furnizat
export async function POST(req: Request) {
  try {
    const { fileKey } = await req.json();
    if (!fileKey) {
      return NextResponse.json(
        { error: "Lipsește fileKey" },
        { status: 400 }
      );
    }

    // Apelăm metoda de ștergere din UploadThing API
    await utapi.deleteFiles(fileKey);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Eroare la ștergerea prin UTapi:", err);
    return NextResponse.json(
      { error: "Nu s-a putut șterge fișierul" },
      { status: 500 }
    );
  }
}
