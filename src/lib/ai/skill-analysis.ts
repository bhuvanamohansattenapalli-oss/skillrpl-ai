import { getGeminiClient, getGeminiModel } from './gemini.ts';
import { prisma } from '../db.ts';

export interface SkillItem {
  name: string;
  reason: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SkillAnalysisResult {
  potentialOccupation: string;
  skills: SkillItem[];
  tasks: string[];
  tools: string[];
  assessmentAreas: string[];
  suggestedEvidence: string[];
  potentialQualificationMappings: string[];
  verificationRequired: string[];
}

export interface SkillAnalysisInput {
  occupation: string;
  yearsExperience: number;
  experience: string;
  tasks: string[];
  tools: string[];
  skills: string[];
  additionalExperience?: string;
  workerProfileId?: string;
  rplApplicationId?: string;
}

export interface SkillAnalysisResponse {
  success: boolean;
  data?: SkillAnalysisResult;
  recordId?: string;
  error?: string;
  status?: number;
  code?: string;
}

export const SKILL_ANALYSIS_SYSTEM_INSTRUCTION = `You are an expert RPL (Recognition of Prior Learning) Skill Analysis Assistant, assisting an authorized human RPL assessor.

Your role is to analyze a candidate's self-declared work experience, tasks, tools, and skills to provide structured, objective diagnostic insights.

CRITICAL ASSESSMENT ETHICS & BOUNDARIES (MANDATORY):
1. NO CERTIFICATION: You must NEVER certify the candidate, declare them officially competent, or issue a qualification.
2. ADVISORY ONLY: All findings are preliminary advisory suggestions to assist human assessors, NOT official determinations.
3. LANGUAGE USE: Always use cautious, descriptive phrasing:
   - "Potential skill" instead of "Certified skill"
   - "Suggested mapping" instead of "Confirmed qualification"
   - "Requires assessor verification" instead of "Verified competence"
4. EVIDENCE & UNCERTAINTY: Clearly identify where evidence is needed or where self-declared statements must be corroborated by an assessor during practical observation.
5. NO INVENTED STANDARDS: Do not fabricate fictitious QP codes or NSQF prerequisites. Mention established trade domains honestly or indicate that official mapping is subject to Sector Skill Council guidelines.

Analyze the input statements meticulously and return structured data conforming to the required schema.`;

/**
 * Executes structured AI Skill Analysis using Gemini 3.6 Flash and saves the result to the database.
 */
export async function performSkillAnalysis(input: SkillAnalysisInput): Promise<SkillAnalysisResult & { recordId?: string }> {
  const ai = getGeminiClient();
  const primaryModel = getGeminiModel();
  const modelsToTry = [primaryModel, 'gemini-3.5-flash', 'gemini-flash-latest'].filter(
    (m, idx, arr) => arr.indexOf(m) === idx
  );

  const promptContent = `Analyze the following worker's self-declared experience for Recognition of Prior Learning (RPL):

Occupation / Trade: ${input.occupation}
Years of Experience: ${input.yearsExperience}
Detailed Work Experience:
"""
${input.experience}
"""

Tasks Performed:
${input.tasks.length > 0 ? input.tasks.map((t) => `- ${t}`).join('\n') : '- None provided'}

Tools & Equipment:
${input.tools.length > 0 ? input.tools.map((t) => `- ${t}`).join('\n') : '- None provided'}

Self-Declared Skills:
${input.skills.length > 0 ? input.skills.map((s) => `- ${s}`).join('\n') : '- None provided'}

${input.additionalExperience ? `Additional Experience:\n"""\n${input.additionalExperience}\n"""` : ''}

Provide a comprehensive, objective RPL diagnostic analysis strictly formatted in the required JSON schema.`;

  let response: any = null;
  let lastError: any = null;
  let modelUsed = primaryModel;

  for (const currentModel of modelsToTry) {
    const maxAttempts = currentModel === primaryModel ? 2 : 1;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: currentModel,
          contents: promptContent,
          config: {
            systemInstruction: SKILL_ANALYSIS_SYSTEM_INSTRUCTION,
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                potentialOccupation: {
                  type: 'STRING',
                  description: 'Identified primary trade or potential occupation matching the experience'
                },
                skills: {
                  type: 'ARRAY',
                  description: 'List of potential skills demonstrated or indicated by the worker',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      name: { type: 'STRING', description: 'Name of the skill' },
                      reason: { type: 'STRING', description: 'Specific evidence or context from the narrative explaining why this skill was identified' },
                      confidence: { type: 'STRING', enum: ['LOW', 'MEDIUM', 'HIGH'], description: 'Confidence level based on depth of detail provided' }
                    },
                    required: ['name', 'reason', 'confidence']
                  }
                },
                tasks: {
                  type: 'ARRAY',
                  description: 'Distinct trade tasks demonstrated in the narrative',
                  items: { type: 'STRING' }
                },
                tools: {
                  type: 'ARRAY',
                  description: 'Tools, instruments, and equipment mentioned or implied',
                  items: { type: 'STRING' }
                },
                assessmentAreas: {
                  type: 'ARRAY',
                  description: 'Key practical and theoretical domains recommended for assessor evaluation',
                  items: { type: 'STRING' }
                },
                suggestedEvidence: {
                  type: 'ARRAY',
                  description: 'Concrete portfolio evidence items the candidate should collect (e.g. photos, logs, references)',
                  items: { type: 'STRING' }
                },
                potentialQualificationMappings: {
                  type: 'ARRAY',
                  description: 'Suggested trade domains, QP job roles, or NSQF levels for assessor alignment',
                  items: { type: 'STRING' }
                },
                verificationRequired: {
                  type: 'ARRAY',
                  description: 'Crucial aspects of safety, technical accuracy, or complex tasks requiring live practical observation by the assessor',
                  items: { type: 'STRING' }
                }
              },
              required: [
                'potentialOccupation',
                'skills',
                'tasks',
                'tools',
                'assessmentAreas',
                'suggestedEvidence',
                'potentialQualificationMappings',
                'verificationRequired'
              ]
            }
          }
        });
        modelUsed = currentModel;
        break;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isQuotaExceeded = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded');
        const isTransient = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand');
        
        if (isQuotaExceeded) {
          // Immediately try next model in fallback list without useless retries
          break;
        }

        if (isTransient && attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        break;
      }
    }

    if (response) {
      break;
    }
  }

  if (!response) {
    const errorStatus = lastError?.status || 500;
    const errorMsg = lastError?.message || 'AI Skill Analysis failed';
    const err = new Error(errorMsg) as Error & { status?: number; code?: string };
    err.status = errorStatus;

    if (errorStatus === 429 || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      err.status = 429;
      err.code = 'RATE_LIMIT_EXCEEDED';
      err.message = 'AI request limit reached. Please wait a moment and try again.';
    } else if (errorStatus === 503 || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('high demand')) {
      err.status = 503;
      err.code = 'SERVICE_UNAVAILABLE';
      err.message = 'AI Assistant is temporarily busy with high demand. Please try again in a moment.';
    }
    throw err;
  }

  let rawJson = response.text?.trim() || '';
  if (!rawJson) {
    throw new Error('Gemini returned an empty response for skill analysis.');
  }

  // Clean potential markdown fencing if present
  if (rawJson.startsWith('```json')) {
    rawJson = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (rawJson.startsWith('```')) {
    rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const analysisResult = JSON.parse(rawJson) as SkillAnalysisResult;

  // Persist analysis in database
  let savedRecordId: string | undefined;
  try {
    const highConfidenceCount = analysisResult.skills.filter((s) => s.confidence === 'HIGH').length;
    const confidenceRatio = analysisResult.skills.length > 0 ? highConfidenceCount / analysisResult.skills.length : 0.5;

    const savedRecord = await prisma.aIAnalysis.create({
      data: {
        rplApplicationId: input.rplApplicationId || undefined,
        analysisType: 'SKILL_ANALYSIS',
        summary: `AI Skill Analysis for ${analysisResult.potentialOccupation || input.occupation} (${input.yearsExperience} yrs)`,
        strengths: analysisResult.skills.map((s) => s.name),
        recommendations: analysisResult.assessmentAreas,
        potentialNsqfLevel: null,
        confidenceScore: Number(confidenceRatio.toFixed(2)),
        isOfficialAssessment: false,
        inputSnapshot: input as any,
        result: analysisResult as any,
        model: modelUsed,
        type: 'SKILL_ANALYSIS',
        status: 'COMPLETED'
      }
    });

    savedRecordId = savedRecord.id;
  } catch (dbError) {
    console.warn('[Skill Analysis DB Save Warning] Could not persist to database:', dbError);
  }

  return {
    ...analysisResult,
    recordId: savedRecordId
  };
}
