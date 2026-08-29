import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie("staff");
  return NextResponse.json({ ok: true });
}
