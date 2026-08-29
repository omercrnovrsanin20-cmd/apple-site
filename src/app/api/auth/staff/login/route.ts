import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionCookie } from "@/lib/auth";

const schema = z.object({ password: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation" }, { status: 400 });

  const expected = process.env.STAFF_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  if (parsed.data.password !== expected) {
    return NextResponse.json({ error: "wrongPassword" }, { status: 401 });
  }

  await createSessionCookie("staff", "staff", "Staff");
  return NextResponse.json({ ok: true });
}
