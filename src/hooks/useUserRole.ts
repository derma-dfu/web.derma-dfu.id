import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'user' | null;

export const useUserRole = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = useCallback(async (userId: string) => {
    console.log('Fetching user role for:', userId);
    
    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Role fetch timeout - defaulting to user');
      setRole('user');
      setIsLoading(false);
    }, 5000);

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      clearTimeout(timeoutId);
      console.log('User role fetch result:', { data, error });

      if (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } else {
        const userRole = (data?.role as UserRole) ?? 'user';
        console.log('Setting role to:', userRole);
        setRole(userRole);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Exception fetching user role:', error);
      setRole('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

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
  }, [fetchUserRole]);

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
