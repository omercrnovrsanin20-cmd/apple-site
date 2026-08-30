import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = Number((await ctx.params).id);

  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      vehicle: true,
      service: true,
      checklistItems: { orderBy: { order: "asc" } },
      photos: true,
      appointment: { include: { customer: true, request: true } },
      assignments: { include: { staff: { select: { id: true, name: true } } } },
    },
  });
  if (!workOrder) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ workOrder });
}

const notesSchema = z.object({ notes: z.string().max(4000) });

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = Number((await ctx.params).id);

  const body = await req.json().catch(() => null);
  const parsed = notesSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation" }, { status: 400 });

  const workOrder = await prisma.workOrder.update({ where: { id }, data: { notes: parsed.data.notes } });
  return NextResponse.json({ workOrder });
}
