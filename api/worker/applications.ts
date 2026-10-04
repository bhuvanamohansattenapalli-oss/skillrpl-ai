import type { IncomingMessage, ServerResponse } from 'node:http';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

function sendJsonResponse(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
    return;
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    sendJsonResponse(res, 401, { success: false, error: 'Authentication required. Missing Bearer token.' });
    return;
  }

  const supabase = getSupabase();
  if (!supabase) {
    sendJsonResponse(res, 503, { success: false, error: 'Supabase client not configured.' });
    return;
  }

  const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !authUser?.email) {
    sendJsonResponse(res, 401, { success: false, error: authErr?.message || 'Invalid session token' });
    return;
  }

  try {
    let dbUser = await prisma.user.findFirst({
      where: { email: authUser.email.toLowerCase() },
      include: { workerProfile: true }
    });

    if (!dbUser?.workerProfile) {
      sendJsonResponse(res, 200, { success: true, applications: [] });
      return;
    }

    const applications = await prisma.rPLApplication.findMany({
      where: { workerProfileId: dbUser.workerProfile.id },
      include: {
        experiences: true,
        skills: true,
        aiAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formatted = applications.map((app) => {
      let progress = 15;
      if (app.status === 'COMPLETED' || app.status === 'COMPETENT_CERTIFIED') progress = 100;
      else if (app.status === 'UNDER_ASSESSMENT' || app.status === 'UNDER_ASSESSOR_REVIEW') progress = 85;
      else if (app.status === 'SUBMITTED') progress = 75;
      else if (app.status === 'ASSESSMENT_READY') progress = 60;
      else if (app.status === 'SELF_DECLARATION_COMPLETED') progress = 40;
      else if (app.currentStep > 1) progress = Math.min(65, Math.round((app.currentStep / 7) * 100));

      return {
        id: app.id,
        applicationNumber: app.applicationNumber,
        tradeTitle: app.tradeTitle || 'General Technical Trade',
        status: app.status,
        currentStep: app.currentStep,
        progressPercentage: progress,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        submittedAt: app.submittedAt?.toISOString(),
        completedAt: app.completedAt?.toISOString(),
        hasAiAnalysis: app.aiAnalyses.length > 0
      };
    });

    sendJsonResponse(res, 200, { success: true, applications: formatted });
  } catch (err: any) {
    console.error('[Vercel Worker Applications Error]', err);
    sendJsonResponse(res, 500, { success: false, error: err.message || 'Internal database error' });
  }
}
