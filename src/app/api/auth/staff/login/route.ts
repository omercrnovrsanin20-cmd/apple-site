import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const staff = await prisma.staffAccount.findUnique({ where: { email } });
  if (!staff || !staff.active || !(await verifyPassword(password, staff.passwordHash))) {
    return NextResponse.json({ error: "wrongCredentials" }, { status: 401 });
  }

  await createSessionCookie("staff", staff.id, staff.name, staff.email);
  return NextResponse.json({ id: staff.id, name: staff.name, email: staff.email });
}
