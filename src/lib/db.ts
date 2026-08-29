import { PrismaClient } from "@prisma/client";

// Single shared Prisma client instance -- one backend, one database, one
// source of truth for the Customer, Staff and Owner portals.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
