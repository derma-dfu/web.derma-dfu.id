import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'user' | null;

export const useUserRole = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUserRole = async (userId: string) => {
      console.log('Fetching user role for:', userId);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        console.log('User role fetch result:', { data, error });

        if (!mounted) return;

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user');
          setIsLoading(false);
        } else {
          const userRole = data?.role as UserRole ?? 'user';
          console.log('Setting role to:', userRole);
          setRole(userRole);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Exception fetching user role:', error);
        if (mounted) {
          setRole('user');
          setIsLoading(false);
        }
      }
    };

    // Get initial session first
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        console.log('Initial session:', session?.user?.email || 'No session');
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setRole(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setRole(null);
          setIsLoading(false);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email || 'No session');
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setRole(null);
          setIsLoading(false);
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = role === 'admin';
  const isAuthenticated = !!user;

  return {
    user,
    role,
    isAdmin,
    isAuthenticated,
    isLoading,
  };
};
