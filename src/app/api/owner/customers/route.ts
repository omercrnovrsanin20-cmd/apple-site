import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOwnerSession } from "@/lib/auth";

export async function GET() {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const customers = await prisma.customer.findMany({
    include: {
      vehicles: true,
      appointments: true,
      _count: { select: { requests: true, appointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const workOrders = await prisma.workOrder.findMany({ where: { status: "COMPLETED" } });
  const spendByCustomer = new Map<string, number>();
  for (const wo of workOrders) {
    spendByCustomer.set(wo.customerId, (spendByCustomer.get(wo.customerId) ?? 0) + (wo.price ?? 0));
  }

  const result = customers.map((c) => ({
    ...c,
    totalSpending: spendByCustomer.get(c.id) ?? 0,
  }));

  return NextResponse.json({ customers: result });
}
