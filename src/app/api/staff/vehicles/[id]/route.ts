import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const vehicle = await prisma.vehicle.findUnique({ where: { id }, include: { customer: true } });
  if (!vehicle) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [workOrders, photos, requests] = await Promise.all([
    prisma.workOrder.findMany({
      where: { vehicleId: id },
      include: { service: true, checklistItems: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.photo.findMany({ where: { vehicleId: id }, orderBy: { createdAt: "desc" } }),
    prisma.appointmentRequest.findMany({ where: { vehicleId: id }, include: { service: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return NextResponse.json({ vehicle, workOrders, photos, requests });
}
