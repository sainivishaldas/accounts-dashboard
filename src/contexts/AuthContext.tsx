import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  isViewer: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Fetch user role from database
  const fetchUserRole = async (userId: string) => {
    try {
      console.log('🔍 Fetching role for user:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user role:', error);
        setUserRole('viewer'); // Default to viewer on error
        return;
      }

      console.log('✅ User role fetched:', data?.role);
      setUserRole(data?.role ?? 'viewer');
    } catch (error) {
      console.error('❌ Error fetching user role:', error);
      setUserRole('viewer');
    }
  };

  useEffect(() => {
    // Get initial session
    console.log('🚀 AuthContext: Initializing...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📊 Initial session:', session?.user?.email || 'No user');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 User found, fetching role...');
        fetchUserRole(session.user.id);
      } else {
        console.log('❌ No user session found');
        setUserRole(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('🔄 Auth state changed:', _event, session?.user?.email || 'No user');
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('👤 User authenticated, fetching role...');
          fetchUserRole(session.user.id);
        } else {
          console.log('❌ User logged out');
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  const isAdmin = userRole === 'admin';
  const isViewer = userRole === 'viewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userRole,
        isAdmin,
        isViewer,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
