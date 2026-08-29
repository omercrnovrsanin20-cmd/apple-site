import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";

export async function GET() {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const workOrders = await prisma.workOrder.findMany({
    include: {
      vehicle: true,
      service: true,
      checklistItems: true,
      photos: true,
      appointment: { include: { customer: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ workOrders });
}
