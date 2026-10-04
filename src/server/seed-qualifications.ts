/**
 * Seed / Synchronize Authoritative NCVET / NQR Qualifications into Prisma PostgreSQL
 * Ensures database always matches verified qualification packs and NOS units.
 */
import { prisma } from '../lib/db.ts';
import { VERIFIED_QUALIFICATIONS } from '../data/qualification-catalog.ts';

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
