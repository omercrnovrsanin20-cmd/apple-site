import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";
import { saveUploadedImage, UploadValidationError } from "@/lib/upload";

const schema = z.object({
  vehicleId: z.string().min(1),
  serviceId: z.string().min(1),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/),
  description: z.string().max(2000).optional(),
});

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requests = await prisma.appointmentRequest.findMany({
    where: { customerId: session.sub },
    include: { vehicle: true, service: true, photos: true, appointment: { include: { workOrder: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "validation" }, { status: 400 });

  const parsed = schema.safeParse({
    vehicleId: form.get("vehicleId"),
    serviceId: form.get("serviceId"),
    preferredDate: form.get("preferredDate"),
    preferredTime: form.get("preferredTime"),
    description: form.get("description") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });

  const { vehicleId, serviceId, preferredDate, preferredTime, description } = parsed.data;

  // Data isolation: the vehicle must actually belong to this customer.
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle || vehicle.customerId !== session.sub) {
    return NextResponse.json({ error: "invalid_vehicle" }, { status: 400 });
  }
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "invalid_service" }, { status: 400 });
  }

  const request = await prisma.appointmentRequest.create({
    data: {
      customerId: session.sub,
      vehicleId,
      serviceId,
      preferredDate,
      preferredTime,
      description,
      status: "REQUESTED",
    },
  });

  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  for (const file of files) {
    try {
      const relPath = await saveUploadedImage(file, `requests/${request.id}`);
      await prisma.photo.create({
        data: { category: "REQUEST", url: relPath, vehicleId, requestId: request.id },
      });
    } catch (e) {
      if (e instanceof UploadValidationError) {
        return NextResponse.json({ error: "upload_invalid", message: e.message }, { status: 400 });
      }
      throw e;
    }
  }

  const full = await prisma.appointmentRequest.findUnique({
    where: { id: request.id },
    include: { vehicle: true, service: true, photos: true },
  });

  return NextResponse.json({ request: full }, { status: 201 });
}
