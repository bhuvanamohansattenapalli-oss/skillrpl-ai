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

function parseRequestBody(req: IncomingMessage, maxBytes = 100_000): Promise<any> {
  if ((req as any).body !== undefined && (req as any).body !== null) {
    const existingBody = (req as any).body;
    if (typeof existingBody === 'object') return Promise.resolve(existingBody);
    if (typeof existingBody === 'string') {
      if (!existingBody.trim()) return Promise.resolve({});
      try {
        return Promise.resolve(JSON.parse(existingBody));
      } catch {
        const err = new Error('Malformed JSON') as any;
        err.status = 400;
        return Promise.reject(err);
      }
    }
  }

  if ((req as any).readableEnded || (req as any).complete) {
    return Promise.resolve({});
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    let bytes = 0;
    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        const err = new Error('Payload too large') as any;
        err.status = 413;
        reject(err);
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        const err = new Error('Malformed JSON') as any;
        err.status = 400;
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function getAuthWorker(req: IncomingMessage) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) throw new Error('Missing authentication token.');

  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured.');

  const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !authUser?.email) throw new Error(authErr?.message || 'Invalid session token.');

  let user = await prisma.user.findFirst({
    where: { email: authUser.email.toLowerCase() },
    include: { workerProfile: true }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email.toLowerCase(),
        role: 'WORKER'
      },
      include: { workerProfile: true }
    });
  }

  let workerProfile = user.workerProfile;
  if (!workerProfile) {
    workerProfile = await prisma.workerProfile.create({
      data: {
        userId: user.id,
        name: (authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Worker Candidate') as string,
        email: user.email,
        trade: 'General Technical',
        yearsOfExperience: 2
      }
    });
  }

  return { user, workerProfile };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const action = url.searchParams.get('action');

  try {
    const { workerProfile } = await getAuthWorker(req);

    // GET /api/worker/application?id=xxx
    if (req.method === 'GET') {
      const id = url.searchParams.get('id');
      if (!id) {
        sendJsonResponse(res, 400, { success: false, error: 'Application ID is required.' });
        return;
      }

      const application = await prisma.rPLApplication.findFirst({
        where: { id, workerProfileId: workerProfile.id },
        include: {
          experiences: { orderBy: { createdAt: 'asc' } },
          skills: { orderBy: { createdAt: 'asc' } },
          aiAnalyses: { orderBy: { createdAt: 'desc' } }
        }
      });

      if (!application) {
        sendJsonResponse(res, 404, { success: false, error: 'Application not found or unauthorized.' });
        return;
      }

      sendJsonResponse(res, 200, { success: true, application });
      return;
    }

    // POST /api/worker/application
    if (req.method === 'POST') {
      const body = await parseRequestBody(req);

      // Handle submit action
      if (action === 'submit' || body.action === 'submit' || url.pathname.endsWith('/submit')) {
        const appId = body.id || url.searchParams.get('id');
        if (!appId) {
          sendJsonResponse(res, 400, { success: false, error: 'Application ID is required to submit.' });
          return;
        }

        const existing = await prisma.rPLApplication.findFirst({
          where: { id: appId, workerProfileId: workerProfile.id }
        });
        if (!existing) {
          sendJsonResponse(res, 404, { success: false, error: 'Application not found or unauthorized.' });
          return;
        }

        const updated = await prisma.rPLApplication.update({
          where: { id: appId },
          data: {
            status: 'SUBMITTED',
            submittedAt: new Date(),
            currentStep: 7
          },
          include: { experiences: true, skills: true, aiAnalyses: true }
        });

        sendJsonResponse(res, 200, { success: true, application: updated });
        return;
      }

      // Handle save/draft
      const {
        id,
        currentStep = 1,
        status = 'DRAFT',
        tradeTitle,
        formData,
        experiences = [],
        skills = []
      } = body;

      let applicationRecord;

      if (id) {
        const existing = await prisma.rPLApplication.findFirst({
          where: { id, workerProfileId: workerProfile.id }
        });
        if (!existing) {
          sendJsonResponse(res, 404, { success: false, error: 'Application not found or unauthorized.' });
          return;
        }

        applicationRecord = await prisma.rPLApplication.update({
          where: { id },
          data: {
            currentStep: Number(currentStep) || existing.currentStep,
            status: status || existing.status,
            tradeTitle: tradeTitle || existing.tradeTitle || 'General Technical Trade',
            formData: formData ? JSON.parse(JSON.stringify(formData)) : existing.formData,
            updatedAt: new Date()
          }
        });
      } else {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const applicationNumber = `RPL-2026-${randomNum}`;

        applicationRecord = await prisma.rPLApplication.create({
          data: {
            applicationNumber,
            workerProfileId: workerProfile.id,
            status: status || 'DRAFT',
            currentStep: Number(currentStep) || 1,
            tradeTitle: tradeTitle || 'General Technical Trade',
            formData: formData ? JSON.parse(JSON.stringify(formData)) : undefined
          }
        });
      }

      if (Array.isArray(experiences) && experiences.length > 0) {
        await prisma.rPLApplicationExperience.deleteMany({
          where: { rplApplicationId: applicationRecord.id }
        });
        for (const exp of experiences) {
          if (exp.company || exp.role) {
            await prisma.rPLApplicationExperience.create({
              data: {
                rplApplicationId: applicationRecord.id,
                company: exp.company || 'Self-employed / Workplace',
                role: exp.role || 'Skilled Worker',
                startDate: exp.startDate || '2020',
                endDate: exp.endDate || null,
                isCurrent: Boolean(exp.isCurrent),
                responsibilities: exp.responsibilities || '',
                tasksPerformed: exp.tasksPerformed || '',
                toolsUsed: exp.toolsUsed || ''
              }
            });
          }
        }
      }

      if (Array.isArray(skills) && skills.length > 0) {
        await prisma.rPLApplicationSkill.deleteMany({
          where: { rplApplicationId: applicationRecord.id }
        });
        for (const sk of skills) {
          if (sk.taskName) {
            await prisma.rPLApplicationSkill.create({
              data: {
                rplApplicationId: applicationRecord.id,
                taskName: sk.taskName,
                experienceText: sk.experienceText || 'Self-declared',
                toolsUsed: sk.toolsUsed || '',
                confidenceLevel: sk.confidenceLevel || 'Intermediate',
                statusLabel: 'Self-declared — pending assessment'
              }
            });
          }
        }
      }

      const fullApp = await prisma.rPLApplication.findUnique({
        where: { id: applicationRecord.id },
        include: {
          experiences: true,
          skills: true,
          aiAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      });

      sendJsonResponse(res, 200, { success: true, application: fullApp });
      return;
    }

    sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed.' });
  } catch (err: any) {
    console.error('[Vercel Worker Application Error]', err);
    sendJsonResponse(res, 401, { success: false, error: err.message || 'Authentication or server error' });
  }
}
