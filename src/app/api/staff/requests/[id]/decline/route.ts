import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";
import { notifyCustomer } from "@/lib/notify";

const schema = z.object({ reason: z.string().trim().min(3).max(1000) });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "reason_required" }, { status: 400 });

  const request = await prisma.appointmentRequest.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (request.status === "CONFIRMED" || request.status === "COMPLETED") {
    return NextResponse.json({ error: "already_confirmed" }, { status: 409 });
  }

  const updated = await prisma.appointmentRequest.update({
    where: { id },
    data: { status: "DECLINED", declineReason: parsed.data.reason },
  });

  await notifyCustomer(
    request.customerId,
    `Your request for ${request.preferredDate} was declined. Reason: ${parsed.data.reason}`,
    `Vaš zahtjev za ${request.preferredDate} je odbijen. Razlog: ${parsed.data.reason}`,
    id
  );

  return NextResponse.json({ request: updated });
}
