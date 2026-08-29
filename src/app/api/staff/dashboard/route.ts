import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const today = todayISO();

  const [todaysAppointments, pendingRequests, confirmedAppointments, inService, completedJobs, upcoming] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: today },
      include: { customer: true, vehicle: true, service: true, workOrder: true },
      orderBy: { time: "asc" },
    }),
    prisma.appointmentRequest.findMany({
      where: { status: { in: ["REQUESTED", "UNDER_REVIEW"] } },
      include: { customer: true, vehicle: true, service: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.appointment.count({ where: { status: "CONFIRMED" } }),
    prisma.workOrder.findMany({
      where: { status: { in: ["CAR_ARRIVED", "IN_PROGRESS", "QUALITY_CHECK"] } },
      include: { vehicle: true, service: true, appointment: { include: { customer: true } } },
    }),
    prisma.workOrder.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.findMany({
      where: { date: { gt: today }, status: "CONFIRMED" },
      include: { customer: true, vehicle: true, service: true },
      orderBy: { date: "asc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    todaysAppointments,
    pendingRequests,
    confirmedAppointments,
    inService,
    completedJobs,
    upcoming,
  });
}
