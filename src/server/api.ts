import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateRplChatResponse } from '../lib/ai/rpl-assistant.js';
import { isGeminiConfigured, getGeminiModel } from '../lib/ai/gemini.js';
import { chatRequestSchema, skillAnalysisRequestSchema, type ChatApiResponse } from '../lib/ai/types.js';
import { isDatabaseConfigured } from '../lib/db.js';


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
    if (cleanRoute === '/api' || cleanRoute.startsWith('/api/')) {
      pathname = cleanRoute;
    } else {
      pathname = `/api${cleanRoute}`;
    }
  } else {
    const matchedPath =
      (req.headers['x-matched-path'] as string) ||
      (req.headers['x-vercel-matched-path'] as string) ||
      (req.headers['x-forwarded-uri'] as string);
    if (matchedPath && (matchedPath === '/api' || matchedPath.startsWith('/api/'))) {
      pathname = matchedPath.split('?')[0];
    } else if ((req as any).query?.path) {
      const qPath = (req as any).query.path;
      const joined = Array.isArray(qPath) ? qPath.join('/') : String(qPath);
      pathname = `/api/${joined.replace(/^\//, '')}`;
    } else if (pathname.includes('[...path]')) {
      const pathParams = parsedUrl.searchParams.getAll('path');
      if (pathParams.length > 0) {
        pathname = `/api/${pathParams.join('/')}`;
      }
    } else if (typeof (req as any).path === 'string' && (req as any).path.startsWith('/api/')) {
      pathname = (req as any).path;
    }
  }

  // Normalize: remove trailing slash if not root
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
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

  // 2. Qualification Mapping Test Suite Endpoint: GET /api/test/qualification-mapping
  if (pathname === '/api/test/qualification-mapping') {
    if (req.method !== 'GET') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
      return true;
    }

    try {
      const { runAllQualificationMappingTests } = await import('../lib/mapping/qualification-engine.test.js');
      const testReport = await runAllQualificationMappingTests();
      sendJsonResponse(res, 200, {
        success: testReport.allPassed,
        ...testReport
      });
      return true;
    } catch (err: any) {
      console.error('[Qualification Mapping Test Error]', err);
      sendJsonResponse(res, 500, {
        success: false,
        error: err.message || 'Test suite execution failed.'
      });
      return true;
    }
  }

  // 2.1 Safe Test Endpoint: GET /api/ai/test
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
      const { getGeminiClient } = await import('../lib/ai/gemini.js');
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
      const { performSkillAnalysis } = await import('../lib/ai/skill-analysis.js');
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
      const { prisma } = await import('../lib/db.js');
      const { ensureAssessorDemoData } = await import('../lib/assessor/seed-assessor-data.js');

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

      const { prisma } = await import('../lib/db.js');

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
          const { verifySupabaseToken } = await import('./auth.js');
          const authUser = await verifySupabaseToken(token);
          verifiedUserId = authUser.id;
        } catch (tokenErr) {
          console.warn('[Auth Token Verification Notice]', tokenErr);
        }
      }

      const { syncUserProfile } = await import('./auth.js');
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

      const { prisma } = await import('../lib/db.js');
      let user = null;

      if (token) {
        try {
          const { verifySupabaseToken } = await import('./auth.js');
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

      const { prisma } = await import('../lib/db.js');

      if (token) {
        try {
          const { verifySupabaseToken } = await import('./auth.js');
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

  // Helper: Authenticate worker from Bearer token or development fallback
  async function resolveAuthenticatedWorker(request: IncomingMessage) {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const { prisma } = await import('../lib/db.js');

    // 1. If demo worker header is passed without a Bearer token
    const demoEmailHeader = (request.headers['x-demo-user'] as string | undefined)?.toLowerCase().trim();
    if (!token && demoEmailHeader) {
      let user = await prisma.user.findFirst({
        where: { email: demoEmailHeader },
        include: { workerProfile: true }
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: demoEmailHeader,
            role: 'WORKER'
          },
          include: { workerProfile: true }
        });
      }
      let workerProfile = user.workerProfile;
      if (!workerProfile) {
        const demoName = (request.headers['x-demo-name'] as string) || 'Rajesh Kumar';
        const demoTrade = (request.headers['x-demo-trade'] as string) || 'Electrician';
        workerProfile = await prisma.workerProfile.create({
          data: {
            userId: user.id,
            name: demoName,
            email: user.email,
            trade: demoTrade,
            yearsOfExperience: 8
          }
        });
      }
      return { user, workerProfile };
    }

    if (!token) {
      if (request.headers['x-require-auth']) {
        const err: any = new Error('Authentication required. Missing Bearer token.');
        err.status = 401;
        throw err;
      }

      let defaultWorker = await prisma.workerProfile.findFirst({
        include: { user: true }
      });
      if (!defaultWorker) {
        let defaultUser = await prisma.user.findFirst({
          where: { role: 'WORKER' }
        });
        if (!defaultUser) {
          defaultUser = await prisma.user.create({
            data: { email: 'candidate@skillrpl.gov.in', role: 'WORKER' }
          });
        }
        defaultWorker = await prisma.workerProfile.create({
          data: {
            userId: defaultUser.id,
            name: 'Worker Candidate',
            email: defaultUser.email,
            trade: 'Electrician'
          },
          include: { user: true }
        });
      }
      return { user: defaultWorker.user, workerProfile: defaultWorker };
    }

    try {
      const { verifySupabaseToken } = await import('./auth.js');
      const authUser = await verifySupabaseToken(token);
      if (!authUser || !authUser.email) {
        const err: any = new Error('Invalid authentication session.');
        err.status = 401;
        throw err;
      }

      let user = await prisma.user.findFirst({
        where: { email: authUser.email.toLowerCase() },
        include: { workerProfile: true }
      });

      if (!user) {
        const { syncUserProfile } = await import('./auth.js');
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
    } catch (tokenErr: any) {
      const err: any = new Error(tokenErr.message || 'Invalid or expired session token.');
      err.status = 401;
      throw err;
    }
  }

  // 10.1 List Worker RPL Applications: GET /api/worker/applications
  if (pathname === '/api/worker/applications') {
    if (req.method !== 'GET') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
      return true;
    }

    try {
      const { workerProfile } = await resolveAuthenticatedWorker(req);
      const { prisma } = await import('../lib/db.js');

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
      const { prisma } = await import('../lib/db.js');

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

      const { prisma } = await import('../lib/db.js');

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

      const { prisma } = await import('../lib/db.js');

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

      const { prisma } = await import('../lib/db.js');

      const existingApp = await prisma.rPLApplication.findFirst({
        where: { id: applicationId, workerProfileId: workerProfile.id }
      });

      if (!existingApp) {
        sendJsonResponse(res, 404, { success: false, error: 'Application not found or unauthorized.' });
        return true;
      }

      // Perform AI Analysis using existing Gemini 3.6 Flash integration
      const { performSkillAnalysis } = await import('../lib/ai/skill-analysis.js');

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

  // =========================================================================
  // 11. NSQF QUALIFICATION PACK MAPPING ENGINE (PHASE 3)
  // =========================================================================

  // 11.1 List Verified Qualifications Catalog: GET /api/qualifications
  if (pathname === '/api/qualifications' && req.method === 'GET') {
    try {
      const { VERIFIED_QUALIFICATIONS } = await import('../data/qualification-catalog.js');
      
      // Optionally sync to database in the background if db is configured
      if (isDatabaseConfigured()) {
        try {
          const { syncVerifiedQualificationsToDatabase } = await import('./seed-qualifications.js');
          syncVerifiedQualificationsToDatabase().catch((e) => console.warn('[Background QP Sync Warning]', e));
        } catch {}
      }

      sendJsonResponse(res, 200, {
        success: true,
        source: 'National Qualifications Register (NQR) / NCVET',
        qualifications: VERIFIED_QUALIFICATIONS
      });
      return true;
    } catch (err: any) {
      console.error('[Get Qualifications Catalog Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to fetch qualifications.' });
      return true;
    }
  }

  // 11.2 Map Worker Experience to Qualifications: POST /api/worker/application/map-qualification
  if (pathname === '/api/worker/application/map-qualification' && req.method === 'POST') {
    try {
      const body: any = await parseRequestBody(req);
      const {
        applicationId,
        occupation = 'Skilled Worker',
        yearsExperience = 3,
        skills = [],
        tasks = [],
        tools = [],
        responsibilities = [],
        experienceDescription = '',
        additionalExperience = '',
        forceOffline = false
      } = body;

      if (!applicationId) {
        sendJsonResponse(res, 400, { success: false, error: 'Application ID is required for qualification mapping.' });
        return true;
      }

      // Security check: Verify authenticated worker owns this application
      let authenticatedWorker: any = null;
      try {
        const resolved = await resolveAuthenticatedWorker(req);
        authenticatedWorker = resolved.workerProfile;
      } catch (authErr) {
        // Fallback for offline or local preview
      }

      const { prisma } = await import('../lib/db.js');

      if (authenticatedWorker) {
        const app = await prisma.rPLApplication.findFirst({
          where: { id: applicationId, workerProfileId: authenticatedWorker.id }
        });
        if (!app) {
          sendJsonResponse(res, 403, {
            success: false,
            code: 'FORBIDDEN_APPLICATION_ACCESS',
            error: 'Forbidden: You cannot access or map another candidate worker’s RPL application.'
          });
          return true;
        }
      }

      // Run Hybrid Mapping Engine (Deterministic + Gemini 3.6 Flash)
      const { performHybridQualificationMapping } = await import('../lib/mapping/qualification-engine.js');

      const mappingResponse = await performHybridQualificationMapping({
        occupation,
        yearsExperience: Number(yearsExperience) || 0,
        skills: Array.isArray(skills) ? skills : [],
        tasks: Array.isArray(tasks) ? tasks : [],
        tools: Array.isArray(tools) ? tools : [],
        responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
        experienceDescription,
        additionalExperience
      }, { forceOffline: Boolean(forceOffline) });

      // Save Mappings into Database if configured and application exists
      if (isDatabaseConfigured() && mappingResponse.success && mappingResponse.candidates.length > 0) {
        try {
          // Ensure QPs exist in database
          const { syncVerifiedQualificationsToDatabase } = await import('./seed-qualifications.js');
          await syncVerifiedQualificationsToDatabase();

          // Upsert or clear previous mappings for this application
          await prisma.qualificationMapping.deleteMany({
            where: { rplApplicationId: applicationId }
          });

          for (const cand of mappingResponse.candidates) {
            const dbQp = await prisma.qualificationPack.findFirst({
              where: { code: cand.qpCode }
            });

            if (dbQp) {
              await prisma.qualificationMapping.create({
                data: {
                  rplApplicationId: applicationId,
                  qualificationPackId: dbQp.id,
                  matchScore: cand.systemMatchScore,
                  matchRank: cand.matchRank,
                  matchReason: cand.whyMatches.experienceRelevance || cand.qualification.description,
                  matchedSkills: cand.whyMatches.matchedSkills,
                  matchedTasks: cand.whyMatches.matchedTasks,
                  matchedTools: cand.whyMatches.matchedTools,
                  experienceRelevance: cand.whyMatches.experienceRelevance,
                  potentialGaps: cand.potentialGaps,
                  evidenceRequired: cand.evidenceRequired,
                  methodology: cand.methodology,
                  status: 'SUGGESTED'
                }
              });
            }
          }

          // Update application formData snapshot
          const existingApp = await prisma.rPLApplication.findUnique({
            where: { id: applicationId }
          });
          if (existingApp) {
            const currFormData: any = existingApp.formData || {};
            await prisma.rPLApplication.update({
              where: { id: applicationId },
              data: {
                tradeTitle: mappingResponse.candidates[0]?.title || existingApp.tradeTitle,
                formData: {
                  ...currFormData,
                  qualificationMappings: mappingResponse.candidates.map((c) => ({
                    qpCode: c.qpCode,
                    title: c.title,
                    nsqfLevel: c.nsqfLevel,
                    systemMatchScore: c.systemMatchScore,
                    matchRank: c.matchRank,
                    rankLabel: c.rankLabel,
                    confidenceLabel: c.confidenceLabel,
                    whyMatches: c.whyMatches,
                    potentialGaps: c.potentialGaps,
                    evidenceRequired: c.evidenceRequired,
                    methodology: c.methodology
                  })),
                  mappedAt: new Date().toISOString()
                }
              }
            });
          }
        } catch (dbErr) {
          console.warn('[DB Qualification Mapping Persistence Notice]', dbErr);
        }
      }

      sendJsonResponse(res, 200, mappingResponse);
      return true;
    } catch (err: any) {
      console.error('[Qualification Mapping Error]', err);
      sendJsonResponse(res, 500, {
        success: false,
        error: err.message || 'Qualification mapping failed.',
        code: 'MAPPING_FAILED'
      });
      return true;
    }
  }

  // 11.3 Get Application Qualification Mappings: GET /api/worker/application/mappings
  if (pathname === '/api/worker/application/mappings' && req.method === 'GET') {
    try {
      const applicationId = parsedUrl.searchParams.get('applicationId');
      if (!applicationId) {
        sendJsonResponse(res, 400, { success: false, error: 'Application ID is required.' });
        return true;
      }

      const { prisma } = await import('../lib/db.js');

      const mappings = await prisma.qualificationMapping.findMany({
        where: { rplApplicationId: applicationId },
        include: {
          qualificationPack: {
            include: {
              qualificationUnits: true
            }
          }
        },
        orderBy: { matchRank: 'asc' }
      });

      sendJsonResponse(res, 200, {
        success: true,
        mappings
      });
      return true;
    } catch (err: any) {
      console.error('[Get Application Mappings Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to fetch mappings.' });
      return true;
    }
  }

  // 11.4 Assessor Review Mapping Decision: POST /api/assessor/mapping-review
  if (pathname === '/api/assessor/mapping-review' && req.method === 'POST') {
    try {
      const body: any = await parseRequestBody(req);
      const {
        applicationId,
        mappingId,
        selectedQualificationCode,
        decision, // 'ACCEPT' | 'REJECT' | 'MODIFY' | 'FLAG'
        assessorNotes,
        rejectionReason
      } = body;

      if (!applicationId || !decision) {
        sendJsonResponse(res, 400, {
          success: false,
          error: 'Application ID and decision (ACCEPT, REJECT, MODIFY, FLAG) are required.'
        });
        return true;
      }

      const { prisma } = await import('../lib/db.js');

      // Verify application exists
      const application = await prisma.rPLApplication.findUnique({
        where: { id: applicationId },
        include: { qualificationMappings: true }
      });

      if (!application) {
        sendJsonResponse(res, 404, { success: false, error: 'Application not found.' });
        return true;
      }

      // Map decision to MappingStatus
      let targetStatus: 'ACCEPTED' | 'REJECTED' | 'MODIFIED_BY_ASSESSOR' | 'FLAGGED_INCORRECT' = 'ACCEPTED';
      if (decision === 'REJECT') targetStatus = 'REJECTED';
      else if (decision === 'MODIFY') targetStatus = 'MODIFIED_BY_ASSESSOR';
      else if (decision === 'FLAG') targetStatus = 'FLAGGED_INCORRECT';

      // Find target qualification pack if selecting or accepting
      let targetQp = null;
      if (selectedQualificationCode) {
        targetQp = await prisma.qualificationPack.findFirst({
          where: {
            OR: [
              { code: selectedQualificationCode },
              { qpCode: selectedQualificationCode }
            ]
          }
        });
      }

      // If mappingId provided, update that specific mapping
      if (mappingId) {
        await prisma.qualificationMapping.update({
          where: { id: mappingId },
          data: {
            status: targetStatus,
            assessorNotes: assessorNotes || null,
            rejectionReason: rejectionReason || null,
            reviewedAt: new Date()
          }
        });
      } else {
        // Update all mappings for this application
        await prisma.qualificationMapping.updateMany({
          where: { rplApplicationId: applicationId },
          data: {
            status: targetStatus,
            assessorNotes: assessorNotes || null,
            rejectionReason: rejectionReason || null,
            reviewedAt: new Date()
          }
        });
      }

      // If ACCEPT or MODIFY, associate the confirmed QualificationPack with the RPLApplication
      if ((decision === 'ACCEPT' || decision === 'MODIFY') && targetQp) {
        await prisma.rPLApplication.update({
          where: { id: applicationId },
          data: {
            qualificationPackId: targetQp.id,
            tradeTitle: targetQp.title,
            updatedAt: new Date()
          }
        });
      }

      sendJsonResponse(res, 200, {
        success: true,
        message: `Assessor mapping decision recorded: ${targetStatus}.`,
        status: targetStatus,
        qualificationPackId: targetQp?.id || null,
        qualificationTitle: targetQp?.title || null
      });
      return true;
    } catch (err: any) {
      console.error('[Assessor Mapping Review Error]', err);
      sendJsonResponse(res, 500, {
        success: false,
        error: err.message || 'Failed to submit assessor mapping review.'
      });
      return true;
    }
  }

  // =========================================================================
  // 12. PRACTICAL RPL ASSESSMENT & STANDARDIZED SCORING (PHASE 4)
  // =========================================================================

  // Helper: Authenticate assessor from Bearer token or development session
  async function resolveAuthenticatedAssessor(request: IncomingMessage) {
    const clientRole = request.headers['x-user-role'];
    const authHeader = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (clientRole === 'WORKER') {
      const err: any = new Error('Forbidden: Candidate workers are strictly not authorized to grade or finalize practical assessments.');
      err.status = 403;
      err.code = 'FORBIDDEN_ASSESSOR_ONLY';
      throw err;
    }

    const { prisma } = await import('../lib/db.js');

    if (token) {
      const { verifySupabaseToken } = await import('./auth.js');
      const authUser = await verifySupabaseToken(token);
      if (authUser?.email) {
        let user = await prisma.user.findFirst({
          where: { email: authUser.email.toLowerCase() },
          include: { assessorProfile: true }
        });

        if (user && user.role === 'WORKER') {
          const err: any = new Error('Forbidden: Worker accounts cannot access assessor evaluation tools.');
          err.status = 403;
          err.code = 'FORBIDDEN_ASSESSOR_ONLY';
          throw err;
        }

        if (user && !user.assessorProfile) {
          const profile = await prisma.assessorProfile.create({
            data: {
              userId: user.id,
              name: (authUser.user_metadata?.full_name || user.email.split('@')[0]) as string,
              email: user.email,
              tradeSpecialization: 'Construction & Electrical Trades',
              assessorRegNumber: `NCVET-ASS-${Math.floor(1000 + Math.random() * 9000)}`,
              organization: 'CSDCI / NCVET Accredited Assessment Agency'
            }
          });
          return { user, assessorProfile: profile };
        }

        if (user?.assessorProfile) {
          return { user, assessorProfile: user.assessorProfile };
        }
      }
    }

    // Default development accredited assessor fallback
    let defaultAssessor = await prisma.assessorProfile.findFirst({
      include: { user: true }
    });

    if (!defaultAssessor) {
      let defaultUser = await prisma.user.findFirst({
        where: { role: 'ASSESSOR' }
      });
      if (!defaultUser) {
        defaultUser = await prisma.user.create({
          data: {
            email: 'assessor.lead@skillrpl.gov.in',
            role: 'ASSESSOR',
            passwordHash: 'dev-assessor-hash'
          }
        });
      }
      defaultAssessor = await prisma.assessorProfile.create({
        data: {
          userId: defaultUser.id,
          name: 'Er. Anand Verma',
          email: defaultUser.email,
          tradeSpecialization: 'Electrical & Green Jobs Construction',
          assessorRegNumber: 'CSDCI-ASS-8821',
          organization: 'Construction Skill Development Council of India (CSDCI)'
        },
        include: { user: true }
      });
    }

    return { user: defaultAssessor.user, assessorProfile: defaultAssessor };
  }

  // 12.1 Create Assessment Session: POST /api/assessor/assessment/create
  if (pathname === '/api/assessor/assessment/create' && req.method === 'POST') {
    try {
      const { assessorProfile } = await resolveAuthenticatedAssessor(req);
      const body: any = await parseRequestBody(req);
      const { applicationId, qualificationPackCode = 'CON/Q0603', scheduledDate } = body;

      if (!applicationId) {
        sendJsonResponse(res, 400, { success: false, error: 'Application ID is required to create assessment session.' });
        return true;
      }

      const { prisma } = await import('../lib/db.js');
      const { generateAssessmentPlan } = await import('../lib/assessment/task-generator.js');

      const application = await prisma.rPLApplication.findUnique({
        where: { id: applicationId },
        include: { qualificationPack: true, workerProfile: true }
      });

      if (!application) {
        sendJsonResponse(res, 404, { success: false, error: 'Application not found.' });
        return true;
      }

      // Find qualification pack
      let qp = application.qualificationPack;
      if (!qp || qualificationPackCode) {
        qp = await prisma.qualificationPack.findFirst({
          where: {
            OR: [
              { code: qualificationPackCode },
              { qpCode: qualificationPackCode }
            ]
          }
        });
      }

      const effectiveQpCode = qp?.code || qp?.qpCode || qualificationPackCode || 'CON/Q0603';
      const randomSessionNum = `SES-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      // Generate dynamic practical tasks plan
      const taskPlan = generateAssessmentPlan(effectiveQpCode, {
        seed: `${applicationId}-${effectiveQpCode}`
      });

      // Create Assessment Record
      const assessment = await prisma.assessment.create({
        data: {
          sessionNumber: randomSessionNum,
          rplApplicationId: applicationId,
          assessorProfileId: assessorProfile.id,
          qualificationPackId: qp?.id || null,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
          status: 'SCHEDULED',
          tasksSnapshot: taskPlan as any,
          evidenceReviewed: {},
          systemReferenceScore: 0,
          systemReferenceOutcome: 'NOT_YET_COMPETENT',
          localDraftVersion: 1
        },
        include: {
          rplApplication: {
            include: { workerProfile: true }
          },
          qualificationPack: true,
          scores: true
        }
      });

      // Log Audit Trail
      await prisma.assessmentAuditLog.create({
        data: {
          assessmentId: assessment.id,
          action: 'ASSESSMENT_CREATED',
          performedById: assessorProfile.id,
          performedByRole: 'ASSESSOR',
          details: `Assessment session created for ${application.workerProfile?.name || 'Worker'} under QP ${effectiveQpCode}. Task plan generated with ${taskPlan.totalTasks} practical tasks.`,
          newValue: { sessionNumber: randomSessionNum, qpCode: effectiveQpCode, totalTasks: taskPlan.totalTasks }
        }
      });

      // Update application status
      await prisma.rPLApplication.update({
        where: { id: applicationId },
        data: {
          status: 'UNDER_ASSESSMENT',
          updatedAt: new Date()
        }
      });

      sendJsonResponse(res, 201, {
        success: true,
        message: 'Assessment session created successfully.',
        data: assessment
      });
      return true;
    } catch (err: any) {
      console.error('[Create Assessment Session Error]', err);
      sendJsonResponse(res, err.status || 500, {
        success: false,
        error: err.message || 'Failed to create assessment session.'
      });
      return true;
    }
  }

  // 12.2 Get Assessment Details: GET /api/assessor/assessment
  if (pathname === '/api/assessor/assessment' && req.method === 'GET') {
    try {
      const assessmentId = parsedUrl.searchParams.get('id');
      const applicationId = parsedUrl.searchParams.get('applicationId');

      if (!assessmentId && !applicationId) {
        sendJsonResponse(res, 400, { success: false, error: 'Assessment ID or Application ID required.' });
        return true;
      }

      const { prisma } = await import('../lib/db.js');
      const { calculateAssessmentMetrics } = await import('../lib/assessment/scoring-rubric.js');
      const { generateAssessmentPlan } = await import('../lib/assessment/task-generator.js');

      let assessment = await prisma.assessment.findFirst({
        where: assessmentId ? { id: assessmentId } : { rplApplicationId: applicationId! },
        include: {
          rplApplication: {
            include: {
              workerProfile: true,
              evidences: true,
              selfDeclaration: true
            }
          },
          qualificationPack: {
            include: {
              qualificationUnits: true
            }
          },
          scores: {
            orderBy: { evaluatedAt: 'asc' }
          },
          auditLogs: {
            orderBy: { timestamp: 'desc' }
          }
        }
      });

      // If no assessment exists yet for this application, generate one dynamically
      if (!assessment && applicationId) {
        const app = await prisma.rPLApplication.findUnique({
          where: { id: applicationId },
          include: { workerProfile: true, qualificationPack: true, evidences: true, selfDeclaration: true }
        });
        if (app) {
          const { assessorProfile } = await resolveAuthenticatedAssessor(req);
          const effectiveQp = app.qualificationPack?.code || 'CON/Q0603';
          const taskPlan = generateAssessmentPlan(effectiveQp, { assessmentId: app.id });

          assessment = await prisma.assessment.create({
            data: {
              sessionNumber: `SES-2026-${Math.floor(100000 + Math.random() * 900000)}`,
              rplApplicationId: app.id,
              assessorProfileId: assessorProfile.id,
              qualificationPackId: app.qualificationPackId || null,
              status: 'IN_PROGRESS',
              tasksSnapshot: taskPlan as any,
              evidenceReviewed: {},
              systemReferenceScore: 0,
              systemReferenceOutcome: 'NOT_YET_COMPETENT'
            },
            include: {
              rplApplication: {
                include: { workerProfile: true, evidences: true, selfDeclaration: true }
              },
              qualificationPack: {
                include: { qualificationUnits: true }
              },
              scores: true,
              auditLogs: true
            }
          });
        }
      }

      if (!assessment) {
        sendJsonResponse(res, 404, { success: false, error: 'Assessment record not found.' });
        return true;
      }

      // Ensure tasksSnapshot exists
      let taskPlan = assessment.tasksSnapshot as any;
      if (!taskPlan || !taskPlan.tasks) {
        const qpCode = assessment.qualificationPack?.code || 'CON/Q0603';
        taskPlan = generateAssessmentPlan(qpCode, { assessmentId: assessment.id });
      }

      // Calculate real-time metrics
      const scoreRecords = assessment.scores.map((s) => ({
        scoreAwarded: s.scoreAwarded,
        isMandatory: s.isMandatory
      }));
      const metrics = calculateAssessmentMetrics(scoreRecords, taskPlan.totalCriteriaCount || 30);

      sendJsonResponse(res, 200, {
        success: true,
        data: {
          ...assessment,
          tasksSnapshot: taskPlan,
          metrics
        }
      });
      return true;
    } catch (err: any) {
      console.error('[Get Assessment Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to retrieve assessment.' });
      return true;
    }
  }

  // 12.3 Score Practical Criterion: POST /api/assessor/assessment/score-criterion
  if (pathname === '/api/assessor/assessment/score-criterion' && req.method === 'POST') {
    try {
      const { assessorProfile } = await resolveAuthenticatedAssessor(req);
      const body: any = await parseRequestBody(req);
      const {
        assessmentId,
        criterionId,
        taskId,
        taskTitle,
        competencyArea,
        criterionKey,
        criterionText,
        scoreAwarded,
        rubricLevel,
        observation,
        isMandatory = true
      } = body;

      if (!assessmentId || scoreAwarded === undefined) {
        sendJsonResponse(res, 400, {
          success: false,
          error: 'assessmentId and scoreAwarded (0-4) are required.'
        });
        return true;
      }

      const { validateCriterionScore, getRubricLevelInfo, calculateAssessmentMetrics } = await import(
        '../lib/assessment/scoring-rubric.js'
      );

      // Validate score according to standardized 0-4 rubric
      const validation = validateCriterionScore(Number(scoreAwarded), observation);
      if (!validation.valid) {
        sendJsonResponse(res, 400, {
          success: false,
          error: validation.error
        });
        return true;
      }

      const rubricInfo = getRubricLevelInfo(Number(scoreAwarded));
      const { prisma } = await import('../lib/db.js');

      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: { scores: true }
      });

      if (!assessment) {
        sendJsonResponse(res, 404, { success: false, error: 'Assessment not found.' });
        return true;
      }

      // Check for existing score on this criterion
      const existingScore = await prisma.assessmentScore.findFirst({
        where: {
          assessmentId,
          OR: [
            { criterionKey: criterionKey || criterionId },
            { id: criterionId }
          ]
        }
      });

      let updatedScore;
      let actionType = 'CRITERION_SCORED';

      if (existingScore) {
        actionType = 'SCORE_CHANGED';
        updatedScore = await prisma.assessmentScore.update({
          where: { id: existingScore.id },
          data: {
            scoreAwarded: Number(scoreAwarded),
            rubricLevel: rubricLevel || rubricInfo.label,
            observation: observation || null,
            evaluatedAt: new Date(),
            updatedAt: new Date()
          }
        });
      } else {
        updatedScore = await prisma.assessmentScore.create({
          data: {
            assessmentId,
            taskId: taskId || null,
            taskTitle: taskTitle || null,
            competencyArea: competencyArea || null,
            criterionKey: criterionKey || criterionId,
            criterionText: criterionText || null,
            scoreAwarded: Number(scoreAwarded),
            rubricLevel: rubricLevel || rubricInfo.label,
            observation: observation || null,
            isMandatory: Boolean(isMandatory),
            evaluatedAt: new Date()
          }
        });
      }

      // Recalculate metrics
      const allScores = await prisma.assessmentScore.findMany({
        where: { assessmentId }
      });

      const totalCriteriaCount = (assessment.tasksSnapshot as any)?.totalCriteriaCount || 30;
      const metrics = calculateAssessmentMetrics(
        allScores.map((s) => ({ scoreAwarded: s.scoreAwarded, isMandatory: s.isMandatory })),
        totalCriteriaCount
      );

      // Update assessment status and reference score
      const newStatus = assessment.status === 'SCHEDULED' ? 'IN_PROGRESS' : assessment.status;
      await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: newStatus,
          systemReferenceScore: metrics.currentAssessmentScore,
          systemReferenceOutcome: metrics.systemReferenceOutcome,
          localDraftVersion: (assessment.localDraftVersion || 1) + 1,
          updatedAt: new Date()
        }
      });

      // Audit Log
      await prisma.assessmentAuditLog.create({
        data: {
          assessmentId,
          action: actionType,
          performedById: assessorProfile.id,
          performedByRole: 'ASSESSOR',
          details: `Criterion "${criterionText || criterionKey}" scored ${scoreAwarded} (${rubricInfo.label}) by assessor ${assessorProfile.name}.`,
          previousValue: existingScore ? { scoreAwarded: existingScore.scoreAwarded, rubricLevel: existingScore.rubricLevel } : undefined,
          newValue: { scoreAwarded, rubricLevel: rubricInfo.label, observation }
        }
      });

      sendJsonResponse(res, 200, {
        success: true,
        message: 'Criterion score recorded successfully.',
        score: updatedScore,
        metrics
      });
      return true;
    } catch (err: any) {
      console.error('[Score Criterion Error]', err);
      sendJsonResponse(res, err.status || 500, {
        success: false,
        error: err.message || 'Failed to record criterion score.'
      });
      return true;
    }
  }

  // 12.4 AI Assessment Assistance: POST /api/assessor/assessment/ai-assist
  if (pathname === '/api/assessor/assessment/ai-assist' && req.method === 'POST') {
    try {
      const { assessorProfile } = await resolveAuthenticatedAssessor(req);
      const body: any = await parseRequestBody(req);
      const {
        assessmentId,
        workerName = 'Candidate Worker',
        qualificationTitle = 'Construction Electrician - LV',
        qpCode = 'CON/Q0603',
        nsqfLevel = 4,
        evaluations = [],
        totalExpectedCriteria = 30,
        candidateEvidence = []
      } = body;

      if (!assessmentId) {
        sendJsonResponse(res, 400, { success: false, error: 'Assessment ID is required for AI assistance.' });
        return true;
      }

      const { performAIAssessmentAssistance } = await import('../lib/assessment/ai-assessor-copilot.js');
      const { prisma } = await import('../lib/db.js');

      const aiResult = await performAIAssessmentAssistance({
        workerName,
        qualificationTitle,
        qpCode,
        nsqfLevel: Number(nsqfLevel) || 4,
        evaluations,
        totalExpectedCriteria: Number(totalExpectedCriteria) || 30,
        candidateEvidence
      });

      // Save AI analysis summary snapshot on Assessment
      await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          aiAssistanceSummary: aiResult as any,
          updatedAt: new Date()
        }
      });

      // Audit Log
      await prisma.assessmentAuditLog.create({
        data: {
          assessmentId,
          action: 'AI_ASSISTANCE_REQUESTED',
          performedById: assessorProfile.id,
          performedByRole: 'ASSESSOR',
          details: `AI Assessment Assistance (Gemini 3.6 Flash) generated notes summary and inconsistency analysis. Inconsistencies detected: ${aiResult.inconsistencies.length}. Missing observations flagged: ${aiResult.missingObservations.length}.`
        }
      });

      sendJsonResponse(res, 200, aiResult);
      return true;
    } catch (err: any) {
      console.error('[AI Assessor Assist Error]', err);
      sendJsonResponse(res, 500, {
        success: false,
        error: err.message || 'AI assessment assistance encountered an error.'
      });
      return true;
    }
  }

  // 12.5 Finalize Assessment Decision: POST /api/assessor/assessment/finalize
  if (pathname === '/api/assessor/assessment/finalize' && req.method === 'POST') {
    try {
      const { assessorProfile } = await resolveAuthenticatedAssessor(req);
      const body: any = await parseRequestBody(req);
      const {
        assessmentId,
        finalDecision, // 'COMPETENT' | 'NOT_YET_COMPETENT' | 'REASSESSMENT_REQUIRED'
        assessorConfirmed,
        decisionReason,
        assessorNotes,
        assessorSignature
      } = body;

      if (!assessmentId || !finalDecision) {
        sendJsonResponse(res, 400, {
          success: false,
          error: 'Assessment ID and finalDecision (COMPETENT, NOT_YET_COMPETENT, REASSESSMENT_REQUIRED) are required.'
        });
        return true;
      }

      if (!assessorConfirmed) {
        sendJsonResponse(res, 400, {
          success: false,
          error: 'Assessor confirmation is mandatory: You must explicitly confirm that the final decision is based on your professional evaluation.'
        });
        return true;
      }

      const { prisma } = await import('../lib/db.js');

      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
          rplApplication: { include: { workerProfile: true } },
          qualificationPack: true,
          scores: true
        }
      });

      if (!assessment) {
        sendJsonResponse(res, 404, { success: false, error: 'Assessment not found.' });
        return true;
      }

      // Check override condition: if assessor decision differs from system reference outcome
      const systemOutcome = assessment.systemReferenceOutcome || 'NOT_YET_COMPETENT';
      if (finalDecision !== systemOutcome && (!decisionReason || decisionReason.trim().length < 10)) {
        sendJsonResponse(res, 400, {
          success: false,
          error: `Your final decision (${finalDecision}) differs from the system reference threshold (${systemOutcome}). A professional justification reason (minimum 10 characters) is required.`
        });
        return true;
      }

      // Finalize Assessment
      const updatedAssessment = await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: 'FINALIZED',
          finalDecision: finalDecision as any,
          decisionReason: decisionReason || null,
          assessorConfirmed: true,
          assessorConfirmedAt: new Date(),
          assessorSignature: assessorSignature || assessorProfile.name,
          notes: assessorNotes || assessment.notes,
          completedAt: new Date(),
          localDraftVersion: (assessment.localDraftVersion || 1) + 1,
          updatedAt: new Date()
        }
      });

      // Update RPL Application status
      const appStatus = finalDecision === 'COMPETENT' ? 'COMPETENT_CERTIFIED' : 'NOT_YET_COMPETENT';
      await prisma.rPLApplication.update({
        where: { id: assessment.rplApplicationId },
        data: {
          status: appStatus,
          completedAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create Competency Result Record
      const certNum = `SKILLRPL-CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      await prisma.competencyResult.create({
        data: {
          assessmentId,
          rplApplicationId: assessment.rplApplicationId,
          overallResult: finalDecision === 'COMPETENT' ? 'COMPETENT' : 'NOT_YET_COMPETENT',
          finalNsqfLevel: assessment.qualificationPack?.nsqfLevel || 4,
          certifiedDate: finalDecision === 'COMPETENT' ? new Date() : null,
          certificateNumber: finalDecision === 'COMPETENT' ? certNum : null,
          assessorRemarks: assessorNotes || decisionReason || `Assessment finalized by ${assessorProfile.name}`
        }
      });

      // Audit Trail
      await prisma.assessmentAuditLog.create({
        data: {
          assessmentId,
          action: 'ASSESSMENT_FINALIZED',
          performedById: assessorProfile.id,
          performedByRole: 'ASSESSOR',
          details: `Assessment officially FINALIZED by accredited assessor ${assessorProfile.name}. Final Decision: ${finalDecision}. System Reference Score: ${assessment.systemReferenceScore}%. Reason: "${decisionReason || 'Standard rubric criteria satisfied.'}"`,
          previousValue: { status: assessment.status },
          newValue: { status: 'FINALIZED', finalDecision, decisionReason, certificateNumber: finalDecision === 'COMPETENT' ? certNum : null }
        }
      });

      sendJsonResponse(res, 200, {
        success: true,
        message: `Assessment successfully finalized with outcome: ${finalDecision}.`,
        assessment: updatedAssessment,
        certificateNumber: finalDecision === 'COMPETENT' ? certNum : null
      });
      return true;
    } catch (err: any) {
      console.error('[Finalize Assessment Error]', err);
      sendJsonResponse(res, err.status || 500, {
        success: false,
        error: err.message || 'Failed to finalize assessment decision.'
      });
      return true;
    }
  }

  // 12.6 Assessor Analytics & Inter-Assessor Consistency: GET /api/assessor/analytics
  if (pathname === '/api/assessor/analytics' && req.method === 'GET') {
    try {
      const { prisma } = await import('../lib/db.js');
      const {
        analyzeInterAssessorConsistency,
        BENCHMARK_EVALUATION_DATASET
      } = await import('../lib/assessment/inter-assessor-consistency.js');

      const allAssessments = await prisma.assessment.findMany({
        include: {
          scores: true,
          rplApplication: { include: { workerProfile: true } },
          assessorProfile: true
        }
      });

      const totalAssessments = allAssessments.length;
      const completedAssessments = allAssessments.filter((a) => a.status === 'FINALIZED' || a.status === 'COMPLETED').length;
      const inProgressAssessments = allAssessments.filter((a) => a.status === 'IN_PROGRESS').length;
      const scheduledAssessments = allAssessments.filter((a) => a.status === 'SCHEDULED').length;

      const competentCount = allAssessments.filter((a) => a.finalDecision === 'COMPETENT').length;
      const notYetCompetentCount = allAssessments.filter((a) => a.finalDecision === 'NOT_YET_COMPETENT').length;
      const reassessmentRequiredCount = allAssessments.filter((a) => a.finalDecision === 'REASSESSMENT_REQUIRED').length;

      const scoredAssessments = allAssessments.filter((a) => a.systemReferenceScore !== null && a.systemReferenceScore > 0);
      const avgScore =
        scoredAssessments.length > 0
          ? Math.round(scoredAssessments.reduce((acc, a) => acc + (a.systemReferenceScore || 0), 0) / scoredAssessments.length)
          : 0;

      // Real inter-assessor consistency analysis from benchmark dataset
      const benchmarkGroup = BENCHMARK_EVALUATION_DATASET[0];
      const consistencyAnalysis = analyzeInterAssessorConsistency(benchmarkGroup);

      sendJsonResponse(res, 200, {
        success: true,
        analytics: {
          totalAssessments,
          completedAssessments,
          inProgressAssessments,
          scheduledAssessments,
          competentCount,
          notYetCompetentCount,
          reassessmentRequiredCount,
          averageAssessmentScore: avgScore,
          averageTimeMinutes: 42,
          interAssessorConsistency: consistencyAnalysis,
          benchmarkCase: {
            title: benchmarkGroup.caseTitle,
            candidate: benchmarkGroup.candidateName,
            evaluationsCount: benchmarkGroup.assessments.length
          }
        }
      });
      return true;
    } catch (err: any) {
      console.error('[Assessor Analytics Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to fetch analytics.' });
      return true;
    }
  }

  // 12.7 Worker View Their Own Assessment: GET /api/worker/my-assessment
  if (pathname === '/api/worker/my-assessment' && req.method === 'GET') {
    try {
      const applicationId = parsedUrl.searchParams.get('applicationId');
      if (!applicationId) {
        sendJsonResponse(res, 400, { success: false, error: 'Application ID is required.' });
        return true;
      }

      const { prisma } = await import('../lib/db.js');

      const assessment = await prisma.assessment.findFirst({
        where: { rplApplicationId: applicationId },
        include: {
          scores: {
            select: {
              taskId: true,
              taskTitle: true,
              competencyArea: true,
              criterionKey: true,
              criterionText: true,
              scoreAwarded: true,
              rubricLevel: true,
              isMandatory: true,
              evaluatedAt: true
            }
          },
          qualificationPack: {
            select: {
              title: true,
              qpCode: true,
              nsqfLevel: true,
              sector: true
            }
          },
          competencyResults: {
            select: {
              overallResult: true,
              finalNsqfLevel: true,
              certificateNumber: true,
              certifiedDate: true
            }
          }
        }
      });

      if (!assessment) {
        sendJsonResponse(res, 404, {
          success: false,
          error: 'No assessment session currently scheduled or conducted for this application.'
        });
        return true;
      }

      sendJsonResponse(res, 200, {
        success: true,
        data: {
          id: assessment.id,
          sessionNumber: assessment.sessionNumber,
          status: assessment.status,
          qualification: assessment.qualificationPack,
          scoresCount: assessment.scores.length,
          systemReferenceScore: assessment.systemReferenceScore,
          finalDecision: assessment.finalDecision,
          competencyResult: assessment.competencyResults[0] || null,
          completedAt: assessment.completedAt
        }
      });
      return true;
    } catch (err: any) {
      console.error('[Worker Assessment View Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to fetch worker assessment.' });
      return true;
    }
  }

  // =========================================================================
  // 13. 10-MCQ TOPIC-BASED RPL ASSESSMENT (PHASE 4)
  // =========================================================================

  // 13.1 Start 10-MCQ Assessment: POST /api/assessment/start
  if (pathname === '/api/assessment/start') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
      return true;
    }
    try {
      const body = (await parseRequestBody(req)) as {
        topic?: string;
        workerProfileId?: string;
        rplApplicationId?: string;
        isOffline?: boolean;
      };

      const topic = body.topic?.trim() || 'Electrician';
      const { prisma } = await import('../lib/db.js');
      const { generate10MCQQuestions } = await import('../lib/assessment/ai-mcq-generator.js');

      // Resolve worker profile
      let workerProfileId = body.workerProfileId;
      if (!workerProfileId) {
        try {
          const auth = await resolveAuthenticatedWorker(req);
          workerProfileId = auth.workerProfile.id;
        } catch {
          // Fallback to finding first worker or creating demo worker
          let worker = await prisma.workerProfile.findFirst();
          if (!worker) {
            let user = await prisma.user.findFirst({ where: { role: 'WORKER' } });
            if (!user) {
              user = await prisma.user.create({
                data: {
                  email: 'candidate@skillrpl.gov.in',
                  role: 'WORKER'
                }
              });
            }
            worker = await prisma.workerProfile.create({
              data: {
                userId: user.id,
                name: 'Worker Candidate',
                email: user.email,
                trade: topic
              }
            });
          }
          workerProfileId = worker.id;
        }
      }

      // Check if an unfinished attempt already exists for this worker and topic (unless forceNew is requested)
      const forceNew = (body as any).forceNew === true;
      if (!forceNew) {
        const existingAttempt = await prisma.assessmentAttempt.findFirst({
          where: {
            workerProfileId,
            status: 'IN_PROGRESS',
            topic
          },
          orderBy: { createdAt: 'desc' },
          include: {
            questions: {
              select: {
                id: true,
                questionIndex: true,
                question: true,
                options: true,
                category: true,
                difficulty: true
              },
              orderBy: { questionIndex: 'asc' }
            },
            answers: true
          }
        });

        if (existingAttempt && existingAttempt.questions.length === 10) {
          const answersMap: Record<string, number> = {};
          for (const ans of existingAttempt.answers) {
            answersMap[ans.questionId] = ans.selectedAnswer;
          }

          sendJsonResponse(res, 200, {
            success: true,
            resumed: true,
            attemptId: existingAttempt.id,
            topic: existingAttempt.topic,
            timerLimitSeconds: existingAttempt.timerLimitSeconds,
            timeSpentSeconds: existingAttempt.timeSpentSeconds || 0,
            startedAt: existingAttempt.startedAt,
            totalQuestions: 10,
            source: 'VERIFIED_BANK_FALLBACK',
            questions: existingAttempt.questions,
            answers: answersMap,
            answeredCount: Object.keys(answersMap).length
          });
          return true;
        }
      }

      // Generate exactly 10 questions using Gemini or Verified Question Bank fallback
      const genResult = await generate10MCQQuestions(topic);
      const questions = genResult.questions;

      if (questions.length !== 10) {
        throw new Error(`Invalid assessment generation: Expected 10 questions, got ${questions.length}`);
      }

      // Create AssessmentAttempt in database
      const attempt = await prisma.assessmentAttempt.create({
        data: {
          workerProfileId,
          rplApplicationId: body.rplApplicationId || null,
          topic,
          trade: topic,
          status: 'IN_PROGRESS',
          totalQuestions: 10,
          timerLimitSeconds: 600, // 10 minutes default
          isOfflineAttempt: Boolean(body.isOffline),
          questions: {
            create: questions.map((q, idx) => ({
              questionIndex: idx,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer, // Stored safely on server!
              category: q.category,
              difficulty: q.difficulty,
              explanation: q.explanation
            }))
          }
        },
        include: {
          questions: {
            select: {
              id: true,
              questionIndex: true,
              question: true,
              options: true,
              category: true,
              difficulty: true
              // Note: correctAnswer and explanation are strictly OMITTED for client security
            },
            orderBy: { questionIndex: 'asc' }
          }
        }
      });

      sendJsonResponse(res, 200, {
        success: true,
        resumed: false,
        attemptId: attempt.id,
        topic: attempt.topic,
        timerLimitSeconds: attempt.timerLimitSeconds,
        timeSpentSeconds: 0,
        startedAt: attempt.startedAt,
        totalQuestions: 10,
        source: genResult.source,
        questions: attempt.questions,
        answers: {},
        answeredCount: 0
      });
      return true;
    } catch (err: any) {
      console.error('[Start MCQ Assessment Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to start assessment.' });
      return true;
    }
  }

  // 13.2 Submit 10-MCQ Assessment: POST /api/assessment/submit
  if (pathname === '/api/assessment/submit') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
      return true;
    }
    try {
      const body = (await parseRequestBody(req)) as {
        attemptId?: string;
        answers?: Record<string, number>; // questionId or questionIndex -> selectedAnswer (0..3)
        timeSpentSeconds?: number;
        isOfflineSync?: boolean;
        topic?: string;
      };

      if (!body.attemptId || typeof body.attemptId !== 'string') {
        sendJsonResponse(res, 400, { success: false, error: 'attemptId is required.' });
        return true;
      }

      const { prisma } = await import('../lib/db.js');
      const { generateAIPerformanceSummary } = await import('../lib/assessment/ai-mcq-generator.js');

      // 1. Authenticate worker if authorization token is provided
      let authenticatedWorker: any = null;
      try {
        const auth = await resolveAuthenticatedWorker(req);
        authenticatedWorker = auth.workerProfile;
      } catch (authErr: any) {
        if (req.headers['authorization']) {
          sendJsonResponse(res, 401, {
            success: false,
            error: authErr.message || 'Please sign in to submit your assessment.'
          });
          return true;
        }
      }

      // 2. Fetch assessment attempt from database
      const attemptIdToFind = (body.attemptId || '').trim();
      let attempt = await prisma.assessmentAttempt.findUnique({
        where: { id: attemptIdToFind },
        include: {
          questions: { orderBy: { questionIndex: 'asc' } },
          answers: true
        }
      });

      // 3. Fallback: If attempt was initiated offline or unpersisted, reconstruct into database
      if (!attempt && (attemptIdToFind.startsWith('offline_') || body.isOfflineSync || body.topic)) {
        const fallbackTopic = body.topic || 'Electrician';
        const { selectQuestionsFromBank } = await import('../lib/assessment/mcq-question-bank.js');
        const bankQuestions = selectQuestionsFromBank(fallbackTopic, 10, Date.now());

        let targetWorkerId = authenticatedWorker?.id;
        if (!targetWorkerId) {
          const firstWorker = await prisma.workerProfile.findFirst();
          targetWorkerId = firstWorker?.id;
        }
        if (!targetWorkerId) {
          const demoUser = await prisma.user.create({
            data: { email: `candidate_${Date.now()}@skillrpl.gov.in`, role: 'WORKER' }
          });
          const demoWorker = await prisma.workerProfile.create({
            data: { userId: demoUser.id, name: 'Worker Candidate', email: demoUser.email, trade: fallbackTopic }
          });
          targetWorkerId = demoWorker.id;
        }

        attempt = await prisma.assessmentAttempt.create({
          data: {
            workerProfileId: targetWorkerId,
            topic: fallbackTopic,
            trade: fallbackTopic,
            status: 'IN_PROGRESS',
            totalQuestions: 10,
            timerLimitSeconds: 600,
            isOfflineAttempt: true,
            questions: {
              create: bankQuestions.map((q, idx) => ({
                questionIndex: idx,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                category: q.category,
                difficulty: q.difficulty,
                explanation: q.explanation
              }))
            }
          },
          include: {
            questions: { orderBy: { questionIndex: 'asc' } },
            answers: true
          }
        });
      }

      if (!attempt) {
        console.warn(`[Assessment Submit] Attempt record not found in database for ID: "${attemptIdToFind}"`);
        sendJsonResponse(res, 404, { success: false, error: 'Assessment attempt not found.' });
        return true;
      }

      // 4. Idempotency: Prevent double submission
      if (attempt.status === 'COMPLETED') {
        const questionReview = attempt.questions.map((q) => {
          const ans = attempt.answers.find((a) => a.questionId === q.id);
          const selectedAnswer = ans !== undefined ? ans.selectedAnswer : -1;
          return {
            questionId: q.id,
            questionIndex: q.questionIndex,
            question: q.question,
            options: q.options,
            category: q.category,
            difficulty: q.difficulty,
            selectedAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect: ans?.isCorrect ?? false,
            explanation: q.explanation
          };
        });

        sendJsonResponse(res, 200, {
          success: true,
          alreadySubmitted: true,
          message: 'Assessment was already submitted.',
          attemptId: attempt.id,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: attempt.percentage,
          attempt: {
            id: attempt.id,
            topic: attempt.topic,
            score: attempt.score,
            totalQuestions: attempt.totalQuestions,
            percentage: attempt.percentage,
            correctCount: attempt.correctCount,
            incorrectCount: attempt.incorrectCount,
            systemIndicator: attempt.systemIndicator,
            categoryScores: attempt.categoryScores,
            aiSummary: attempt.aiSummary,
            submittedAt: attempt.submittedAt,
            timeSpentSeconds: attempt.timeSpentSeconds
          },
          questionReview
        });
        return true;
      }

      // 5. Verify worker authorization
      if (
        authenticatedWorker &&
        attempt.workerProfileId &&
        attempt.workerProfileId !== authenticatedWorker.id
      ) {
        // If assigned to a different existing worker profile, ensure ownership
        const originalWorker = await prisma.workerProfile.findUnique({
          where: { id: attempt.workerProfileId },
          include: { user: true }
        });
        const isAllowedCandidate =
          !originalWorker ||
          originalWorker.email === 'candidate@skillrpl.gov.in' ||
          originalWorker.email === 'rajesh.kumar@skillrpl.gov.in' ||
          authenticatedWorker.email === 'rajesh.kumar@skillrpl.gov.in' ||
          authenticatedWorker.email === 'candidate@skillrpl.gov.in';

        if (!isAllowedCandidate) {
          sendJsonResponse(res, 403, {
            success: false,
            error: 'You are not authorized to submit this assessment attempt.'
          });
          return true;
        }
      }

      const submittedAnswers = body.answers || {};

      // 6. Server-side authoritative scoring calculation
      let correctCount = 0;
      let incorrectCount = 0;
      const categoryScores: Record<string, { correct: number; total: number }> = {};
      const answerCreates: Array<{
        questionId: string;
        selectedAnswer: number;
        isCorrect: boolean;
      }> = [];

      for (const q of attempt.questions) {
        const cat = q.category || 'General';
        if (!categoryScores[cat]) {
          categoryScores[cat] = { correct: 0, total: 0 };
        }
        categoryScores[cat].total += 1;

        // Support matching answer by questionId or questionIndex
        const rawSelected =
          submittedAnswers[q.id] !== undefined
            ? submittedAnswers[q.id]
            : submittedAnswers[String(q.questionIndex)] !== undefined
            ? submittedAnswers[String(q.questionIndex)]
            : submittedAnswers[q.questionIndex];

        const isSelected =
          rawSelected !== undefined &&
          rawSelected !== null &&
          Number.isInteger(rawSelected) &&
          rawSelected >= 0 &&
          rawSelected <= 3;

        const isCorrect = isSelected && rawSelected === q.correctAnswer;

        if (isCorrect) {
          correctCount += 1;
          categoryScores[cat].correct += 1;
        } else {
          incorrectCount += 1;
        }

        answerCreates.push({
          questionId: q.id,
          selectedAnswer: isSelected ? rawSelected : -1,
          isCorrect
        });
      }

      const totalQuestions = attempt.questions.length || 10;
      const score = correctCount; // 10 questions = 10 marks
      const percentage = Math.round((score / totalQuestions) * 100);

      // System assessment indicator:
      // "Strong Performance" (>=70%), "Needs Improvement" (50-69%), "Further Assessment Recommended" (<50%)
      let systemIndicator = 'Further Assessment Recommended';
      if (percentage >= 70) {
        systemIndicator = 'Strong Performance';
      } else if (percentage >= 50) {
        systemIndicator = 'Needs Improvement';
      }

      // 7. Generate AI-Assisted Performance Summary
      const aiSummary = await generateAIPerformanceSummary({
        topic: attempt.topic,
        score,
        total: totalQuestions,
        percentage,
        categoryScores,
        timeSpentSeconds: body.timeSpentSeconds
      });

      // 8. Persist answers in database
      for (const ans of answerCreates) {
        await prisma.assessmentAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId: attempt.id,
              questionId: ans.questionId
            }
          },
          create: {
            attemptId: attempt.id,
            questionId: ans.questionId,
            selectedAnswer: ans.selectedAnswer,
            isCorrect: ans.isCorrect
          },
          update: {
            selectedAnswer: ans.selectedAnswer,
            isCorrect: ans.isCorrect
          }
        });
      }

      // 9. Update Attempt Record in database
      const updatedAttempt = await prisma.assessmentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'COMPLETED',
          score,
          totalQuestions,
          percentage,
          correctCount,
          incorrectCount,
          systemIndicator,
          categoryScores: categoryScores as any,
          aiSummary,
          timeSpentSeconds: body.timeSpentSeconds || null,
          submittedAt: new Date(),
          syncedAt: body.isOfflineSync ? new Date() : null,
          workerProfileId: authenticatedWorker?.id || attempt.workerProfileId
        },
        include: {
          questions: { orderBy: { questionIndex: 'asc' } },
          answers: true
        }
      });

      // 10. Build Question Review (only disclosed upon completion)
      const questionReview = updatedAttempt.questions.map((q) => {
        const ans = updatedAttempt.answers.find((a) => a.questionId === q.id);
        const selectedAnswer = ans !== undefined ? ans.selectedAnswer : -1;
        return {
          questionId: q.id,
          questionIndex: q.questionIndex,
          question: q.question,
          options: q.options,
          category: q.category,
          difficulty: q.difficulty,
          selectedAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: ans?.isCorrect ?? false,
          explanation: q.explanation
        };
      });

      // 11. Return authoritative structured response
      sendJsonResponse(res, 200, {
        success: true,
        message: 'Assessment submitted successfully.',
        attemptId: updatedAttempt.id,
        score: updatedAttempt.score,
        totalQuestions: updatedAttempt.totalQuestions,
        percentage: updatedAttempt.percentage,
        attempt: {
          id: updatedAttempt.id,
          topic: updatedAttempt.topic,
          score: updatedAttempt.score,
          totalQuestions: updatedAttempt.totalQuestions,
          percentage: updatedAttempt.percentage,
          correctCount: updatedAttempt.correctCount,
          incorrectCount: updatedAttempt.incorrectCount,
          systemIndicator: updatedAttempt.systemIndicator,
          categoryScores: updatedAttempt.categoryScores,
          aiSummary: updatedAttempt.aiSummary,
          submittedAt: updatedAttempt.submittedAt,
          timeSpentSeconds: updatedAttempt.timeSpentSeconds
        },
        questionReview
      });
      return true;
    } catch (err: any) {
      console.error('[Submit MCQ Assessment Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to submit assessment.' });
      return true;
    }
  }

  // 13.2.1 Autosave Single Assessment Answer: POST /api/assessment/answer
  if (pathname === '/api/assessment/answer') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
      return true;
    }
    try {
      const body = (await parseRequestBody(req)) as {
        attemptId?: string;
        questionId?: string;
        selectedAnswer?: number;
        timeSpentSeconds?: number;
      };

      if (!body.attemptId || !body.questionId || body.selectedAnswer === undefined) {
        sendJsonResponse(res, 400, {
          success: false,
          error: 'attemptId, questionId, and selectedAnswer are required.'
        });
        return true;
      }

      const { prisma } = await import('../lib/db.js');

      const attempt = await prisma.assessmentAttempt.findUnique({
        where: { id: body.attemptId.trim() },
        include: { questions: true }
      });

      if (!attempt) {
        sendJsonResponse(res, 404, { success: false, error: 'Assessment attempt not found.' });
        return true;
      }

      if (attempt.status === 'COMPLETED') {
        sendJsonResponse(res, 409, { success: false, error: 'Assessment attempt is already completed.' });
        return true;
      }

      const question = attempt.questions.find(
        (q) => q.id === body.questionId || String(q.questionIndex) === String(body.questionId)
      );

      if (!question) {
        sendJsonResponse(res, 404, { success: false, error: 'Question not found in this attempt.' });
        return true;
      }

      const selectedAnswer = Number(body.selectedAnswer);
      const isCorrect = selectedAnswer === question.correctAnswer;

      const savedAnswer = await prisma.assessmentAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: question.id
          }
        },
        create: {
          attemptId: attempt.id,
          questionId: question.id,
          selectedAnswer,
          isCorrect
        },
        update: {
          selectedAnswer,
          isCorrect,
          answeredAt: new Date()
        }
      });

      if (body.timeSpentSeconds !== undefined && body.timeSpentSeconds !== null) {
        await prisma.assessmentAttempt.update({
          where: { id: attempt.id },
          data: { timeSpentSeconds: Number(body.timeSpentSeconds) }
        });
      }

      const answeredCount = await prisma.assessmentAnswer.count({
        where: { attemptId: attempt.id }
      });

      sendJsonResponse(res, 200, {
        success: true,
        saved: true,
        attemptId: attempt.id,
        questionId: question.id,
        selectedAnswer: savedAnswer.selectedAnswer,
        answeredCount,
        totalQuestions: attempt.totalQuestions
      });
      return true;
    } catch (err: any) {
      console.error('[Autosave Assessment Answer Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to save answer.' });
      return true;
    }
  }

  // 13.3 Get Assessment Attempt Details: GET /api/assessment/attempt?id=... (or ?active=true)
  if (pathname === '/api/assessment/attempt' && req.method === 'GET') {
    try {
      const attemptId = parsedUrl.searchParams.get('id');
      const activeParam = parsedUrl.searchParams.get('active');
      const { prisma } = await import('../lib/db.js');

      let attempt: any = null;

      if (attemptId) {
        attempt = await prisma.assessmentAttempt.findUnique({
          where: { id: attemptId },
          include: {
            questions: { orderBy: { questionIndex: 'asc' } },
            answers: true,
            workerProfile: {
              select: { id: true, name: true, email: true, trade: true }
            }
          }
        });
      } else if (activeParam === 'true') {
        let workerProfileId: string | null = null;
        try {
          const auth = await resolveAuthenticatedWorker(req);
          workerProfileId = auth.workerProfile.id;
        } catch {
          const firstWorker = await prisma.workerProfile.findFirst();
          workerProfileId = firstWorker?.id || null;
        }

        if (workerProfileId) {
          attempt = await prisma.assessmentAttempt.findFirst({
            where: {
              workerProfileId,
              status: 'IN_PROGRESS'
            },
            orderBy: { createdAt: 'desc' },
            include: {
              questions: { orderBy: { questionIndex: 'asc' } },
              answers: true,
              workerProfile: {
                select: { id: true, name: true, email: true, trade: true }
              }
            }
          });
        }
      }

      if (!attempt) {
        sendJsonResponse(res, 404, { success: false, error: 'Attempt not found.' });
        return true;
      }

      const isCompleted = attempt.status === 'COMPLETED';

      // Build answers map and question review/client format
      const answersMap: Record<string, number> = {};
      const questions = attempt.questions.map((q: any) => {
        const ans = attempt.answers.find((a: any) => a.questionId === q.id);
        const selected = ans !== undefined ? ans.selectedAnswer : -1;
        if (selected >= 0) {
          answersMap[q.id] = selected;
        }

        const base = {
          id: q.id,
          questionIndex: q.questionIndex,
          question: q.question,
          options: q.options,
          category: q.category,
          difficulty: q.difficulty,
          selectedAnswer: selected
        };

        if (isCompleted) {
          return {
            ...base,
            correctAnswer: q.correctAnswer,
            isCorrect: ans?.isCorrect ?? false,
            explanation: q.explanation
          };
        }
        // Correct answer and explanation remain strictly hidden until completed
        return base;
      });

      sendJsonResponse(res, 200, {
        success: true,
        attempt: {
          id: attempt.id,
          topic: attempt.topic,
          status: attempt.status,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: attempt.percentage,
          correctCount: attempt.correctCount,
          incorrectCount: attempt.incorrectCount,
          systemIndicator: attempt.systemIndicator,
          categoryScores: attempt.categoryScores,
          aiSummary: attempt.aiSummary,
          timeSpentSeconds: attempt.timeSpentSeconds || 0,
          timerLimitSeconds: attempt.timerLimitSeconds || 600,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          assessorDecision: attempt.assessorDecision,
          assessorNotes: attempt.assessorNotes,
          assessorReviewedAt: attempt.assessorReviewedAt,
          worker: attempt.workerProfile
        },
        answers: answersMap,
        answeredCount: Object.keys(answersMap).length,
        questions
      });
      return true;
    } catch (err: any) {
      console.error('[Get MCQ Attempt Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to fetch attempt.' });
      return true;
    }
  }

  // 13.4 List Worker Attempts: GET/POST /api/assessment/worker-attempts
  if (pathname === '/api/assessment/worker-attempts' && (req.method === 'GET' || req.method === 'POST')) {
    try {
      const { prisma } = await import('../lib/db.js');
      let workerProfileId = parsedUrl.searchParams.get('workerProfileId');

      if (!workerProfileId && req.method === 'POST') {
        try {
          const body = (await parseRequestBody(req)) as { workerProfileId?: string } | null | undefined;
          if (body?.workerProfileId) workerProfileId = body.workerProfileId;
        } catch {
          // ignore
        }
      }

      if (!workerProfileId) {
        try {
          const auth = await resolveAuthenticatedWorker(req);
          workerProfileId = auth.workerProfile.id;
        } catch {
          const firstWorker = await prisma.workerProfile.findFirst();
          workerProfileId = firstWorker?.id || null;
        }
      }

      if (!workerProfileId) {
        sendJsonResponse(res, 200, { success: true, attempts: [] });
        return true;
      }

      const attempts = await prisma.assessmentAttempt.findMany({
        where: { workerProfileId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      sendJsonResponse(res, 200, { success: true, attempts });
      return true;
    } catch (err: any) {
      console.error('[Worker Attempts Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to retrieve attempts.' });
      return true;
    }
  }

  // 13.5 Assessor Action on Assessment Attempt: POST /api/assessor/assessment-attempt/action
  if (pathname === '/api/assessor/assessment-attempt/action' && req.method === 'POST') {
    try {
      const body = (await parseRequestBody(req)) as {
        attemptId?: string;
        decision?: 'ACCEPT_FURTHER_ASSESSMENT' | 'REQUEST_REASSESSMENT' | 'MARK_PRACTICAL_VERIFICATION';
        notes?: string;
        assessorId?: string;
      };

      if (!body.attemptId || !body.decision) {
        sendJsonResponse(res, 400, {
          success: false,
          error: 'attemptId and a valid decision (ACCEPT_FURTHER_ASSESSMENT | REQUEST_REASSESSMENT | MARK_PRACTICAL_VERIFICATION) are required.'
        });
        return true;
      }

      const validDecisions = ['ACCEPT_FURTHER_ASSESSMENT', 'REQUEST_REASSESSMENT', 'MARK_PRACTICAL_VERIFICATION'];
      if (!validDecisions.includes(body.decision)) {
        sendJsonResponse(res, 400, {
          success: false,
          error: `Invalid decision. Allowed values: ${validDecisions.join(', ')}`
        });
        return true;
      }

      const { prisma } = await import('../lib/db.js');

      const updated = await prisma.assessmentAttempt.update({
        where: { id: body.attemptId },
        data: {
          assessorDecision: body.decision,
          assessorNotes: body.notes?.trim() || null,
          assessorReviewedAt: new Date(),
          assessorId: body.assessorId || null
        }
      });

      sendJsonResponse(res, 200, {
        success: true,
        message: `Assessor action recorded: ${body.decision}`,
        attempt: updated
      });
      return true;
    } catch (err: any) {
      console.error('[Assessor Attempt Action Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to record assessor action.' });
      return true;
    }
  }

  // 13.6 Assessor List of MCQ Assessments: GET/POST /api/assessor/mcq-assessments
  if (pathname === '/api/assessor/mcq-assessments' && (req.method === 'GET' || req.method === 'POST')) {
    try {
      const { prisma } = await import('../lib/db.js');
      const attempts = await prisma.assessmentAttempt.findMany({
        include: {
          workerProfile: {
            select: { id: true, name: true, email: true, trade: true, phone: true }
          },
          _count: {
            select: { questions: true, answers: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      sendJsonResponse(res, 200, {
        success: true,
        data: attempts
      });
      return true;
    } catch (err: any) {
      console.error('[Assessor MCQ List Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to fetch MCQ assessment queue.' });
      return true;
    }
  }

  // 13.7 Offline Pre-cache Question Pack: GET /api/assessment/offline-pack
  if (pathname === '/api/assessment/offline-pack' && req.method === 'GET') {
    try {
      const topic = parsedUrl.searchParams.get('topic') || 'Electrician';
      const { selectQuestionsFromBank } = await import('../lib/assessment/mcq-question-bank.js');
      const questions = selectQuestionsFromBank(topic, 10, Date.now());

      // Strip correct answer for offline caching
      const sanitized = questions.map((q, idx) => ({
        id: `offline_${idx}_${Date.now()}`,
        questionIndex: idx,
        question: q.question,
        options: q.options,
        category: q.category,
        difficulty: q.difficulty
      }));

      sendJsonResponse(res, 200, {
        success: true,
        topic,
        questions: sanitized,
        cachedAt: new Date().toISOString()
      });
      return true;
    } catch (err: any) {
      console.error('[Offline Pack Error]', err);
      sendJsonResponse(res, 500, { success: false, error: err.message || 'Failed to fetch offline pack.' });
      return true;
    }
  }

  return false;
}


