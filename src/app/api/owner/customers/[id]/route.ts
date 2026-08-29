import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOwnerSession } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: true,
      requests: { include: { service: true, vehicle: true }, orderBy: { createdAt: "desc" } },
      appointments: { include: { service: true, vehicle: true, workOrder: true }, orderBy: { date: "desc" } },
    },
  });
  if (!customer) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ customer });
}
