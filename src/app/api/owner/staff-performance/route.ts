import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOwnerSession } from "@/lib/auth";

type Period = "today" | "week" | "month" | "lastMonth" | "custom";

function getRange(period: Period, fromParam: string | null, toParam: string | null): { from: Date; to: Date } {
  const now = new Date();

  if (period === "custom" && fromParam && toParam) {
    const from = new Date(`${fromParam}T00:00:00`);
    const to = new Date(`${toParam}T23:59:59.999`);
    return { from, to };
  }

  if (period === "today") {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }

  if (period === "week") {
    const dayIndex = (now.getDay() + 6) % 7; // Monday = 0
    const from = new Date(now);
    from.setDate(now.getDate() - dayIndex);
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }

  if (period === "lastMonth") {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { from, to };
  }

  // default: this month
  const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

export async function GET(req: NextRequest) {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const period = (searchParams.get("period") as Period) || "month";
  const { from, to } = getRange(period, searchParams.get("from"), searchParams.get("to"));

  const [staffList, claimedInPeriod, completedInPeriod] = await Promise.all([
    prisma.staffAccount.findMany({ orderBy: { name: "asc" } }),
    prisma.workOrderAssignment.findMany({
      where: { claimedAt: { gte: from, lte: to } },
      select: { staffId: true },
    }),
    prisma.workOrderAssignment.findMany({
      where: { workOrder: { status: "COMPLETED", completedAt: { gte: from, lte: to } } },
      include: { workOrder: { include: { service: true } } },
    }),
  ]);

  const totalJobsMap = new Map<string, number>();
  for (const a of claimedInPeriod) {
    totalJobsMap.set(a.staffId, (totalJobsMap.get(a.staffId) ?? 0) + 1);
  }

  const completedJobsMap = new Map<string, number>();
  const serviceMap = new Map<string, Map<string, { nameEn: string; nameMe: string; count: number }>>();
  for (const a of completedInPeriod) {
    completedJobsMap.set(a.staffId, (completedJobsMap.get(a.staffId) ?? 0) + 1);
    const svc = a.workOrder.service;
    if (!serviceMap.has(a.staffId)) serviceMap.set(a.staffId, new Map());
    const inner = serviceMap.get(a.staffId)!;
    const existing = inner.get(svc.id);
    if (existing) existing.count += 1;
    else inner.set(svc.id, { nameEn: svc.nameEn, nameMe: svc.nameMe, count: 1 });
  }

  const staff = staffList.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    active: s.active,
    totalJobs: totalJobsMap.get(s.id) ?? 0,
    completedJobs: completedJobsMap.get(s.id) ?? 0,
    services: Array.from(serviceMap.get(s.id)?.values() ?? []).sort((a, b) => b.count - a.count),
  }));

  return NextResponse.json({ staff, from: from.toISOString(), to: to.toISOString() });
}
