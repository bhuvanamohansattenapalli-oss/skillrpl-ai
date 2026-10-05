import { prisma } from '../db';

/**
 * Initializes essential demo data in Supabase if not already present,
 * ensuring the Assessor Flow can query and update real database records.
 */
export async function ensureAssessorDemoData() {
  try {
    // 1. Check or create User for Worker
    let workerUser = await prisma.user.findFirst({
      where: { email: 'rajesh.kumar.electric@gmail.com' }
    });

    if (!workerUser) {
      workerUser = await prisma.user.create({
        data: {
          email: 'rajesh.kumar.electric@gmail.com',
          role: 'WORKER'
        }
      });
    }

    // 2. Check or create WorkerProfile
    let workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: workerUser.id }
    });

    if (!workerProfile) {
      workerProfile = await prisma.workerProfile.create({
        data: {
          userId: workerUser.id,
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar.electric@gmail.com',
          phone: '+91 98452 31920',
          trade: 'Industrial Electrician & Solar PV Specialist',
          primaryTrade: 'Industrial Electrician',
          tradeCode: 'ELE/Q0105',
          nsqfLevel: 5,
          yearsOfExperience: 7.5,
          location: 'Pune Industrial Area',
          state: 'Maharashtra',
          profileCompletion: 85,
          professionalSummary:
            'Accomplished electrical technician with 7+ years of hands-on experience in 3-phase industrial wiring, motor starter installations, switchgear maintenance, and rooftop solar grid-tie inverters.'
        }
      });
    }

    // 3. Check or create Assessor User & Profile
    let assessorUser = await prisma.user.findFirst({
      where: { email: 'dr.arvind.assessor@skillrpl.gov.in' }
    });

    if (!assessorUser) {
      assessorUser = await prisma.user.create({
        data: {
          email: 'dr.arvind.assessor@skillrpl.gov.in',
          role: 'ASSESSOR'
        }
      });
    }

    let assessorProfile = await prisma.assessorProfile.findUnique({
      where: { userId: assessorUser.id }
    });

    if (!assessorProfile) {
      assessorProfile = await prisma.assessorProfile.create({
        data: {
          userId: assessorUser.id,
          name: 'Dr. Arvind Sharma',
          email: 'dr.arvind.assessor@skillrpl.gov.in',
          phone: '+91 94220 81190',
          tradeSpecialization: 'Electrical & Power Distribution (ELE/Q0105)',
          assessorRegNumber: 'ASR-NSDC-2026-9042',
          organization: 'Electronics Sector Skills Council of India (ESSCI)',
          nsqfCertifiedLevel: 5,
          isAvailable: true
        }
      });
    }

    // 4. Check or create Trade & Qualification Pack
    let trade = await prisma.trade.findFirst({
      where: { code: 'ELE-IND' }
    });

    if (!trade) {
      trade = await prisma.trade.create({
        data: {
          code: 'ELE-IND',
          name: 'Industrial Electrical and Automation',
          sector: 'Power & Capital Goods',
          nsqfLevel: 5,
          description: 'Industrial wireman, MCC control panels, and motor starters.'
        }
      });
    }

    let qp = await prisma.qualificationPack.findFirst({
      where: { code: 'ELE/Q0105' }
    });

    if (!qp) {
      qp = await prisma.qualificationPack.create({
        data: {
          code: 'ELE/Q0105',
          qpCode: 'ELE/Q0105',
          title: 'Industrial Electrician & Motor Starter Technician',
          sector: 'Power & Capital Goods',
          nsqfLevel: 5,
          tradeId: trade.id,
          description: 'National qualification standard for industrial power wiring and diagnostic testing.'
        }
      });
    }

    // 5. Check or create RPLApplication
    let application = await prisma.rPLApplication.findFirst({
      where: { applicationNumber: 'RPL-IND-2026-0842' }
    });

    if (!application) {
      application = await prisma.rPLApplication.create({
        data: {
          applicationNumber: 'RPL-IND-2026-0842',
          workerProfileId: workerProfile.id,
          qualificationPackId: qp.id,
          status: 'UNDER_ASSESSOR_REVIEW',
          submittedAt: new Date()
        }
      });
    }

    // 6. Link existing AI Skill Analysis to this application if unlinked
    const latestAiAnalysis = await prisma.aIAnalysis.findFirst({
      where: { rplApplicationId: null },
      orderBy: { createdAt: 'desc' }
    });

    if (latestAiAnalysis) {
      await prisma.aIAnalysis.update({
        where: { id: latestAiAnalysis.id },
        data: { rplApplicationId: application.id }
      });
    }

    // 7. Check or create Assessment Criteria for QP
    const criteriaCount = await prisma.assessmentCriterion.count({
      where: { qualificationPackId: qp.id }
    });

    let criteriaList: any[] = [];
    if (criteriaCount === 0) {
      const criteriaDefs = [
        {
          code: 'CRIT-ELE-01',
          description: '3-Phase Motor Wiring & Connections (Star-Delta & Terminal Box)',
          maxScore: 5.0,
          weightage: 25.0
        },
        {
          code: 'CRIT-ELE-02',
          description: 'Protective Devices, Circuit Breaker Sizing & Overload Relays',
          maxScore: 5.0,
          weightage: 20.0
        },
        {
          code: 'CRIT-ELE-03',
          description: 'Electrical Safety, Lockout/Tagout (LOTO) & PPE Protocols',
          maxScore: 5.0,
          weightage: 25.0
        },
        {
          code: 'CRIT-ELE-04',
          description: 'Systematic Fault Diagnosis & Insulation Resistance (Megger) Testing',
          maxScore: 5.0,
          weightage: 20.0
        },
        {
          code: 'CRIT-ELE-05',
          description: 'Technical Documentation & Single Line Diagram (SLD) Interpretation',
          maxScore: 5.0,
          weightage: 10.0
        }
      ];

      for (const def of criteriaDefs) {
        const createdCrit = await prisma.assessmentCriterion.create({
          data: {
            qualificationPackId: qp.id,
            code: def.code,
            description: def.description,
            maxScore: def.maxScore,
            weightage: def.weightage
          }
        });
        criteriaList.push(createdCrit);
      }
    } else {
      criteriaList = await prisma.assessmentCriterion.findMany({
        where: { qualificationPackId: qp.id }
      });
    }

    // 8. Check or create Assessment
    let assessment = await prisma.assessment.findFirst({
      where: { rplApplicationId: application.id }
    });

    if (!assessment) {
      assessment = await prisma.assessment.create({
        data: {
          rplApplicationId: application.id,
          assessorProfileId: assessorProfile.id,
          status: 'IN_PROGRESS',
          notes: 'Preliminary dossier review completed. Candidate scheduled for live practical motor wiring observation.',
          practicalTaskDemo: '3-Phase Induction Motor Starter & Relay Demonstration',
          scheduledDate: new Date()
        }
      });

      // Initialize default draft scores
      const defaultScores = [4, 4, 5, 3, 4];
      for (let i = 0; i < criteriaList.length; i++) {
        await prisma.assessmentScore.create({
          data: {
            assessmentId: assessment.id,
            criterionId: criteriaList[i].id,
            scoreAwarded: defaultScores[i] || 4,
            remarks: 'Standardized observation recorded during practical demonstration.'
          }
        });
      }
    }

    return {
      success: true,
      workerProfileId: workerProfile.id,
      assessorProfileId: assessorProfile.id,
      applicationId: application.id,
      assessmentId: assessment.id
    };
  } catch (err) {
    console.error('[Assessor Demo Data Init Error]', err);
    throw err;
  }
}
