import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOwnerSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export async function GET() {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const staff = await prisma.staffAccount.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ staff });
}

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.staffAccount.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "emailInUse" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const staff = await prisma.staffAccount.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  return NextResponse.json({ staff });
}
