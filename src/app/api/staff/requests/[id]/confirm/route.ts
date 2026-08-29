import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";
import { notifyCustomer } from "@/lib/notify";

interface ChecklistTemplateItem {
  labelEn: string;
  labelMe: string;
}

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const request = await prisma.appointmentRequest.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!request) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (request.status === "CONFIRMED" || request.status === "COMPLETED") {
    return NextResponse.json({ error: "already_confirmed" }, { status: 409 });
  }
  if (request.status === "DECLINED") {
    return NextResponse.json({ error: "already_declined" }, { status: 409 });
  }

  const template: ChecklistTemplateItem[] = JSON.parse(request.service.checklistTemplate);

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.appointmentRequest.update({
      where: { id },
      data: { status: "CONFIRMED", declineReason: null },
    });

    const appointment = await tx.appointment.create({
      data: {
        requestId: id,
        customerId: request.customerId,
        vehicleId: request.vehicleId,
        serviceId: request.serviceId,
        date: request.preferredDate,
        time: request.preferredTime,
        status: "CONFIRMED",
      },
    });

    const workOrder = await tx.workOrder.create({
      data: {
        appointmentId: appointment.id,
        customerId: request.customerId,
        vehicleId: request.vehicleId,
        serviceId: request.serviceId,
        status: "CONFIRMED",
        price: request.service.priceMin,
      },
    });

    await tx.checklistItem.createMany({
      data: template.map((item, index) => ({
        workOrderId: workOrder.id,
        labelEn: item.labelEn,
        labelMe: item.labelMe,
        order: index,
      })),
    });

    return { updatedRequest, appointment, workOrder };
  });

  await notifyCustomer(
    request.customerId,
    `Your appointment for ${request.preferredDate} at ${request.preferredTime} has been confirmed.`,
    `Vaš termin za ${request.preferredDate} u ${request.preferredTime} je potvrđen.`,
    id
  );

  return NextResponse.json(result);
}
