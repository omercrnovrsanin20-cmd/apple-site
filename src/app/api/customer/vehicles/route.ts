import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";

const schema = z.object({
  make: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  licensePlate: z.string().trim().max(30).optional(),
});

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const vehicles = await prisma.vehicle.findMany({
    where: { customerId: session.sub },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ vehicles });
}

export async function POST(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });

  const vehicle = await prisma.vehicle.create({
    data: { ...parsed.data, customerId: session.sub },
  });
  return NextResponse.json({ vehicle }, { status: 201 });
}
