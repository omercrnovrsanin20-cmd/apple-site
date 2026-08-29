import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";

export async function GET() {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [appointments, pendingRequests] = await Promise.all([
    prisma.appointment.findMany({
      include: { customer: true, vehicle: true, service: true, workOrder: true },
      orderBy: { date: "asc" },
    }),
    prisma.appointmentRequest.findMany({
      where: { status: { in: ["REQUESTED", "UNDER_REVIEW"] } },
      include: { customer: true, vehicle: true, service: true },
      orderBy: { preferredDate: "asc" },
    }),
  ]);

  return NextResponse.json({ appointments, pendingRequests });
}
