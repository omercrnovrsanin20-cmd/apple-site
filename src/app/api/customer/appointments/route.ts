import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: { customerId: session.sub },
    include: { vehicle: true, service: true, workOrder: { include: { checklistItems: true, photos: true } } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ appointments });
}
