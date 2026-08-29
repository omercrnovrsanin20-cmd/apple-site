import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionCookie } from "@/lib/auth";

const schema = z.object({ email: z.string().trim().toLowerCase().min(1), password: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation" }, { status: 400 });

  const expectedEmail = process.env.OWNER_EMAIL?.toLowerCase();
  const expectedPassword = process.env.OWNER_PASSWORD;
  if (!expectedEmail || !expectedPassword) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  if (parsed.data.email !== expectedEmail || parsed.data.password !== expectedPassword) {
    return NextResponse.json({ error: "wrongCredentials" }, { status: 401 });
  }

  await createSessionCookie("owner", "owner", "Owner", expectedEmail);
  return NextResponse.json({ ok: true });
}
