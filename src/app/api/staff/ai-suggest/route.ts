import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";
import { generateAiSuggestions } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.requestId) return NextResponse.json({ error: "validation" }, { status: 400 });

  const request = await prisma.appointmentRequest.findUnique({
    where: { id: body.requestId },
    include: { service: true },
  });
  if (!request) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const suggestions = generateAiSuggestions({ description: request.description, serviceNameEn: request.service.nameEn });
  return NextResponse.json({ suggestions });
}
