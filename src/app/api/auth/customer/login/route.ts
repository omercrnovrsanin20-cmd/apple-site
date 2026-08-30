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

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !customer.passwordHash || !(await verifyPassword(password, customer.passwordHash))) {
    return NextResponse.json({ error: "wrongCredentials" }, { status: 401 });
  }

  await createSessionCookie("customer", customer.id, customer.name, customer.email);
  return NextResponse.json({ id: customer.id, name: customer.name, email: customer.email });
}
