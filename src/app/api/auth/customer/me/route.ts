import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ session: null }, { status: 401 });
  return NextResponse.json({ session: { id: session.sub, name: session.name, email: session.email } });
}
