import { prisma } from '../lib/db.js';
import { getSupabaseClient, getServerSupabaseClient } from '../lib/supabase.js';

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

  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new Error('Valid email address is required for user synchronization.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const guaranteedName = (typeof name === 'string' && name.trim().length > 0)
    ? name.trim()
    : (role === 'ASSESSOR' ? 'Accredited Assessor' : 'Worker Candidate');
  const guaranteedPhone = (typeof phone === 'string' && phone.trim().length > 0)
    ? phone.trim()
    : 'Not Provided';
  const guaranteedTrade = (typeof trade === 'string' && trade.trim().length > 0)
    ? trade.trim()
    : (role === 'ASSESSOR' ? 'Technical Trades & Electrical Assessment' : 'General Technical');
  const guaranteedLocation = (typeof location === 'string' && location.trim().length > 0)
    ? location.trim()
    : 'Not Specified';
  const guaranteedOrganization = (typeof organization === 'string' && organization.trim().length > 0)
    ? organization.trim()
    : 'Accredited Sector Skill Council';

  // 1. Find or create the User record
  let user = await prisma.user.findFirst({
    where: { email: normalizedEmail },
    include: { workerProfile: true, assessorProfile: true }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: data.userId || undefined,
        email: normalizedEmail,
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
          name: guaranteedName,
          email: user.email,
          phone: guaranteedPhone,
          trade: guaranteedTrade,
          location: guaranteedLocation,
          yearsOfExperience: 3.0,
          profileCompletion: 60,
          professionalSummary: `RPL Candidate registered for ${guaranteedTrade} evaluation.`
        }
      });
    } else {
      workerProfile = await prisma.workerProfile.update({
        where: { id: workerProfile.id },
        data: {
          name: name?.trim() || workerProfile.name,
          phone: (typeof phone === 'string' && phone.trim().length > 0) ? phone.trim() : workerProfile.phone,
          trade: trade?.trim() || workerProfile.trade,
          location: (typeof location === 'string' && location.trim().length > 0) ? location.trim() : workerProfile.location
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
          name: guaranteedName,
          email: user.email,
          phone: guaranteedPhone,
          tradeSpecialization: guaranteedTrade,
          organization: guaranteedOrganization,
          nsqfCertifiedLevel: 5,
          isAvailable: true
        }
      });
    } else {
      assessorProfile = await prisma.assessorProfile.update({
        where: { id: assessorProfile.id },
        data: {
          name: name?.trim() || assessorProfile.name,
          phone: (typeof phone === 'string' && phone.trim().length > 0) ? phone.trim() : assessorProfile.phone,
          tradeSpecialization: trade?.trim() || assessorProfile.tradeSpecialization,
          organization: organization?.trim() || assessorProfile.organization
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
