import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOwnerSession } from "@/lib/auth";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const [completedWorkOrders, allAppointments, allCustomers] = await Promise.all([
    prisma.workOrder.findMany({ where: { status: "COMPLETED", updatedAt: { gte: since } } }),
    prisma.appointment.findMany({ where: { createdAt: { gte: since } } }),
    prisma.customer.findMany({ where: { createdAt: { gte: since } } }),
  ]);

  const days: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    days.push(dayKey(d));
  }

  const revenueByDay = Object.fromEntries(days.map((d) => [d, 0]));
  for (const wo of completedWorkOrders) {
    const key = dayKey(wo.updatedAt);
    if (key in revenueByDay) revenueByDay[key] += wo.price ?? 0;
  }

  const jobsByDay = Object.fromEntries(days.map((d) => [d, 0]));
  for (const wo of completedWorkOrders) {
    const key = dayKey(wo.updatedAt);
    if (key in jobsByDay) jobsByDay[key] += 1;
  }

  const customersByDay = Object.fromEntries(days.map((d) => [d, 0]));
  for (const c of allCustomers) {
    const key = dayKey(c.createdAt);
    if (key in customersByDay) customersByDay[key] += 1;
  }

  const statusBreakdown: Record<string, number> = {};
  for (const a of allAppointments) {
    statusBreakdown[a.status] = (statusBreakdown[a.status] ?? 0) + 1;
  }
  const requestStatuses = await prisma.appointmentRequest.groupBy({ by: ["status"], _count: { _all: true } });

  return NextResponse.json({
    revenueOverTime: days.map((d) => ({ date: d, value: revenueByDay[d] })),
    jobsOverTime: days.map((d) => ({ date: d, value: jobsByDay[d] })),
    customersOverTime: days.map((d) => ({ date: d, value: customersByDay[d] })),
    appointmentStatusBreakdown: statusBreakdown,
    requestStatusBreakdown: Object.fromEntries(requestStatuses.map((r) => [r.status, r._count._all])),
    hasData: completedWorkOrders.length > 0 || allAppointments.length > 0,
  });
}
