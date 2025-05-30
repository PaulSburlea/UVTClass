import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { EmailAddressResource } from "@clerk/types";

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    // Apelezi clerkClient() pentru a obține instanța propriu-zisă
    const client = await clerkClient();

    // Folosești client.users
    const user = await client.users.getUser(id);

    // Narrowing cu tipul EmailAddressResource
    const email = (user.emailAddresses as EmailAddressResource[])
      .find((e) => typeof e.emailAddress === "string")
      ?.emailAddress;

    if (!email) {
      return new NextResponse("No email", { status: 404 });
    }

    return NextResponse.json({ email });
  } catch (_err) {
    console.error("Clerk getUser error:", _err);
    return new NextResponse("User not found", { status: 404 });
  }
}
