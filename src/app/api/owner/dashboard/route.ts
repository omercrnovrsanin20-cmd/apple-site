import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOwnerSession } from "@/lib/auth";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = (day + 6) % 7; // Monday start
  x.setDate(x.getDate() - diff);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

async function revenueSince(since: Date) {
  const result = await prisma.workOrder.aggregate({
    where: { status: "COMPLETED", updatedAt: { gte: since } },
    _sum: { price: true },
  });
  return result._sum.price ?? 0;
}

export async function GET() {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const now = new Date();
  const today = new Date().toISOString().slice(0, 10);

  const [
    revenueToday,
    revenueWeek,
    revenueMonth,
    totalJobs,
    completedJobs,
    cancelledJobs,
    inProgressJobs,
    totalCustomers,
    newCustomers30d,
    customersWithMultipleJobs,
    pendingRequests,
    todaysWorkload,
    currentJobs,
    servicesWithCounts,
  ] = await Promise.all([
    revenueSince(startOfDay(now)),
    revenueSince(startOfWeek(now)),
    revenueSince(startOfMonth(now)),
    prisma.workOrder.count(),
    prisma.workOrder.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.workOrder.count({ where: { status: { in: ["CAR_ARRIVED", "IN_PROGRESS", "QUALITY_CHECK"] } } }),
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } }),
    prisma.appointment.groupBy({ by: ["customerId"], _count: { _all: true } }),
    prisma.appointmentRequest.count({ where: { status: { in: ["REQUESTED", "UNDER_REVIEW"] } } }),
    prisma.appointment.count({ where: { date: today } }),
    prisma.workOrder.findMany({
      where: { status: { in: ["CONFIRMED", "CAR_ARRIVED", "IN_PROGRESS", "QUALITY_CHECK"] } },
      include: { vehicle: true, service: true, appointment: { include: { customer: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.workOrder.groupBy({
      by: ["serviceId"],
      _count: { _all: true },
      _sum: { price: true },
      where: { status: "COMPLETED" },
    }),
  ]);

  const services = await prisma.service.findMany();
  const serviceById = new Map(services.map((s) => [s.id, s]));
  const popularServices = servicesWithCounts
    .map((row) => ({
      service: serviceById.get(row.serviceId),
      jobCount: row._count._all,
      revenue: row._sum.price ?? 0,
    }))
    .filter((r) => r.service)
    .sort((a, b) => b.jobCount - a.jobCount);

  const avgJobValue = completedJobs > 0 ? (await revenueSince(new Date(0))) / completedJobs : 0;

  return NextResponse.json({
    revenue: { today: revenueToday, week: revenueWeek, month: revenueMonth },
    jobs: { total: totalJobs, completed: completedJobs, cancelled: cancelledJobs, inProgress: inProgressJobs },
    customers: {
      total: totalCustomers,
      new: newCustomers30d,
      returning: customersWithMultipleJobs.filter((c) => c._count._all > 1).length,
    },
    services: { popular: popularServices, avgJobValue },
    operations: { todaysWorkload, pendingRequests, currentJobs },
  });
}
