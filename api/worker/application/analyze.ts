import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI } from '@google/genai';
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

function parseRequestBody(req: IncomingMessage): Promise<any> {
  if ((req as any).body !== undefined && (req as any).body !== null) {
    const existing = (req as any).body;
    if (typeof existing === 'object') return Promise.resolve(existing);
    if (typeof existing === 'string') {
      try {
        return Promise.resolve(JSON.parse(existing));
      } catch {
        return Promise.resolve({});
      }
    }
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
    return;
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    sendJsonResponse(res, 401, { success: false, error: 'Authentication required.' });
    return;
  }

  const supabase = getSupabase();
  if (!supabase) {
    sendJsonResponse(res, 503, { success: false, error: 'Supabase client not configured.' });
    return;
  }

  const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !authUser?.email) {
    sendJsonResponse(res, 401, { success: false, error: authErr?.message || 'Invalid session.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    sendJsonResponse(res, 503, { success: false, error: 'AI analysis service is not configured.' });
    return;
  }

  try {
    const dbUser = await prisma.user.findFirst({
      where: { email: authUser.email.toLowerCase() },
      include: { workerProfile: true }
    });

    if (!dbUser?.workerProfile) {
      sendJsonResponse(res, 404, { success: false, error: 'Worker profile not found.' });
      return;
    }

    const body = await parseRequestBody(req);
    const {
      applicationId,
      occupation = 'Skilled Worker',
      yearsExperience = 3,
      experience = '',
      tasks = [],
      tools = [],
      skills = []
    } = body;

    if (!applicationId) {
      sendJsonResponse(res, 400, { success: false, error: 'Application ID is required.' });
      return;
    }

    const app = await prisma.rPLApplication.findFirst({
      where: { id: applicationId, workerProfileId: dbUser.workerProfile.id }
    });

    if (!app) {
      sendJsonResponse(res, 404, { success: false, error: 'Application not found or unauthorized.' });
      return;
    }

    const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash';
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert RPL (Recognition of Prior Learning) Skill Analysis Assistant.
Analyze the following worker's self-declared experience:
Occupation: ${occupation}
Years Experience: ${yearsExperience}
Work Experience: ${experience}
Tasks: ${(Array.isArray(tasks) ? tasks : []).join(', ')}
Tools: ${(Array.isArray(tools) ? tools : []).join(', ')}
Skills: ${(Array.isArray(skills) ? skills : []).join(', ')}

Return a JSON object conforming strictly to:
{
  "potentialOccupation": string,
  "skills": [{"name": string, "reason": string, "confidence": "HIGH"|"MEDIUM"|"LOW"}],
  "tasks": string[],
  "tools": string[],
  "assessmentAreas": string[],
  "suggestedEvidence": string[],
  "potentialQualificationMappings": string[],
  "verificationRequired": string[]
}
CRITICAL RULES:
- Never claim "Certified" or "Competent".
- Label findings as potential skill matches and suggested areas requiring assessor verification.`;

    const aiRes = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let rawJson = aiRes.text?.trim() || '{}';
    if (rawJson.startsWith('```json')) rawJson = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    else if (rawJson.startsWith('```')) rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '');

    const analysis = JSON.parse(rawJson);

    // Save to AIAnalysis in database
    const saved = await prisma.aIAnalysis.create({
      data: {
        rplApplicationId: applicationId,
        analysisType: 'SKILL_ANALYSIS',
        summary: `AI Skill Analysis for ${analysis.potentialOccupation || occupation}`,
        strengths: (analysis.skills || []).map((s: any) => s.name || ''),
        recommendations: analysis.assessmentAreas || [],
        confidenceScore: 0.85,
        isOfficialAssessment: false,
        model: modelName,
        status: 'COMPLETED',
        result: analysis
      }
    });

    // Update RPL application status
    const currentFormData: any = app.formData || {};
    await prisma.rPLApplication.update({
      where: { id: applicationId },
      data: {
        status: 'ASSESSMENT_READY',
        currentStep: 5,
        formData: {
          ...currentFormData,
          aiAnalysisId: saved.id,
          aiAnalysisSnapshot: {
            summary: `Potential skill match analysis for ${analysis.potentialOccupation || occupation}`,
            strengths: (analysis.skills || []).map((s: any) => s.name || ''),
            recommendations: analysis.assessmentAreas || [],
            potentialSkillMatches: (analysis.skills || []).map((s: any) => `${s.name} (${s.confidence || 'MEDIUM'} confidence - ${s.reason || ''})`),
            suggestedCompetencyAreas: analysis.assessmentAreas || [],
            suggestedEvidence: analysis.suggestedEvidence || [],
            areasRequiringVerification: analysis.verificationRequired || [],
            createdAt: new Date().toISOString()
          }
        }
      }
    });

    sendJsonResponse(res, 200, { success: true, data: analysis, recordId: saved.id });
  } catch (err: any) {
    console.error('[Vercel AI Analyze Error]', err);
    sendJsonResponse(res, 500, { success: false, error: err.message || 'AI analysis failed' });
  }
}
