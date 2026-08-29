import { prisma } from "@/lib/db";

export async function notifyCustomer(customerId: string, messageEn: string, messageMe: string, requestId?: string) {
  await prisma.notification.create({
    data: { customerId, messageEn, messageMe, requestId },
  });
}
