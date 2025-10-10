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
    let timeoutId: NodeJS.Timeout;

    const getUserRole = async (userId: string) => {
      console.log('Getting role for user:', userId);
      
      // Safety timeout
      timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn('Role query timeout, defaulting to user');
          setRole('user');
          setIsLoading(false);
        }
      }, 3000);

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        if (!mounted) return;
        
        clearTimeout(timeoutId);

        if (error) {
          console.error('Role query error:', error);
          setRole('user');
        } else {
          console.log('Role fetched:', data?.role || 'user');
          setRole((data?.role as UserRole) || 'user');
        }
        setIsLoading(false);
      } catch (err) {
        if (mounted) {
          console.error('Role fetch exception:', err);
          clearTimeout(timeoutId);
          setRole('user');
          setIsLoading(false);
        }
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        console.log('Init session:', session?.user?.email || 'none');
        
        if (session?.user) {
          setUser(session.user);
          await getUserRole(session.user.id);
        } else {
          setUser(null);
          setRole(null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) {
          setUser(null);
          setRole(null);
          setIsLoading(false);
        }
      }
    };

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth changed:', event, session?.user?.email || 'none');

        if (session?.user) {
          setUser(session.user);
          setIsLoading(true);
          await getUserRole(session.user.id);
        } else {
          setUser(null);
          setRole(null);
          setIsLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []); // Empty deps - run once

  return {
    user,
    role,
    isAdmin: role === 'admin',
    isAuthenticated: !!user,
    isLoading,
  };
};
