import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { customerId: session.sub },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ notifications });
}

export async function PATCH(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Mark all as read.
  await prisma.notification.updateMany({ where: { customerId: session.sub, read: false }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
