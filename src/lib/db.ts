import { PrismaClient } from '@prisma/client';

/**
 * Server-only Prisma client instance.
 * Uses a singleton pattern to prevent multiple connection pools during development hot-reloading.
 */
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance =
      globalThis.prismaGlobal ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
      });
    if (process.env.NODE_ENV !== 'production') {
      globalThis.prismaGlobal = prismaInstance;
    }
  }
  return prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    return (client as any)[prop];
  }
});

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(
    url &&
    !url.includes('PASTE_') &&
    (url.startsWith('postgresql://') || url.startsWith('postgres://'))
  );
}

export default prisma;
