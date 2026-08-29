import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const request = await prisma.appointmentRequest.findUnique({
    where: { id },
    include: {
      vehicle: true,
      service: true,
      photos: true,
      appointment: { include: { workOrder: { include: { checklistItems: true, photos: true } } } },
    },
  });

  if (!request || request.customerId !== session.sub) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ request });
}
