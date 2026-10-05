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

/**
 * Returns Google OAuth client configuration from environment variables.
 */
export function getGoogleOAuthClientConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || '';

  return {
    clientId,
    clientSecret,
    callbackUrl,
    isConfigured: Boolean(clientId && clientSecret)
  };
}

/**
 * Generates the official Google OAuth 2.0 authorization URL.
 */
export function getGoogleAuthUrl(options: { redirectUri?: string; state?: string } = {}): string {
  const config = getGoogleOAuthClientConfig();
  if (!config.clientId) {
    throw new Error('Google OAuth is not configured. GOOGLE_CLIENT_ID is missing.');
  }

  const redirectUri = options.redirectUri || config.callbackUrl;
  if (!redirectUri) {
    throw new Error('Google OAuth redirect URI is required.');
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    ...(options.state ? { state: options.state } : {})
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface GoogleTokenInfo {
  sub: string;
  email: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  aud?: string;
}

/**
 * Exchanges a Google authorization code for tokens.
 */
export async function exchangeGoogleAuthCode(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
  const config = getGoogleOAuthClientConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new Error('Google OAuth client credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are missing.');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }).toString()
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, string>;
    throw new Error(errorData.error_description || errorData.error || 'Failed to exchange Google authorization code.');
  }

  return (await response.json()) as GoogleTokenResponse;
}

/**
 * Fetches the verified user profile from Google using an access token.
 */
export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile from Google.');
  }

  return (await response.json()) as GoogleUserInfo;
}

/**
 * Verifies a Google ID token using Google's tokeninfo endpoint.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo> {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) {
    throw new Error('Invalid or expired Google ID token.');
  }

  const data = (await response.json()) as GoogleTokenInfo;
  const config = getGoogleOAuthClientConfig();
  if (config.clientId && data.aud !== config.clientId) {
    throw new Error('Google ID token audience mismatch.');
  }

  return data;
}

/**
 * Synchronizes or creates a user account from verified Google credentials.
 * Implements account linking and assigns safe default role (WORKER).
 */
export async function handleGoogleUserAuth(googleProfile: {
  googleId?: string;
  email: string;
  name?: string;
  picture?: string;
}) {
  const { googleId, email, name, picture } = googleProfile;

  if (!email || !email.includes('@')) {
    const err: any = new Error('Valid verified email is required from Google.');
    err.status = 400;
    throw err;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Look up existing user by googleId or email
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(googleId ? [{ googleId }] : []),
        { email: normalizedEmail }
      ]
    },
    include: {
      workerProfile: true,
      assessorProfile: true
    }
  });

  if (user) {
    // 2. Existing account linking: update googleId if not linked yet
    if (googleId && !user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
        include: {
          workerProfile: true,
          assessorProfile: true
        }
      });
    }

    // Update avatarUrl in worker profile if available and not set
    if (user.role === 'WORKER' && user.workerProfile && picture && !user.workerProfile.avatarUrl) {
      const updatedWorker = await prisma.workerProfile.update({
        where: { id: user.workerProfile.id },
        data: { avatarUrl: picture }
      });
      user.workerProfile = updatedWorker;
    }
  } else {
    // 3. New user registration: SAFE DEFAULT ROLE is WORKER (Never Assessor or Admin)
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        googleId: googleId || undefined,
        role: 'WORKER'
      },
      include: {
        workerProfile: true,
        assessorProfile: true
      }
    });

    const displayName = name?.trim() || normalizedEmail.split('@')[0] || 'Google User';

    const workerProfile = await prisma.workerProfile.create({
      data: {
        userId: user.id,
        name: displayName,
        email: normalizedEmail,
        avatarUrl: picture || undefined,
        trade: 'General Technical',
        yearsOfExperience: 3.0,
        profileCompletion: 60,
        professionalSummary: `Candidate account created via Google Sign-In.`
      }
    });

    user.workerProfile = workerProfile;
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
