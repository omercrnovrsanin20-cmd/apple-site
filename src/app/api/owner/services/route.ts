import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOwnerSession } from "@/lib/auth";

const schema = z.object({
  nameEn: z.string().trim().min(1).max(120),
  nameMe: z.string().trim().min(1).max(120),
  descriptionEn: z.string().trim().min(1).max(2000),
  descriptionMe: z.string().trim().min(1).max(2000),
  durationMinutes: z.coerce.number().int().min(5).max(2000),
  priceMin: z.coerce.number().min(0),
  priceMax: z.coerce.number().min(0).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const services = await prisma.service.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });

  const service = await prisma.service.create({
    data: { ...parsed.data, active: parsed.data.active ?? true, checklistTemplate: JSON.stringify([{ labelEn: "Vehicle inspection", labelMe: "Pregled vozila" }, { labelEn: "Final inspection", labelMe: "Završna kontrola" }]) },
  });
  return NextResponse.json({ service }, { status: 201 });
}
