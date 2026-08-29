import { NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/auth";

export async function GET() {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ session: null }, { status: 401 });
  return NextResponse.json({ session: { role: "owner", email: session.email } });
}
