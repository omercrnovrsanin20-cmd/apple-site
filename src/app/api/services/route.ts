import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public endpoint -- customers browse active services without logging in.
export async function GET() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ services });
}
