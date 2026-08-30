import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOwnerSession } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const date = searchParams.get("date");
  const status = searchParams.get("status");
  const serviceId = searchParams.get("serviceId");
  const customerQuery = searchParams.get("customer");

  const where: Prisma.AppointmentWhereInput = {};
  if (date) where.date = date;
  if (status) where.status = status as Prisma.EnumAppointmentStatusFilter["equals"];
  if (serviceId) where.serviceId = serviceId;
  if (customerQuery) {
    where.customer = { name: { contains: customerQuery } };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      customer: true,
      vehicle: true,
      service: true,
      workOrder: { include: { assignments: { include: { staff: { select: { id: true, name: true } } } } } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ appointments });
}
