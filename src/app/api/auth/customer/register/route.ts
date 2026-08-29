import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSessionCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().max(40).optional(),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }
  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "emailInUse" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const customer = await prisma.customer.create({
    data: { name, email, phone, passwordHash },
  });

  await createSessionCookie("customer", customer.id, customer.name, customer.email);

  return NextResponse.json({ id: customer.id, name: customer.name, email: customer.email });
}
