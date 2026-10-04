import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateRplChatResponse } from '../lib/ai/rpl-assistant.ts';
import { isGeminiConfigured, getGeminiModel } from '../lib/ai/gemini.ts';
import { chatRequestSchema, skillAnalysisRequestSchema, type ChatApiResponse } from '../lib/ai/types.ts';
import { isDatabaseConfigured } from '../lib/db.ts';


/**
 * Utility to send JSON responses with appropriate headers
 */
function sendJsonResponse(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.end(JSON.stringify(data));
}

/**
 * Helper to safely parse JSON body from incoming request stream
 */
function parseRequestBody(req: IncomingMessage, maxBytes = 100_000): Promise<unknown> {
  // 1. If Vercel or serverless middleware already parsed the request body:
  if ((req as any).body !== undefined && (req as any).body !== null) {
    const existingBody = (req as any).body;
    if (typeof existingBody === 'object') {
      return Promise.resolve(existingBody);
    }
    if (typeof existingBody === 'string') {
      if (!existingBody.trim()) return Promise.resolve({});
      try {
        return Promise.resolve(JSON.parse(existingBody));
      } catch {
        const err = new Error('Malformed JSON payload.') as Error & { status?: number };
        err.status = 400;
        return Promise.reject(err);
      }
    }
  }

  // 2. If stream has already ended or completed, avoid hanging on event listeners
  if ((req as any).readableEnded || (req as any).complete) {
    return Promise.resolve({});
  }

  return new Promise((resolve, reject) => {
    let rawData = '';
    let totalBytes = 0;

    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        const err = new Error('Payload too large. Maximum 100KB allowed.') as Error & { status?: number };
        err.status = 413;
        reject(err);
        req.destroy();
        return;
      }
      rawData += chunk;
    });

    req.on('end', () => {
      if (!rawData.trim()) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(rawData);
        resolve(parsed);
      } catch {
        const err = new Error('Malformed JSON payload.') as Error & { status?: number };
        err.status = 400;
        reject(err);
      }
    });

    req.on('error', (err) => reject(err));
  });
}

// In-memory sliding window rate limiter: 15 requests per 60 seconds
const requestTimestamps: number[] = [];
const RATE_LIMIT_MAX_RPM = 15;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(): boolean {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT_MAX_RPM) {
    return false;
  }
  requestTimestamps.push(now);
  return true;
}

