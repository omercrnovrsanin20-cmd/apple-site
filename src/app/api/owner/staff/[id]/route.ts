import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOwnerSession } from "@/lib/auth";

const schema = z.object({ active: z.boolean() });

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation" }, { status: 400 });

  const staff = await prisma.staffAccount.update({
    where: { id },
    data: { active: parsed.data.active },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json({ staff });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  await prisma.staffAccount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
