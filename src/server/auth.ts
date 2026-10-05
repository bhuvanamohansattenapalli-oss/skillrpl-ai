import crypto from 'node:crypto';
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
 * Securely hashes a plain-text password with random salt and PBKDF2.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Validates a candidate password against a stored PBKDF2 hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch {
    return false;
  }
}

const SESSION_SECRET = process.env.JWT_SECRET || process.env.DATABASE_URL || 'skillrpl-ai-production-session-secret-2026';

/**
 * Creates an HMAC-SHA256 signed session token (7-day validity).
 */
export function createSessionToken(payload: { userId: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000)
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 session token.
 */
export function verifySessionToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(`${header}.${body}`).digest('base64url');
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Validates either a local HMAC session token or a Supabase JWT token.
 */
export async function verifyAuthToken(token: string): Promise<{ id: string; email?: string; role?: string; user_metadata?: Record<string, any> }> {
  // 1. Check local session token
  const localSession = verifySessionToken(token);
  if (localSession) {
    return { id: localSession.userId, email: localSession.email, role: localSession.role };
  }

  // 2. Fall back to Supabase JWT verification
  const supabaseUser = await verifySupabaseToken(token);
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || undefined,
    role: (supabaseUser.user_metadata?.role as string) || undefined,
    user_metadata: supabaseUser.user_metadata
  };
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

/**
 * Registers a new user with email, hashed password, and initial profile.
 */
export async function registerUserWithCredentials(data: {
  email: string;
  password?: string;
  role: 'WORKER' | 'ASSESSOR';
  name: string;
  phone?: string;
  trade?: string;
  yearsExperience?: number;
  bio?: string;
  organization?: string;
  specialization?: string;
  assessorRegNumber?: string;
}) {
  const { email, password, role, name, phone, trade, yearsExperience, bio, organization, specialization, assessorRegNumber } = data;

  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address.');
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    const err: any = new Error('An account with this email address already exists. Please sign in instead.');
    err.status = 400;
    throw err;
  }

  const passwordHash = password ? hashPassword(password) : undefined;

  // Create User
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      role: role === 'ASSESSOR' ? 'ASSESSOR' : 'WORKER',
      passwordHash
    }
  });

  let profile: any = null;

  if (role === 'WORKER') {
    profile = await prisma.workerProfile.create({
      data: {
        userId: user.id,
        name: name?.trim() || 'Worker Candidate',
        email: user.email,
        phone: phone?.trim(),
        trade: trade?.trim() || 'General Technical',
        yearsOfExperience: typeof yearsExperience === 'number' ? yearsExperience : 3,
        bio: bio?.trim(),
        profileCompletion: 70
      }
    });
  } else {
    profile = await prisma.assessorProfile.create({
      data: {
        userId: user.id,
        name: name?.trim() || 'Accredited Assessor',
        email: user.email,
        phone: phone?.trim(),
        tradeSpecialization: specialization?.trim() || trade?.trim() || 'Technical & Construction Trades',
        organization: organization?.trim() || 'National Skill Development Agency / SSC',
        assessorRegNumber: assessorRegNumber?.trim() || `NCVET-ASS-${Math.floor(1000 + Math.random() * 9000)}`,
        nsqfCertifiedLevel: 5,
        isAvailable: true
      }
    });
  }

  const token = createSessionToken({ userId: user.id, email: user.email, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    },
    profile,
    token
  };
}

/**
 * Authenticates a user with email and password against stored database credentials.
 */
export async function loginUserWithCredentials(credentials: { email: string; password?: string }) {
  const { email, password } = credentials;

  if (!email || typeof email !== 'string') {
    const err: any = new Error('Email is required.');
    err.status = 400;
    throw err;
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findFirst({
    where: { email: normalizedEmail },
    include: { workerProfile: true, assessorProfile: true }
  });

  if (!user) {
    const err: any = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  // If passwordHash exists on the user, verify it
  if (user.passwordHash) {
    if (!password) {
      const err: any = new Error('Password is required.');
      err.status = 400;
      throw err;
    }
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      const err: any = new Error('Invalid email or password.');
      err.status = 401;
      throw err;
    }
  } else if (password) {
    // If user existed without passwordHash (e.g., initial seed), set the password on first login
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(password) }
    });
  }

  const profile = user.role === 'ASSESSOR' ? user.assessorProfile : user.workerProfile;
  const token = createSessionToken({ userId: user.id, email: user.email, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    },
    profile,
    token
  };
}
