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
        if (data.user) {
          const userRole = (data.user.role as UserRoleType) || 'WORKER';
          setRole(userRole);
          const p = data.profile;
          setProfile({
            id: data.user.id,
            name: p?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email,
            role: userRole,
            phone: p?.phone,
            trade: p?.trade,
            bio: p?.bio,
            organization: p?.organization,
            specialization: p?.tradeSpecialization,
            assessorRegNumber: p?.assessorRegNumber,
            yearsExperience: p?.yearsOfExperience
          });
          return userRole;
        }
      }
    } catch (err) {
      console.error('[AuthContext] Error fetching server profile:', err);
    }
    return null;
  };

  // Sync profile with database via backend API
  const syncServerProfile = async (accessToken: string, profileData: SignUpProfileData): Promise<UserRoleType | null> => {
    try {
      const res = await fetch('/api/auth/sync-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const userRole = (data.user.role as UserRoleType) || profileData.role;
          setRole(userRole);
          const p = data.profile;
          setProfile({
            id: data.user.id,
            name: p?.name || profileData.name,
            email: data.user.email,
            role: userRole,
            phone: p?.phone || profileData.phone,
            trade: p?.trade || profileData.trade,
            bio: p?.bio || profileData.bio,
            organization: p?.organization || profileData.organization,
            specialization: p?.tradeSpecialization || profileData.specialization,
            assessorRegNumber: p?.assessorRegNumber,
            yearsExperience: p?.yearsOfExperience || profileData.yearsExperience
          });
          return userRole;
        }
      }
    } catch (err) {
      console.error('[AuthContext] Error syncing profile:', err);
    }
    return null;
  };

  // Initial session check & auth state change listener
  useEffect(() => {
    let mounted = true;

    // Check if demo user is stored in localStorage
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

    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.access_token) {
        fetchServerProfile(currentSession.access_token).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.access_token) {
        await fetchServerProfile(newSession.access_token);
      } else if (event === 'SIGNED_OUT') {
        setRole(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; role?: UserRoleType; error?: string }> => {
    setError(null);
    if (!supabase) {
      setError('Supabase client not initialized. Check your environment variables.');
      return { success: false, error: 'Supabase client not configured.' };
    }

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
        const serverRole = await fetchServerProfile(data.session.access_token);
        return { success: true, role: serverRole || 'WORKER' };
      }

      return { success: true, role: 'WORKER' };
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signUpWithEmail = async (email: string, password: string, profileData: SignUpProfileData): Promise<{ success: boolean; role?: UserRoleType; error?: string }> => {
    setError(null);
    if (!supabase) {
      setError('Supabase client not initialized.');
      return { success: false, error: 'Supabase client not configured.' };
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: profileData.name,
            role: profileData.role
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return { success: false, error: signUpError.message };
      }

      // If session is immediately available (or autoconfirmed)
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        const syncedRole = await syncServerProfile(data.session.access_token, profileData);
        return { success: true, role: syncedRole || profileData.role };
      }

      // If email confirmation is required by Supabase project settings
      if (data.user && !data.session) {
        return {
          success: true,
          role: profileData.role,
          error: 'Account created! Please check your email to confirm your account, then log in.'
        };
      }

      return { success: true, role: profileData.role };
    } catch (err: any) {
      const msg = err?.message || 'Signup failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    if (!supabase) {
      setError('Supabase client not initialized.');
      return;
    }
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (oauthError) {
      setError(oauthError.message);
    }
  };

  const demoSignIn = async (targetRole: 'WORKER' | 'ASSESSOR') => {
    setError(null);
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
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (session?.access_token) {
      await fetchServerProfile(session.access_token);
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
