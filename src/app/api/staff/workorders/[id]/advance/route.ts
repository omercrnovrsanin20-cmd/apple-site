import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";
import { notifyCustomer } from "@/lib/notify";
import type { WorkOrderStatus } from "@prisma/client";

const FLOW: WorkOrderStatus[] = ["CONFIRMED", "CAR_ARRIVED", "IN_PROGRESS", "QUALITY_CHECK", "READY", "COMPLETED"];

const CUSTOMER_MESSAGES: Partial<Record<WorkOrderStatus, { en: string; me: string }>> = {
  CAR_ARRIVED: { en: "Your vehicle has arrived and is checked in.", me: "Vaše vozilo je stiglo i prijavljeno je." },
  IN_PROGRESS: { en: "Work has started on your vehicle.", me: "Počeli smo sa radom na vašem vozilu." },
  QUALITY_CHECK: { en: "Your vehicle is undergoing final quality check.", me: "Vaše vozilo je na završnoj kontroli kvaliteta." },
  READY: { en: "Your vehicle is ready for pickup!", me: "Vaše vozilo je spremno za preuzimanje!" },
  COMPLETED: { en: "Your detailing job has been completed. Thank you!", me: "Vaš detailing posao je završen. Hvala Vam!" },
};

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = Number((await ctx.params).id);

  const workOrder = await prisma.workOrder.findUnique({ where: { id }, include: { appointment: true } });
  if (!workOrder) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const currentIndex = FLOW.indexOf(workOrder.status);
  if (currentIndex === FLOW.length - 1) {
    return NextResponse.json({ error: "already_completed" }, { status: 409 });
  }
  const nextStatus = FLOW[currentIndex + 1];

  const updated = await prisma.$transaction(async (tx) => {
    const wo = await tx.workOrder.update({
      where: { id },
      data: { status: nextStatus, ...(nextStatus === "COMPLETED" ? { completedAt: new Date() } : {}) },
    });

    if (nextStatus === "COMPLETED") {
      await tx.appointment.update({ where: { id: workOrder.appointmentId }, data: { status: "COMPLETED" } });
      await tx.appointmentRequest.update({ where: { id: workOrder.appointment.requestId }, data: { status: "COMPLETED" } });
    }

    return wo;
  });

  const message = CUSTOMER_MESSAGES[nextStatus];
  if (message) {
    await notifyCustomer(workOrder.customerId, message.en, message.me);
  }

  return NextResponse.json({ workOrder: updated });
}