function logSafeDiagnostic(params: {
  status: number;
  errorName: string;
  errorCode: string;
  errorMessage: string;
  route: string;
}) {
  const model = getGeminiModel();
  const geminiConfigured = isGeminiConfigured();
  const databaseConfigured = isDatabaseConfigured();

  const safeMsg = params.errorMessage
    .replace(/key=[^&\s"']+/gi, 'key=[REDACTED]')
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]')
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[REDACTED_DB_URL]');

  console.error(
    `[SERVER_DIAGNOSTIC] status=${params.status} | name=${params.errorName} | code=${params.errorCode} | model=${model} | GEMINI_API_KEY_configured=${geminiConfigured} | DATABASE_URL_configured=${databaseConfigured} | route=${params.route} | message=${safeMsg}`
  );
}

/**
 * Main API middleware handler for /api/* routes.
 * Returns true if the route was handled, false if next() should be called.
 */
export async function handleApiRoute(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  const parsedUrl = new URL(url, `http://${req.headers.host || 'localhost'}`);
  
  // Resolve pathname accurately across local Vite dev server and Vercel Serverless Function rewrites
  let pathname = parsedUrl.pathname;
  
  const vercelRoute = parsedUrl.searchParams.get('__route');
  if (vercelRoute) {
    const cleanRoute = vercelRoute.startsWith('/') ? vercelRoute : `/${vercelRoute}`;
    pathname = cleanRoute.startsWith('/api/') ? cleanRoute : `/api${cleanRoute}`;
  } else {
    const matchedPath =
      (req.headers['x-matched-path'] as string) ||
      (req.headers['x-vercel-matched-path'] as string) ||
      (req.headers['x-forwarded-uri'] as string);
    if (matchedPath && matchedPath.startsWith('/api/')) {
      pathname = matchedPath.split('?')[0];
    }
  }

  // 1. Health check endpoint: GET /api/health
  if (pathname === '/api/health') {
    if (req.method !== 'GET') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
      return true;
    }

    sendJsonResponse(res, 200, { status: 'ok' });
    return true;
  }

  // 2. Safe Test Endpoint: GET /api/ai/test
  if (pathname === '/api/ai/test') {
    if (req.method !== 'GET') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
      return true;
    }

    const model = getGeminiModel();
    const isConfigured = isGeminiConfigured();

    if (!isConfigured) {
      logSafeDiagnostic({
        status: 503,
        errorName: 'ConfigurationError',
        errorCode: 'KEY_MISSING',
        errorMessage: 'GEMINI_API_KEY is not configured in environment.',
        route: pathname
      });

      sendJsonResponse(res, 503, {
        success: false,
        status: 503,
        name: 'ConfigurationError',
        code: 'KEY_MISSING',
        model,
        geminiConfigured: false,
        databaseConfigured: isDatabaseConfigured(),
        route: pathname,
        error: 'GEMINI_API_KEY is not configured in environment.'
      });
      return true;
    }

    try {
      const { getGeminiClient } = await import('../lib/ai/gemini.ts');
      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model,
        contents: 'Respond with exactly: Gemini connection successful.'
      });

      const replyText = response.text?.trim() || 'Gemini connection successful.';

      sendJsonResponse(res, 200, {
        success: true,
        model,
        message: replyText
      });
      return true;
    } catch (err: any) {
      const status = err?.status || err?.statusCode || 500;
      const errorName = err?.name || 'Error';
      const code = err?.code || (status === 429 ? 'RESOURCE_EXHAUSTED' : status === 404 ? 'NOT_FOUND' : status === 401 ? 'UNAUTHENTICATED' : 'ERROR');
      const rawMsg = err?.message || String(err);

      // Safe error extraction avoiding token or env leaks
      let safeMsg = 'Unknown Gemini API error';
      try {
        const parsed = JSON.parse(rawMsg.slice(rawMsg.indexOf('{')));
        safeMsg = parsed?.error?.message || rawMsg;
      } catch {
        safeMsg = rawMsg.replace(/key=[^&\s]+/gi, 'key=[REDACTED]');
      }

      logSafeDiagnostic({
        status: status >= 400 && status < 600 ? status : 500,
        errorName,
        errorCode: code,
        errorMessage: safeMsg,
        route: pathname
      });

      sendJsonResponse(res, status >= 400 && status < 600 ? status : 500, {
        success: false,
        status: status >= 400 && status < 600 ? status : 500,
        name: errorName,
        code,
        model,
        geminiConfigured: isConfigured,
        databaseConfigured: isDatabaseConfigured(),
        route: pathname,
        error: safeMsg
      });
      return true;
    }
  }

  // 3. Chat endpoint: POST /api/ai/chat
  if (pathname === '/api/ai/chat') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
      return true;
    }

    try {
      // 3.1 Rate limit check (15 RPM protection)
      if (!checkRateLimit()) {
        console.warn(`[Gemini Rate Limiter] 15 RPM limit reached. Returning 429.`);
        sendJsonResponse(res, 429, {
          success: false,
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          error: 'AI request limit reached. Please wait a moment and try again.'
        });
        return true;
      }

      const rawBody = await parseRequestBody(req);

      // Validate with Zod
      const parseResult = chatRequestSchema.safeParse(rawBody);

      if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        const errorMessage = firstIssue ? `${firstIssue.path.join('.') || 'request'}: ${firstIssue.message}` : 'Invalid request format.';
        
        sendJsonResponse(res, 400, {
          success: false,
          error: errorMessage
        } as ChatApiResponse);
        return true;
      }

      // Check if Gemini is configured before calling
      if (!isGeminiConfigured()) {
        sendJsonResponse(res, 503, {
          success: false,
          error: 'AI Assistant service is not configured. Please ensure GEMINI_API_KEY is set.'
        } as ChatApiResponse);
        return true;
      }

      // Generate response using Gemini service
      const aiResponse = await generateRplChatResponse(parseResult.data);
      sendJsonResponse(res, 200, aiResponse);
      return true;
    } catch (err: any) {
      const statusCode = err?.status || 500;
      const errorName = err?.name || 'Error';
      const errorCode = err?.code || 'GEMINI_ERROR';
      const rawMessage = err instanceof Error ? err.message : String(err);
      const safeMessage = rawMessage
        .replace(/key=[^&\s"']+/gi, 'key=[REDACTED]')
        .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]')
        .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[REDACTED_DB_URL]');

      logSafeDiagnostic({
        status: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
        errorName,
        errorCode,
        errorMessage: safeMessage,
        route: pathname
      });

      sendJsonResponse(res, statusCode >= 400 && statusCode < 600 ? statusCode : 500, {
        success: false,
        status: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
        name: errorName,
        code: errorCode,
        model: getGeminiModel(),
        geminiConfigured: isGeminiConfigured(),
        databaseConfigured: isDatabaseConfigured(),
        route: pathname,
        error: safeMessage
      } as ChatApiResponse & { status?: number; name?: string; code?: string; model?: string; geminiConfigured?: boolean; databaseConfigured?: boolean; route?: string });
      return true;
    }
  }

  // 4. Skill Analysis endpoint: POST /api/ai/skill-analysis
  if (pathname === '/api/ai/skill-analysis') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
      return true;
    }

    try {
      // Rate limit check (15 RPM protection)
      if (!checkRateLimit()) {
        console.warn(`[Skill Analysis Rate Limiter] 15 RPM limit reached. Returning 429.`);
        sendJsonResponse(res, 429, {
          success: false,
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          error: 'AI request limit reached. Please wait a moment and try again.'
        });
        return true;
      }

      const rawBody = await parseRequestBody(req);

      // Validate with Zod
      const parseResult = skillAnalysisRequestSchema.safeParse(rawBody);

      if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        const errorMessage = firstIssue
          ? `${firstIssue.path.join('.') || 'request'}: ${firstIssue.message}`
          : 'Invalid request format.';

        sendJsonResponse(res, 400, {
          success: false,
          status: 400,
          code: 'INVALID_REQUEST',
          error: errorMessage
        });
        return true;
      }

      // Check if Gemini is configured
      if (!isGeminiConfigured()) {
        sendJsonResponse(res, 503, {
          success: false,
          status: 503,
          code: 'SERVICE_UNAVAILABLE',
          error: 'AI Assistant service is not configured. Please ensure GEMINI_API_KEY is set.'
        });
        return true;
      }

      // Dynamically import performSkillAnalysis to isolate AI chat/test from Prisma
      const { performSkillAnalysis } = await import('../lib/ai/skill-analysis.ts');
      const analysisResult = await performSkillAnalysis(parseResult.data);

      sendJsonResponse(res, 200, {
        success: true,
        data: analysisResult,
        recordId: analysisResult.recordId
      });
      return true;
    } catch (err: any) {
      const statusCode = err?.status || 500;
      const errorName = err?.name || 'Error';
      const errorCode = err?.code || 'ANALYSIS_ERROR';
      const rawMessage = err instanceof Error ? err.message : String(err);
      const safeMessage = rawMessage
        .replace(/key=[^&\s"']+/gi, 'key=[REDACTED]')
        .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]')
        .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[REDACTED_DB_URL]');

      logSafeDiagnostic({
        status: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
        errorName,
        errorCode,
        errorMessage: safeMessage,
        route: pathname
      });

      sendJsonResponse(res, statusCode >= 400 && statusCode < 600 ? statusCode : 500, {
        success: false,
        status: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
        name: errorName,
        code: errorCode,
        model: getGeminiModel(),
        geminiConfigured: isGeminiConfigured(),
        databaseConfigured: isDatabaseConfigured(),
        route: pathname,
        error: safeMessage
      });
      return true;
    }
  }

  // 5. Assessor Candidate Evaluation Data: GET /api/assessor/candidate-evaluation
  if (pathname === '/api/assessor/candidate-evaluation') {
    if (req.method !== 'GET') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
      return true;
    }

    try {
      const { prisma } = await import('../lib/db.ts');
      const { ensureAssessorDemoData } = await import('../lib/assessor/seed-assessor-data.ts');

      await ensureAssessorDemoData();

      const application = await prisma.rPLApplication.findFirst({
        where: { applicationNumber: 'RPL-IND-2026-0842' },
        include: {
          workerProfile: true,
          qualificationPack: {
            include: {
              assessmentCriteria: true
            }
          },
          assessments: {
            include: {
              scores: {
                include: {
                  criterion: true
                }
              },
              assessorProfile: true,
              competencyResults: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          aiAnalyses: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!application) {
        sendJsonResponse(res, 404, { success: false, error: 'Application not found' });
        return true;
      }

      sendJsonResponse(res, 200, {
        success: true,
        data: application
      });
      return true;
    } catch (err: any) {
      console.error('[Assessor Evaluation API Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Server error' });
      return true;
    }
  }

  // 6. Assessor Assessment Submission: POST /api/assessor/submit-assessment
  if (pathname === '/api/assessor/submit-assessment') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
      return true;
    }

    try {
      // Server-side Role Authorization Check: Workers cannot submit assessor scores
      const clientRole = req.headers['x-user-role'];
      if (clientRole === 'WORKER') {
        sendJsonResponse(res, 403, {
          success: false,
          code: 'FORBIDDEN_ASSESSOR_ONLY',
          error: 'Forbidden: Workers are not authorized to evaluate or submit assessment decisions.'
        });
        return true;
      }

      const rawBody: any = await parseRequestBody(req);
      const { assessmentId, applicationId, scores, remarks, isFinal, practicalTaskDemo } = rawBody;

      if (!assessmentId || !scores || !Array.isArray(scores)) {
        sendJsonResponse(res, 400, { success: false, error: 'Missing assessmentId or scores array' });
        return true;
      }

      const { prisma } = await import('../lib/db.ts');

      // Update or create each AssessmentScore in Supabase
      for (const item of scores) {
        if (item.criterionId) {
          const existingScore = await prisma.assessmentScore.findFirst({
            where: {
              assessmentId,
              criterionId: item.criterionId
            }
          });

          if (existingScore) {
            await prisma.assessmentScore.update({
              where: { id: existingScore.id },
              data: {
                scoreAwarded: Number(item.scoreAwarded ?? item.score ?? 0),
                remarks: item.remarks || null
              }
            });
          } else {
            await prisma.assessmentScore.create({
              data: {
                assessmentId,
                criterionId: item.criterionId,
                scoreAwarded: Number(item.scoreAwarded ?? item.score ?? 0),
                remarks: item.remarks || null
              }
            });
          }
        }
      }

      // Calculate total score and overall result
      const allScores = await prisma.assessmentScore.findMany({
        where: { assessmentId },
        include: { criterion: true }
      });

      let totalWeighted = 0;
      let totalMax = 0;
      for (const s of allScores) {
        const weight = s.criterion?.weightage || 20;
        const max = s.criterion?.maxScore || 5;
        totalWeighted += (s.scoreAwarded / max) * weight;
        totalMax += weight;
      }

      const percentage = totalMax > 0 ? Math.round((totalWeighted / totalMax) * 100) : 80;
      const isCompetent = percentage >= 70;

      // Update Assessment record
      const updatedAssessment = await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: isFinal ? 'COMPLETED' : 'IN_PROGRESS',
          notes: remarks || null,
          practicalTaskDemo: practicalTaskDemo || undefined,
          conductedAt: isFinal ? new Date() : undefined
        }
      });

      // If finalizing decision, update Application and CompetencyResult
      let competencyResult: any = null;
      if (isFinal && applicationId) {
        await prisma.rPLApplication.update({
          where: { id: applicationId },
          data: {
            status: isCompetent ? 'COMPETENT_CERTIFIED' : 'NOT_YET_COMPETENT',
            completedAt: new Date()
          }
        });

        // Upsert CompetencyResult
        const existingResult = await prisma.competencyResult.findFirst({
          where: { rplApplicationId: applicationId }
        });

        const certNum = `CERT-NSDC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        if (existingResult) {
          competencyResult = await prisma.competencyResult.update({
            where: { id: existingResult.id },
            data: {
              assessmentId,
              overallResult: isCompetent ? 'COMPETENT' : 'NOT_YET_COMPETENT',
              finalNsqfLevel: 5,
              certifiedDate: isCompetent ? new Date() : null,
              assessorRemarks: remarks || 'Standardized assessment rubric verified by accredited assessor.'
            }
          });
        } else {
          competencyResult = await prisma.competencyResult.create({
            data: {
              rplApplicationId: applicationId,
              assessmentId,
              overallResult: isCompetent ? 'COMPETENT' : 'NOT_YET_COMPETENT',
              finalNsqfLevel: 5,
              certifiedDate: isCompetent ? new Date() : null,
              certificateNumber: isCompetent ? certNum : null,
              assessorRemarks: remarks || 'Standardized assessment rubric verified by accredited assessor.'
            }
          });
        }
      }

      sendJsonResponse(res, 200, {
        success: true,
        data: {
          assessment: updatedAssessment,
          percentage,
          isCompetent,
          competencyResult
        }
      });
      return true;
    } catch (err: any) {
      console.error('[Assessor Submit Assessment Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Server error' });
      return true;
    }
  }

  // 7. Auth Sync Profile: POST /api/auth/sync-profile
  if (pathname === '/api/auth/sync-profile') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
      return true;
    }

    try {
      const rawBody: any = await parseRequestBody(req);
      const { email, role, name, phone, trade, organization, location, token } = rawBody;

      if (!email || !role) {
        sendJsonResponse(res, 400, { success: false, error: 'Email and role are required.' });
        return true;
      }

      if (role !== 'WORKER' && role !== 'ASSESSOR') {
        sendJsonResponse(res, 400, { success: false, error: 'Role must be WORKER or ASSESSOR.' });
        return true;
      }

      let verifiedUserId: string | undefined;

      // If token provided, verify with Supabase Auth
      if (token) {
        try {
          const { verifySupabaseToken } = await import('./auth.ts');
          const authUser = await verifySupabaseToken(token);
          verifiedUserId = authUser.id;
        } catch (tokenErr) {
          console.warn('[Auth Token Verification Notice]', tokenErr);
        }
      }

      const { syncUserProfile } = await import('./auth.ts');
      const synced = await syncUserProfile({
        userId: verifiedUserId,
        email: email.trim().toLowerCase(),
        role,
        name: name?.trim() || (role === 'ASSESSOR' ? 'Accredited Assessor' : 'Candidate Worker'),
        phone: phone?.trim(),
        trade: trade?.trim(),
        organization: organization?.trim(),
        location: location?.trim()
      });

      sendJsonResponse(res, 200, {
        success: true,
        data: synced
      });
      return true;
    } catch (err: any) {
      console.error('[Auth Sync Profile Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Profile synchronization failed.' });
      return true;
    }
  }

  // 8. Auth Get User Role: GET /api/auth/user-role
  if (pathname === '/api/auth/user-role') {
    if (req.method !== 'GET') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
      return true;
    }

    try {
      const email = parsedUrl.searchParams.get('email')?.trim().toLowerCase();
      const authHeader = req.headers['authorization'];
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

      const { prisma } = await import('../lib/db.ts');
      let user = null;

      if (token) {
        try {
          const { verifySupabaseToken } = await import('./auth.ts');
          const authUser = await verifySupabaseToken(token);
          if (authUser?.email) {
            user = await prisma.user.findFirst({
              where: { email: authUser.email.toLowerCase() },
              include: { workerProfile: true, assessorProfile: true }
            });
          }
        } catch {}
      }

      if (!user && email) {
        user = await prisma.user.findFirst({
          where: { email },
          include: { workerProfile: true, assessorProfile: true }
        });
      }

      if (!user) {
        sendJsonResponse(res, 404, { success: false, error: 'User not found in system.' });
        return true;
      }

      sendJsonResponse(res, 200, {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.role === 'ASSESSOR' ? user.assessorProfile : user.workerProfile
        }
      });
      return true;
    } catch (err: any) {
      console.error('[Get User Role Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Error fetching user role.' });
      return true;
    }
  }

  // 9. Assessor List Assessments: GET /api/assessor/assessments
  if (pathname === '/api/assessor/assessments') {
    if (req.method !== 'GET') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
      return true;
    }

    try {
      const clientRole = req.headers['x-user-role'];
      const authHeader = req.headers['authorization'];
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

      if (clientRole === 'WORKER') {
        sendJsonResponse(res, 403, {
          success: false,
          code: 'FORBIDDEN_ASSESSOR_ONLY',
          error: 'Forbidden: Candidate workers are not authorized to view assessor queues.'
        });
        return true;
      }

      const { prisma } = await import('../lib/db.ts');

      if (token) {
        try {
          const { verifySupabaseToken } = await import('./auth.ts');
          const authUser = await verifySupabaseToken(token);
          if (authUser?.email) {
            const dbUser = await prisma.user.findFirst({
              where: { email: authUser.email.toLowerCase() }
            });
            if (dbUser && dbUser.role === 'WORKER') {
              sendJsonResponse(res, 403, {
                success: false,
                code: 'FORBIDDEN_ASSESSOR_ONLY',
                error: 'Forbidden: Candidate workers are not authorized to view assessor queues.'
              });
              return true;
            }
          }
        } catch {}
      }

      const assessments = await prisma.assessment.findMany({
        include: {
          rplApplication: {
            include: {
              workerProfile: true
            }
          },
          scores: true
        },
        orderBy: { createdAt: 'desc' }
      });

      sendJsonResponse(res, 200, {
        success: true,
        data: assessments
      });
      return true;
    } catch (err: any) {
      console.error('[Assessor Assessments Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to retrieve assessment queue.' });
      return true;
    }
  }

  // =========================================================================
  // 10. WORKER RPL APPLICATIONS WORKFLOW (PHASE 2.2)
  // =========================================================================

  // Helper: Authenticate worker from Bearer token
  async function resolveAuthenticatedWorker(request: IncomingMessage) {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) {
      throw new Error('Authentication required. Missing Bearer token.');
    }

    const { verifySupabaseToken } = await import('./auth.ts');
    const authUser = await verifySupabaseToken(token);
    if (!authUser || !authUser.email) {
      throw new Error('Invalid authentication session.');
    }

    const { prisma } = await import('../lib/db.ts');
    let user = await prisma.user.findFirst({
      where: { email: authUser.email.toLowerCase() },
      include: { workerProfile: true }
    });

    if (!user) {
      const { syncUserProfile } = await import('./auth.ts');
      await syncUserProfile({
        userId: authUser.id,
        email: authUser.email.toLowerCase(),
        role: 'WORKER',
        name: (authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Worker Candidate') as string
      });
      user = await prisma.user.findFirst({
        where: { email: authUser.email.toLowerCase() },
        include: { workerProfile: true }
      });
    }

    if (!user?.workerProfile) {
      const newProfile = await prisma.workerProfile.create({
        data: {
          userId: user!.id,
          name: (authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Worker Candidate') as string,
          email: user!.email,
          trade: 'General Technical',
          yearsOfExperience: 2
        }
      });
      return { user, workerProfile: newProfile };
    }

    return { user, workerProfile: user.workerProfile };
  }

  // 10.1 List Worker RPL Applications: GET /api/worker/applications
  if (pathname === '/api/worker/applications') {
    if (req.method !== 'GET') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
      return true;
    }

    try {
      const { workerProfile } = await resolveAuthenticatedWorker(req);
      const { prisma } = await import('../lib/db.ts');

      const applications = await prisma.rPLApplication.findMany({
        where: { workerProfileId: workerProfile.id },
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
      return true;
    } catch (err: any) {
      console.error('[Worker Applications List Error]', err);
      sendJsonResponse(res, 401, { success: false, error: err.message || 'Authentication failed' });
      return true;
    }
  }

  // 10.2 Get Single RPL Application: GET /api/worker/application
  if (pathname === '/api/worker/application' && req.method === 'GET') {
    try {
      const applicationId = parsedUrl.searchParams.get('id');
      if (!applicationId) {
        sendJsonResponse(res, 400, { success: false, error: 'Application ID is required.' });
        return true;
      }

      const { workerProfile } = await resolveAuthenticatedWorker(req);
      const { prisma } = await import('../lib/db.ts');

      const application = await prisma.rPLApplication.findFirst({
        where: {
          id: applicationId,
          workerProfileId: workerProfile.id // Security: Worker can only access their own application
        },
        include: {
          experiences: { orderBy: { createdAt: 'asc' } },
          skills: { orderBy: { createdAt: 'asc' } },
          aiAnalyses: { orderBy: { createdAt: 'desc' } }
        }
      });

      if (!application) {
        sendJsonResponse(res, 404, { success: false, error: 'Application not found or unauthorized.' });
        return true;
      }

      sendJsonResponse(res, 200, { success: true, application });
      return true;
    } catch (err: any) {
      console.error('[Worker Application Get Error]', err);
      sendJsonResponse(res, 401, { success: false, error: err.message || 'Authentication failed' });
      return true;
    }
  }

  // 10.3 Create or Save RPL Application Draft: POST /api/worker/application
  if (pathname === '/api/worker/application' && req.method === 'POST') {
    try {
      const { workerProfile } = await resolveAuthenticatedWorker(req);
      const body: any = await parseRequestBody(req);
      const {
        id,
        currentStep = 1,
        status = 'DRAFT',
        tradeTitle,
        formData,
        experiences = [],
        skills = []
      } = body;

      const { prisma } = await import('../lib/db.ts');

      let applicationRecord;

      if (id) {
        // Verify application belongs to this worker
        const existing = await prisma.rPLApplication.findFirst({
          where: { id, workerProfileId: workerProfile.id }
        });

        if (!existing) {
          sendJsonResponse(res, 404, { success: false, error: 'Application not found or unauthorized.' });
          return true;
        }

        // Update application
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
        // Create new application
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

      // Sync experiences relational records if provided
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

      // Sync skills relational records if provided
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

      // Re-fetch complete application
      const fullApp = await prisma.rPLApplication.findUnique({
        where: { id: applicationRecord.id },
        include: {
          experiences: true,
          skills: true,
          aiAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      });

      sendJsonResponse(res, 200, { success: true, application: fullApp });
      return true;
    } catch (err: any) {
      console.error('[Worker Save Application Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to save application.' });
      return true;
    }
  }

  // 10.4 Submit RPL Application: POST /api/worker/application/submit
  if (pathname === '/api/worker/application/submit' && req.method === 'POST') {
    try {
      const { workerProfile } = await resolveAuthenticatedWorker(req);
      const body: any = await parseRequestBody(req);
      const { id } = body;

      if (!id) {
        sendJsonResponse(res, 400, { success: false, error: 'Application ID is required for submission.' });
        return true;
      }

      const { prisma } = await import('../lib/db.ts');

      const existing = await prisma.rPLApplication.findFirst({
        where: { id, workerProfileId: workerProfile.id }
      });

      if (!existing) {
        sendJsonResponse(res, 404, { success: false, error: 'Application not found or unauthorized.' });
        return true;
      }

      // Transition to SUBMITTED
      const updated = await prisma.rPLApplication.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          currentStep: 7
        },
        include: {
          experiences: true,
          skills: true,
          aiAnalyses: true
        }
      });

      // Find an accredited assessor or default assessor to assign
      const defaultAssessor = await prisma.assessorProfile.findFirst();
      if (defaultAssessor) {
        const existingAssessment = await prisma.assessment.findFirst({
          where: { rplApplicationId: id }
        });
        if (!existingAssessment) {
          await prisma.assessment.create({
            data: {
              rplApplicationId: id,
              assessorProfileId: defaultAssessor.id,
              status: 'SCHEDULED',
              notes: 'Worker self-declaration and skills submitted for official RPL assessment.'
            }
          });
        }
      }

      sendJsonResponse(res, 200, { success: true, application: updated });
      return true;
    } catch (err: any) {
      console.error('[Worker Submit Application Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to submit application.' });
      return true;
    }
  }

  // 10.5 Analyze RPL Application Skills with Gemini: POST /api/worker/application/analyze
  if (pathname === '/api/worker/application/analyze' && req.method === 'POST') {
    try {
      const { workerProfile } = await resolveAuthenticatedWorker(req);
      const body: any = await parseRequestBody(req);
      const {
        applicationId,
        occupation = 'Skilled Worker',
        yearsExperience = 3,
        experience = '',
        tasks = [],
        tools = [],
        skills = [],
        additionalExperience = ''
      } = body;

      if (!applicationId) {
        sendJsonResponse(res, 400, { success: false, error: 'Application ID is required for AI analysis.' });
        return true;
      }

      const { prisma } = await import('../lib/db.ts');

      const existingApp = await prisma.rPLApplication.findFirst({
        where: { id: applicationId, workerProfileId: workerProfile.id }
      });

      if (!existingApp) {
        sendJsonResponse(res, 404, { success: false, error: 'Application not found or unauthorized.' });
        return true;
      }

      // Perform AI Analysis using existing Gemini 3.6 Flash integration
      const { performSkillAnalysis } = await import('../lib/ai/skill-analysis.ts');

      const analysisResult = await performSkillAnalysis({
        occupation,
        yearsExperience: Number(yearsExperience) || 3,
        experience: experience || `${occupation} with ${yearsExperience} years practical work experience.`,
        tasks: Array.isArray(tasks) ? tasks : [],
        tools: Array.isArray(tools) ? tools : [],
        skills: Array.isArray(skills) ? skills : [],
        additionalExperience,
        rplApplicationId: applicationId,
        workerProfileId: workerProfile.id
      });

      // Update application status to ASSESSMENT_READY and save AI snapshot in formData
      const currentFormData: any = existingApp.formData || {};
      const updatedFormData = {
        ...currentFormData,
        aiAnalysisId: analysisResult.recordId,
        aiAnalysisSnapshot: {
          summary: `Potential skill match analysis for ${analysisResult.potentialOccupation || occupation}`,
          strengths: analysisResult.skills.map((s) => s.name),
          recommendations: analysisResult.assessmentAreas,
          potentialSkillMatches: analysisResult.skills.map((s) => `${s.name} (${s.confidence} confidence - ${s.reason})`),
          suggestedCompetencyAreas: analysisResult.assessmentAreas,
          suggestedEvidence: analysisResult.suggestedEvidence,
          areasRequiringVerification: analysisResult.verificationRequired,
          createdAt: new Date().toISOString()
        }
      };

      await prisma.rPLApplication.update({
        where: { id: applicationId },
        data: {
          status: 'ASSESSMENT_READY',
          currentStep: 5,
          formData: updatedFormData
        }
      });

      sendJsonResponse(res, 200, {
        success: true,
        data: analysisResult,
        recordId: analysisResult.recordId
      });
      return true;
    } catch (err: any) {
      console.error('[Worker Skill Analysis Error]', err);
      const status = err.status || 500;
      sendJsonResponse(res, status, {
        success: false,
        error: err.message || 'AI skill analysis failed. Please verify internet connectivity.',
        code: err.code || 'AI_ANALYSIS_FAILED'
      });
      return true;
    }
  }

  return false;
}


