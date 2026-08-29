import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";

export async function GET() {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requests = await prisma.appointmentRequest.findMany({
    include: { customer: true, vehicle: true, service: true, photos: true, appointment: { include: { workOrder: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ requests });
}
