import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOwnerSession } from "@/lib/auth";

export async function GET() {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const vehicles = await prisma.vehicle.findMany({
    include: { customer: true, workOrders: { include: { service: true } }, photos: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ vehicles });
}
