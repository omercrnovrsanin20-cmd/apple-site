import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";

export async function GET() {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const workOrders = await prisma.workOrder.findMany({
    where: { assignments: { some: { staffId: staff.sub } } },
    include: {
      vehicle: true,
      service: true,
      appointment: { include: { customer: true } },
      assignments: { include: { staff: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ workOrders });
}
