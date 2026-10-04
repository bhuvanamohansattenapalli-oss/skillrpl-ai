import { prisma } from '../lib/db.ts';
import { getSupabaseClient, getServerSupabaseClient } from '../lib/supabase.ts';

export interface SyncProfileData {
  userId?: string;
  email: string;
  role: 'WORKER' | 'ASSESSOR';
  name: string;
  phone?: string;
  trade?: string;
  organization?: string;
  location?: string;
}

/**
 * Validates a Supabase JWT token and extracts the authenticated user.
 */
export async function verifySupabaseToken(token: string) {
  const supabase = getServerSupabaseClient() || getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error(error?.message || 'Invalid or expired session token.');
  }

  return user;
}

/**
 * Synchronizes an authenticated user and their corresponding role profile
 * in the Supabase PostgreSQL database via Prisma.
 */
export async function syncUserProfile(data: SyncProfileData) {
  const { email, role, name, phone, trade, organization, location } = data;

  // 1. Find or create the User record
  let user = await prisma.user.findFirst({
    where: { email: email.toLowerCase().trim() },
    include: { workerProfile: true, assessorProfile: true }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: data.userId || undefined,
        email: email.toLowerCase().trim(),
        role: role === 'ASSESSOR' ? 'ASSESSOR' : 'WORKER'
      },
      include: { workerProfile: true, assessorProfile: true }
    });
  } else if (user.role !== role) {
    // If role was explicitly updated
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: role === 'ASSESSOR' ? 'ASSESSOR' : 'WORKER' },
      include: { workerProfile: true, assessorProfile: true }
    });
  }

  // 2. Synchronize role-specific profile
  if (role === 'WORKER') {
    let workerProfile = user.workerProfile;
    if (!workerProfile) {
      workerProfile = await prisma.workerProfile.create({
        data: {
          userId: user.id,
          name: name || 'Worker Candidate',
          email: user.email,
          phone: phone || undefined,
          trade: trade || 'General Technical',
          location: location || undefined,
          yearsOfExperience: 3.0,
          profileCompletion: 60,
          professionalSummary: `RPL Candidate registered for ${trade || 'Technical Trades'} evaluation.`
        }
      });
    } else {
      workerProfile = await prisma.workerProfile.update({
        where: { id: workerProfile.id },
        data: {
          name: name || workerProfile.name,
          phone: phone !== undefined ? phone : workerProfile.phone,
          trade: trade || workerProfile.trade,
          location: location !== undefined ? location : workerProfile.location
        }
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      profile: workerProfile
    };
  } else {
    // ASSESSOR
    let assessorProfile = user.assessorProfile;
    if (!assessorProfile) {
      assessorProfile = await prisma.assessorProfile.create({
        data: {
          userId: user.id,
          name: name || 'Accredited Assessor',
          email: user.email,
          phone: phone || undefined,
          tradeSpecialization: trade || 'Technical Trades & Electrical Assessment',
          organization: organization || 'Accredited Sector Skill Council',
          nsqfCertifiedLevel: 5,
          isAvailable: true
        }
      });
    } else {
      assessorProfile = await prisma.assessorProfile.update({
        where: { id: assessorProfile.id },
        data: {
          name: name || assessorProfile.name,
          phone: phone !== undefined ? phone : assessorProfile.phone,
          tradeSpecialization: trade || assessorProfile.tradeSpecialization,
          organization: organization || assessorProfile.organization
        }
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      profile: assessorProfile
    };
  }
}
