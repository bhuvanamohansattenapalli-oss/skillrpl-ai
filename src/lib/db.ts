import { PrismaClient } from '@prisma/client';

/**
 * Server-only Prisma client instance.
 * Uses a singleton pattern to prevent multiple connection pools during development hot-reloading.
 */
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
