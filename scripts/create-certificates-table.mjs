import { prisma } from '../src/lib/db.js';

async function main() {
  console.log('Creating certificates table in PostgreSQL/Supabase...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.certificates (
      id TEXT PRIMARY KEY,
      "certificateNumber" TEXT UNIQUE NOT NULL,
      "workerProfileId" TEXT NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
      "assessmentAttemptId" TEXT UNIQUE REFERENCES public.assessment_attempts(id) ON DELETE SET NULL,
      "assessmentId" TEXT UNIQUE REFERENCES public.assessments(id) ON DELETE SET NULL,
      "workerName" TEXT NOT NULL,
      "workerIdentifier" TEXT,
      trade TEXT NOT NULL,
      "assessmentName" TEXT NOT NULL DEFAULT 'Recognition of Prior Learning Assessment',
      score DOUBLE PRECISION NOT NULL,
      "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 10,
      percentage DOUBLE PRECISION NOT NULL,
      "nsqfLevel" INTEGER NOT NULL DEFAULT 4,
      "qualificationPack" TEXT DEFAULT 'Assistant Electrician (ELE/Q0101)',
      "assessorName" TEXT DEFAULT 'Dr. Vikramaditya Sharma',
      "assessorId" TEXT DEFAULT 'ASSESS-NSDC-2024-8842',
      "assessorDesignation" TEXT DEFAULT 'CSDCI / NCVET Accredited Lead Assessor',
      "assessmentCompletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'ISSUED',
      "isDemo" BOOLEAN NOT NULL DEFAULT false,
      "verificationCode" TEXT,
      metadata JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "certificates_workerProfileId_idx" ON public.certificates("workerProfileId");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "certificates_certificateNumber_idx" ON public.certificates("certificateNumber");
  `);

  console.log('Certificates table created successfully!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
