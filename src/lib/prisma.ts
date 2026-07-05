import { PrismaClient } from "@prisma/client";

// Standard Next.js pattern to avoid exhausting DB connections in dev
// due to hot-reloading creating a new PrismaClient every time.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
