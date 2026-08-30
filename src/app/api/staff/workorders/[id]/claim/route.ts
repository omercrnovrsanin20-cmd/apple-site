import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = Number((await ctx.params).id);

  const workOrder = await prisma.workOrder.findUnique({ where: { id } });
  if (!workOrder) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.workOrderAssignment.upsert({
    where: { workOrderId_staffId: { workOrderId: id, staffId: staff.sub } },
    create: { workOrderId: id, staffId: staff.sub },
    update: {},
  });

  const updated = await prisma.workOrder.findUnique({
    where: { id },
    include: { assignments: { include: { staff: { select: { id: true, name: true } } } } },
  });
  return NextResponse.json({ workOrder: updated });
}
