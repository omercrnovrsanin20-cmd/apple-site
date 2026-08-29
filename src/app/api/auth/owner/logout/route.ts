import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie("owner");
  return NextResponse.json({ ok: true });
}
