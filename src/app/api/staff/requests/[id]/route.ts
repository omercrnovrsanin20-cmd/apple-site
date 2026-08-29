import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  let request = await prisma.appointmentRequest.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      service: true,
      photos: true,
      appointment: { include: { workOrder: { include: { checklistItems: true, photos: true } } } },
    },
  });
  if (!request) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Opening a fresh request moves it into review -- staff is now looking at it.
  if (request.status === "REQUESTED") {
    request = await prisma.appointmentRequest.update({
      where: { id },
      data: { status: "UNDER_REVIEW" },
      include: {
        customer: true,
        vehicle: true,
        service: true,
        photos: true,
        appointment: { include: { workOrder: { include: { checklistItems: true, photos: true } } } },
      },
    });
  }

  return NextResponse.json({ request });
}
