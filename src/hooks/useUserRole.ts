import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'user' | null;

export const useUserRole = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        if (session?.user) {
          // Basic role check - can be expanded to check database or metadata
          // For now, checks if email contains 'admin' or matches specific UID if needed
          // Or simply defaults to 'user' as per previous logic
          const userRole = (session.user.user_metadata?.role as UserRole) || 'user';
          setRole(userRole);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const userRole = (session.user.user_metadata?.role as UserRole) || 'user';
        setRole(userRole);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    userId: user?.id || null,
    role,
    isAdmin: role === 'admin',
    isAuthenticated: !!user,
    isLoading: loading,
  };
};
