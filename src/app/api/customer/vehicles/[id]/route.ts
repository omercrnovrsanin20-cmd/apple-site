import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";

const schema = z.object({
  make: z.string().trim().min(1).max(60).optional(),
  model: z.string().trim().min(1).max(60).optional(),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  licensePlate: z.string().trim().max(30).optional(),
});

async function assertOwnership(vehicleId: string, customerId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle || vehicle.customerId !== customerId) return null;
  return vehicle;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const vehicle = await assertOwnership(id, session.sub);
  if (!vehicle) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [workOrders, photos] = await Promise.all([
    prisma.workOrder.findMany({
      where: { vehicleId: id },
      include: { service: true, appointment: true, checklistItems: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.photo.findMany({ where: { vehicleId: id }, orderBy: { createdAt: "desc" } }),
  ]);

  return NextResponse.json({ vehicle, workOrders, photos });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const vehicle = await assertOwnership(id, session.sub);
  if (!vehicle) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation" }, { status: 400 });

  const updated = await prisma.vehicle.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ vehicle: updated });
}
