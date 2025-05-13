import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const {
    id
  } = params;

  try {
    // Apelează funcția pentru a obține instanța de client
    const client = await clerkClient();

    // Acum ai acces la client.users
    const user = await client.users.getUser(id);

    // Extragi email-ul
    const email = user.emailAddresses.find((e: any) => e.emailAddress)
      ?.emailAddress;
    if (!email) {
      return new NextResponse("No email", { status: 404 });
    }
    return NextResponse.json({ email });
  } catch (err) {
    console.error("Clerk getUser error:", err);
    return new NextResponse("User not found", { status: 404 });
  }
}
