import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";

const schema = z.object({ completed: z.boolean() });

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string; itemId: string }> }) {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, itemId } = await ctx.params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation" }, { status: 400 });

  const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
  if (!item || item.workOrderId !== Number(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const updated = await prisma.checklistItem.update({ where: { id: itemId }, data: { completed: parsed.data.completed } });
  return NextResponse.json({ item: updated });
}
