/**
 * Seed / Synchronize Authoritative NCVET / NQR Qualifications into Prisma PostgreSQL
 * Ensures database always matches verified qualification packs and NOS units.
 */
import { prisma } from '../lib/db.js';
import { VERIFIED_QUALIFICATIONS } from '../data/qualification-catalog.js';

export async function syncVerifiedQualificationsToDatabase() {
  try {
    for (const qp of VERIFIED_QUALIFICATIONS) {
      // 1. Upsert Trade record
      const tradeCode = `TRADE-${qp.sector.replace(/\s+/g, '-').toUpperCase()}`;
      const trade = await prisma.trade.upsert({
        where: { code: tradeCode },
        update: {
          name: qp.sector === 'Construction' ? 'Construction Electrical Trades' : 'Renewable Energy & Green Trades',
          sector: qp.sector,
          nsqfLevel: qp.nsqfLevel,
          description: `Authoritative trade stream for ${qp.sector} aligned to NCVET/NQR standards.`
        },
        create: {
          code: tradeCode,
          name: qp.sector === 'Construction' ? 'Construction Electrical Trades' : 'Renewable Energy & Green Trades',
          sector: qp.sector,
          nsqfLevel: qp.nsqfLevel,
          description: `Authoritative trade stream for ${qp.sector} aligned to NCVET/NQR standards.`
        }
      });

      // 2. Upsert QualificationPack record
      const pack = await prisma.qualificationPack.upsert({
        where: { code: qp.code },
        update: {
          qpCode: qp.qpCode,
          title: qp.title,
          sector: qp.sector,
          nsqfLevel: qp.nsqfLevel,
          description: qp.description,
          awardingBody: qp.awardingBody,
          status: qp.status,
          source: qp.source,
          sourceUrl: qp.sourceUrl,
          version: qp.version,
          effectiveDate: new Date(qp.effectiveDate),
          tradeId: trade.id
        },
        create: {
          code: qp.code,
          qpCode: qp.qpCode,
          title: qp.title,
          sector: qp.sector,
          nsqfLevel: qp.nsqfLevel,
          description: qp.description,
          awardingBody: qp.awardingBody,
          status: qp.status,
          source: qp.source,
          sourceUrl: qp.sourceUrl,
          version: qp.version,
          effectiveDate: new Date(qp.effectiveDate),
          tradeId: trade.id
        }
      });

      // 3. Upsert QualificationUnit (NOS) records
      for (const unit of qp.units) {
        let existingUnit = await prisma.qualificationUnit.findFirst({
          where: {
            qualificationPackId: pack.id,
            code: unit.code
          }
        });

        if (!existingUnit) {
          existingUnit = await prisma.qualificationUnit.create({
            data: {
              qualificationPackId: pack.id,
              code: unit.code,
              title: unit.title,
              description: unit.description,
              nsqfLevel: unit.nsqfLevel,
              isMandatory: unit.isMandatory,
              assessmentCriteriaRef: unit.assessmentCriteriaRef || null
            }
          });
        } else {
          existingUnit = await prisma.qualificationUnit.update({
            where: { id: existingUnit.id },
            data: {
              title: unit.title,
              description: unit.description,
              nsqfLevel: unit.nsqfLevel,
              isMandatory: unit.isMandatory,
              assessmentCriteriaRef: unit.assessmentCriteriaRef || null
            }
          });
        }

        // 4. Upsert SkillKeyword records
        const existingKeywords = await prisma.skillKeyword.findMany({
          where: { qualificationUnitId: existingUnit.id }
        });
        const existingKwSet = new Set(existingKeywords.map((k) => k.keyword.toLowerCase()));

        for (const kw of unit.keywords) {
          if (!existingKwSet.has(kw.toLowerCase())) {
            await prisma.skillKeyword.create({
              data: {
                qualificationUnitId: existingUnit.id,
                keyword: kw.toLowerCase(),
                skill: unit.title
              }
            });
          }
        }
      }
    }
    return { success: true, count: VERIFIED_QUALIFICATIONS.length };
  } catch (err: any) {
    console.error('[Qualification DB Sync Error]', err?.message || err);
    return { success: false, error: err?.message || 'Failed to sync qualifications' };
  }
}

