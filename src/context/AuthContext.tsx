import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';

export type UserRoleType = 'WORKER' | 'ASSESSOR' | 'ADMIN';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  phone?: string;
  trade?: string;
  location?: string;
  bio?: string;
  organization?: string;
  specialization?: string;
  assessorRegNumber?: string;
  yearsExperience?: number;
}

export interface SignUpProfileData {
  role: 'WORKER' | 'ASSESSOR';
  name: string;
  phone?: string;
  trade?: string;
  yearsExperience?: number;
  organization?: string;
  specialization?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRoleType | null;
  profile: UserProfileData | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; role?: UserRoleType; error?: string }>;
  signUpWithEmail: (email: string, password: string, profileData: SignUpProfileData) => Promise<{ success: boolean; role?: UserRoleType; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  demoSignIn: (role: 'WORKER' | 'ASSESSOR') => Promise<{ success: boolean; role: UserRoleType }>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRoleType | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  // Helper to fetch server-verified role and profile from Prisma DB
  const fetchServerProfile = async (accessToken: string): Promise<UserRoleType | null> => {
    try {
      const res = await fetch('/api/auth/user-role', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const userData = data.user || data.data;
        const profileData = data.profile || data.data?.profile;
        if (userData) {
          const userRole = (userData.role as UserRoleType) || 'WORKER';
          setRole(userRole);
          setProfile({
            id: userData.id,
            name: profileData?.name || userData.email?.split('@')[0] || 'User',
            email: userData.email,
            role: userRole,
            phone: profileData?.phone,
            trade: profileData?.trade,
            bio: profileData?.bio,
            organization: profileData?.organization,
            specialization: profileData?.tradeSpecialization || profileData?.specialization,
            assessorRegNumber: profileData?.assessorRegNumber,
            yearsExperience: profileData?.yearsOfExperience || profileData?.yearsExperience
          });
          return userRole;
        }
      }
    } catch (err) {
      console.error('[AuthContext] Error fetching server profile:', err);
    }
    return null;
  };

  // Initial session check & auth state change listener
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      // 0. Check URL params for Google OAuth callback result
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlAuthToken = urlParams.get('auth_token');
        const urlAuthError = urlParams.get('auth_error');

        if (urlAuthError) {
          setError(decodeURIComponent(urlAuthError));
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlAuthToken) {
          localStorage.setItem('skillrpl_auth_token', urlAuthToken);
          localStorage.removeItem('skillrpl_demo_user');
          window.history.replaceState({}, document.title, window.location.pathname);
          const userRole = await fetchServerProfile(urlAuthToken);
          if (userRole && mounted) {
            setSession({ access_token: urlAuthToken } as any);
            setLoading(false);
            return;
          }
        }
      }

      // 1. Check if demo user is stored in localStorage
      const savedDemoUser = localStorage.getItem('skillrpl_demo_user');
      if (savedDemoUser) {
        try {
          const parsed = JSON.parse(savedDemoUser);
          if (parsed?.role) {
            setRole(parsed.role);
            setProfile(parsed);
            setUser({ id: parsed.id, email: parsed.email } as any);
            setLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem('skillrpl_demo_user');
        }
      }

      // 2. Check if local JWT / session token is stored
      const savedToken = localStorage.getItem('skillrpl_auth_token');
      const savedUserStr = localStorage.getItem('skillrpl_auth_user');
      if (savedToken) {
        try {
          const res = await fetch('/api/auth/user-role', {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            const u = data.user || data.data;
            const p = data.profile || data.data?.profile;
            if (u && mounted) {
              const uRole = (u.role as UserRoleType) || 'WORKER';
              setRole(uRole);
              setUser({ id: u.id, email: u.email } as any);
              setSession({ access_token: savedToken } as any);
              setProfile({
                id: u.id,
                name: p?.name || u.email?.split('@')[0] || 'User',
                email: u.email,
                role: uRole,
                phone: p?.phone,
                trade: p?.trade,
                bio: p?.bio,
                organization: p?.organization,
                specialization: p?.tradeSpecialization,
                assessorRegNumber: p?.assessorRegNumber,
                yearsExperience: p?.yearsOfExperience
              });
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('[AuthContext] Saved token validation failed:', err);
        }
      }

      // Fallback: Restore cached user data if available
      if (savedUserStr && mounted) {
        try {
          const parsed = JSON.parse(savedUserStr);
          if (parsed?.user) {
            setUser(parsed.user);
            setRole(parsed.role || parsed.user.role);
            setProfile(parsed.profile);
            setLoading(false);
            return;
          }
        } catch {}
      }

      // 3. Check Supabase session if available
      if (supabase) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession && mounted) {
            setSession(currentSession);
            setUser(currentSession.user ?? null);
            if (currentSession.access_token) {
              // Sync Google user with backend Prisma DB if user came from Supabase OAuth
              if (currentSession.user?.app_metadata?.provider === 'google' || currentSession.user?.email) {
                try {
                  await fetch('/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      profile: {
                        id: currentSession.user.id,
                        email: currentSession.user.email,
                        name: currentSession.user.user_metadata?.full_name || currentSession.user.user_metadata?.name,
                        picture: currentSession.user.user_metadata?.avatar_url || currentSession.user.user_metadata?.picture
                      }
                    })
                  });
                } catch (syncErr) {
                  console.warn('[AuthContext] Supabase Google sync warning:', syncErr);
                }
              }
              await fetchServerProfile(currentSession.access_token);
            }
          }
        } catch {}
      }

      if (mounted) setLoading(false);
    };

    restoreSession();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user ?? null);
          if (newSession.access_token) {
            await fetchServerProfile(newSession.access_token);
          }
        } else if (event === 'SIGNED_OUT') {
          if (!localStorage.getItem('skillrpl_auth_token')) {
            setRole(null);
            setProfile(null);
            setUser(null);
            setSession(null);
          }
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; role?: UserRoleType; error?: string }> => {
    setError(null);

    // 1. Authenticate with backend database endpoint first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        const userRole = (data.user.role as UserRoleType) || 'WORKER';
        const userProfile: UserProfileData = {
          id: data.user.id,
          name: data.profile?.name || data.user.email.split('@')[0],
          email: data.user.email,
          role: userRole,
          phone: data.profile?.phone,
          trade: data.profile?.trade,
          bio: data.profile?.bio,
          organization: data.profile?.organization,
          specialization: data.profile?.tradeSpecialization || data.profile?.specialization,
          assessorRegNumber: data.profile?.assessorRegNumber,
          yearsExperience: data.profile?.yearsOfExperience || data.profile?.yearsExperience
        };

        setRole(userRole);
        setProfile(userProfile);
        setUser({ id: data.user.id, email: data.user.email } as any);
        if (data.token) {
          setSession({ access_token: data.token } as any);
          localStorage.setItem('skillrpl_auth_token', data.token);
        }
        localStorage.setItem('skillrpl_auth_user', JSON.stringify({ user: data.user, profile: userProfile, role: userRole }));
        localStorage.removeItem('skillrpl_demo_user');

        // Optional background Supabase sign in if configured
        if (supabase) {
          try {
            await supabase.auth.signInWithPassword({ email: email.trim(), password });
          } catch {}
        }

        return { success: true, role: userRole };
      }

      if (data.error) {
        setError(data.error);
        return { success: false, error: data.error };
      }
    } catch (apiErr) {
      console.warn('[Auth Login API Error, trying Supabase fallback]', apiErr);
    }

    // 2. Fallback to Supabase Auth if API failed
    if (supabase) {
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (signInError) {
          setError(signInError.message);
          return { success: false, error: signInError.message };
        }

        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          localStorage.setItem('skillrpl_auth_token', data.session.access_token);
          const serverRole = await fetchServerProfile(data.session.access_token);
          return { success: true, role: serverRole || 'WORKER' };
        }
      } catch (sbErr: any) {
        const msg = sbErr?.message || 'Login failed. Please verify credentials.';
        setError(msg);
        return { success: false, error: msg };
      }
    }

    setError('Invalid email or password.');
    return { success: false, error: 'Invalid email or password.' };
  };

  const signUpWithEmail = async (email: string, password: string, profileData: SignUpProfileData): Promise<{ success: boolean; role?: UserRoleType; error?: string }> => {
    setError(null);

    try {
      // 1. Register with backend database API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role: profileData.role,
          name: profileData.name,
          phone: profileData.phone,
          trade: profileData.trade,
          yearsExperience: profileData.yearsExperience,
          bio: profileData.bio,
          organization: profileData.organization,
          specialization: profileData.specialization,
          assessorRegNumber: (profileData as any).assessorRegNumber
        })
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        const userRole = (data.user.role as UserRoleType) || profileData.role;
        const userProfile: UserProfileData = {
          id: data.user.id,
          name: data.profile?.name || profileData.name,
          email: data.user.email,
          role: userRole,
          phone: data.profile?.phone || profileData.phone,
          trade: data.profile?.trade || profileData.trade,
          bio: data.profile?.bio || profileData.bio,
          organization: data.profile?.organization || profileData.organization,
          specialization: data.profile?.tradeSpecialization || profileData.specialization,
          assessorRegNumber: data.profile?.assessorRegNumber,
          yearsExperience: data.profile?.yearsOfExperience || profileData.yearsExperience
        };

        setRole(userRole);
        setProfile(userProfile);
        setUser({ id: data.user.id, email: data.user.email } as any);
        if (data.token) {
          setSession({ access_token: data.token } as any);
          localStorage.setItem('skillrpl_auth_token', data.token);
        }
        localStorage.setItem('skillrpl_auth_user', JSON.stringify({ user: data.user, profile: userProfile, role: userRole }));
        localStorage.removeItem('skillrpl_demo_user');

        // Optional background Supabase sign up
        if (supabase) {
          try {
            await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: { data: { name: profileData.name, role: profileData.role } }
            });
          } catch {}
        }

        return { success: true, role: userRole };
      }

      if (data.error) {
        setError(data.error);
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      const msg = err?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    }

    return { success: false, error: 'Registration could not be completed.' };
  };

  const signInWithGoogle = async () => {
    setError(null);
    
    // 1. Try server-side official Google OAuth 2.0 flow
    try {
      const res = await fetch('/api/auth/google/url');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch (urlErr) {
      console.warn('[AuthContext] Failed to get server Google auth URL:', urlErr);
    }

    // 2. Fallback to Supabase OAuth if available
    if (supabase) {
      try {
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (oauthError) {
          setError(oauthError.message);
        }
        return;
      } catch (sbErr: any) {
        setError(sbErr?.message || 'Failed to initiate Google authentication.');
        return;
      }
    }

    setError('Google Sign-In is not configured. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  };

  const demoSignIn = async (targetRole: 'WORKER' | 'ASSESSOR') => {
    setError(null);
    localStorage.removeItem('skillrpl_auth_token');
    localStorage.removeItem('skillrpl_auth_user');

    const demoData: UserProfileData = targetRole === 'WORKER'
      ? {
          id: 'demo-worker-001',
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@skillrpl.gov.in',
          role: 'WORKER',
          phone: '+91 98765 43210',
          trade: 'Industrial Welding & Metal Fabrication',
          yearsExperience: 8,
          bio: 'Certified SMAW & GMAW welder with 8 years field experience across structural steel, pressure vessels, and pipe fabrication.'
        }
      : {
          id: 'demo-assessor-001',
          name: 'Dr. Vikramaditya Sharma',
          email: 'v.sharma@nsdc.gov.in',
          role: 'ASSESSOR',
          phone: '+91 91234 56789',
          organization: 'National Skill Development Agency / SSC',
          specialization: 'Welding, Fabrication & Heavy Machinery',
          assessorRegNumber: 'ASSESS-NSDC-2024-8842'
        };

    localStorage.setItem('skillrpl_demo_user', JSON.stringify(demoData));
    setRole(targetRole);
    setProfile(demoData);
    setUser({ id: demoData.id, email: demoData.email } as any);
    return { success: true, role: targetRole };
  };

  const signOut = async () => {
    localStorage.removeItem('skillrpl_demo_user');
    localStorage.removeItem('skillrpl_auth_token');
    localStorage.removeItem('skillrpl_auth_user');
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    const token = session?.access_token || localStorage.getItem('skillrpl_auth_token');
    if (token) {
      await fetchServerProfile(token);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        profile,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        demoSignIn,
        refreshProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
