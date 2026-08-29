import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOwnerSession } from "@/lib/auth";

const schema = z.object({
  nameEn: z.string().trim().min(1).max(120).optional(),
  nameMe: z.string().trim().min(1).max(120).optional(),
  descriptionEn: z.string().trim().min(1).max(2000).optional(),
  descriptionMe: z.string().trim().min(1).max(2000).optional(),
  durationMinutes: z.coerce.number().int().min(5).max(2000).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional().nullable(),
  imageUrl: z.string().trim().max(500).optional().nullable(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const owner = await getOwnerSession();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });

  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const service = await prisma.service.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ service });
}