/**
 * Seeds persistent Demo Worker Profile, Completed Assessment (8/10, 80%, Electrician),
 * and Approved Demo Certificate.
 */
export async function seedPersistentDemoData() {
  try {
    const { selectQuestionsFromBank } = await import('../lib/assessment/mcq-question-bank.js');

    // 1. Seed Demo Assessor
    let assessorUser = await prisma.user.findFirst({
      where: { email: 'v.sharma@nsdc.gov.in' }
    });
    if (!assessorUser) {
      assessorUser = await prisma.user.create({
        data: {
          email: 'v.sharma@nsdc.gov.in',
          role: 'ASSESSOR'
        }
      });
    }

    let assessorProfile = await prisma.assessorProfile.findFirst({
      where: { userId: assessorUser.id }
    });
    if (!assessorProfile) {
      assessorProfile = await prisma.assessorProfile.create({
        data: {
          userId: assessorUser.id,
          name: 'Dr. Vikramaditya Sharma',
          email: assessorUser.email,
          phone: '+91 91234 56789',
          tradeSpecialization: 'Electrical Trades & Industrial Automation',
          assessorRegNumber: 'ASSESS-NSDC-2024-8842',
          organization: 'National Skill Development Corporation / CSDCI',
          nsqfCertifiedLevel: 5,
          isAvailable: true
        }
      });
    }

    // 2. Demo Worker emails to seed
    const workerEmails = [
      { email: 'rajesh.kumar@skillrpl.gov.in', name: 'Rajesh Kumar', idTag: 'WP-IND-2026-0842' },
      { email: 'candidate@skillrpl.gov.in', name: 'Rajesh Kumar', idTag: 'WP-IND-2026-0042' }
    ];

    for (const item of workerEmails) {
      let workerUser = await prisma.user.findFirst({
        where: { email: item.email }
      });
      if (!workerUser) {
        workerUser = await prisma.user.create({
          data: {
            email: item.email,
            role: 'WORKER'
          }
        });
      }

      let workerProfile = await prisma.workerProfile.findFirst({
        where: { userId: workerUser.id }
      });
      if (!workerProfile) {
        workerProfile = await prisma.workerProfile.create({
          data: {
            userId: workerUser.id,
            name: item.name,
            email: workerUser.email,
            phone: '+91 98765 43210',
            trade: 'Electrician',
            location: 'Industrial Area, Phase II, New Delhi',
            yearsOfExperience: 8,
            profileCompletion: 85,
            professionalSummary: 'Industrial & domestic wiring electrician with 8 years practical experience across distribution panels, cable trays, and motor control circuits.'
          }
        });
      }

      // Check for existing canonical completed assessment attempt
      const allAttempts = await prisma.assessmentAttempt.findMany({
        where: {
          workerProfileId: workerProfile.id,
          topic: 'Electrician'
        },
        include: { questions: true, answers: true },
        orderBy: { createdAt: 'desc' }
      });

      // Remove any non-canonical attempts
      for (const att of allAttempts) {
        if (att.score !== 8 || att.percentage !== 80 || att.questions.length !== 10 || att.status !== 'COMPLETED') {
          await prisma.certificate.deleteMany({ where: { assessmentAttemptId: att.id } });
          await prisma.assessmentAnswer.deleteMany({ where: { attemptId: att.id } });
          await prisma.assessmentQuestion.deleteMany({ where: { attemptId: att.id } });
          await prisma.assessmentAttempt.delete({ where: { id: att.id } });
        }
      }

      let demoAttempt = await prisma.assessmentAttempt.findFirst({
        where: {
          workerProfileId: workerProfile.id,
          topic: 'Electrician',
          status: 'COMPLETED',
          score: 8
        },
        include: { questions: true, answers: true }
      });

      if (!demoAttempt) {
        const bankQuestions = selectQuestionsFromBank('Electrician', 10, 100);
        const categoryScores = {
          'Electrical Safety': { correct: 2, total: 2 },
          'Circuit Theory & Wiring': { correct: 3, total: 3 },
          'Tools & Equipment': { correct: 2, total: 3 },
          'Standards & Codes': { correct: 1, total: 2 }
        };

        demoAttempt = await prisma.assessmentAttempt.create({
          data: {
            workerProfileId: workerProfile.id,
            topic: 'Electrician',
            trade: 'Electrician',
            status: 'COMPLETED',
            score: 8,
            totalQuestions: 10,
            percentage: 80,
            correctCount: 8,
            incorrectCount: 2,
            systemIndicator: 'Strong Performance',
            categoryScores: categoryScores as any,
            aiSummary: 'Candidate demonstrated solid theoretical comprehension in Electrician, particularly across Electrical Safety and Circuit Theory & Wiring. Recommended for practical verification.',
            timeSpentSeconds: 420,
            timerLimitSeconds: 600,
            startedAt: new Date(Date.now() - 90000000),
            submittedAt: new Date(Date.now() - 86400000),
            assessorDecision: 'ACCEPT_FURTHER_ASSESSMENT',
            assessorNotes: 'Candidate demonstrated strong practical knowledge of electrical safety rules, distribution panel wiring, and load calculation. Approved for NSQF Level 4 RPL Certification.',
            assessorReviewedAt: new Date(Date.now() - 86400000),
            assessorId: assessorProfile.id,
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
          include: { questions: { orderBy: { questionIndex: 'asc' } }, answers: true }
        });

        // Create answers for the 10 questions (8 correct, 2 incorrect)
        for (let i = 0; i < demoAttempt.questions.length; i++) {
          const q = demoAttempt.questions[i];
          const isCorrect = i !== 4 && i !== 8; // questions 4 and 8 incorrect
          const selectedAnswer = isCorrect ? q.correctAnswer : (q.correctAnswer + 1) % 4;

          await prisma.assessmentAnswer.create({
            data: {
              attemptId: demoAttempt.id,
              questionId: q.id,
              selectedAnswer,
              isCorrect,
              answeredAt: new Date(Date.now() - 86400000)
            }
          });
        }
      }

      // Check / Create Demo Certificate
      const certNum = item.email === 'rajesh.kumar@skillrpl.gov.in'
        ? 'SKILLRPL-CERT-2026-849201'
        : 'SKILLRPL-CERT-2026-849202';

      const existingCert = await prisma.certificate.findFirst({
        where: {
          OR: [
            { certificateNumber: certNum },
            { assessmentAttemptId: demoAttempt.id }
          ]
        }
      });

      if (!existingCert) {
        await prisma.certificate.create({
          data: {
            certificateNumber: certNum,
            workerProfileId: workerProfile.id,
            assessmentAttemptId: demoAttempt.id,
            workerName: item.name,
            workerIdentifier: item.idTag,
            trade: 'Electrician',
            assessmentName: 'Electrician RPL Screening & Competency Assessment',
            score: 8,
            totalScore: 10,
            percentage: 80,
            nsqfLevel: 4,
            qualificationPack: 'Assistant Electrician (ELE/Q0101)',
            assessorName: 'Dr. Vikramaditya Sharma',
            assessorId: 'ASSESS-NSDC-2024-8842',
            assessorDesignation: 'CSDCI / NCVET Accredited Lead Assessor',
            assessmentCompletedAt: new Date(Date.now() - 86400000),
            issuedAt: new Date(Date.now() - 86400000),
            status: 'ISSUED',
            isDemo: true,
            verificationCode: `VERIF-RPL-2026-${item.idTag.replace(/-/g, '')}-ELE4`,
            metadata: {
              categoryScores: demoAttempt.categoryScores,
              assessorNotes: demoAttempt.assessorNotes,
              verifiedTrade: 'Electrician',
              sector: 'Construction & Electrical Services'
            }
          }
        });
      }
    }

    return { success: true, message: 'Persistent demo data verified.' };
  } catch (err: any) {
    console.error('[Seed Persistent Demo Data Error]', err?.message || err);
    return { success: false, error: err?.message || 'Failed to seed demo data' };
  }
}

