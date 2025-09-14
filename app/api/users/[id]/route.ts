import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import type { EmailAddressResource } from "@clerk/types";

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  // Extragem parametrul 'id' din contextul rutării
  const { id } = await props.params;

  try {
    // Obținem clientul Clerk pentru a interoga date despre utilizator
    const client = await clerkClient();

    // Preluăm utilizatorul după id
    const user = await client.users.getUser(id);

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
