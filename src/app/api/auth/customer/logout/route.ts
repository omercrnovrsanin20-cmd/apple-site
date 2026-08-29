import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie("customer");
  return NextResponse.json({ ok: true });
}
