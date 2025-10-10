import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'user' | null;

export const useUserRole = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingRoleRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const getUserRole = async (userId: string) => {
      // Prevent multiple simultaneous fetches for same user
      if (fetchingRoleRef.current && currentUserIdRef.current === userId) {
        console.log('Role fetch already in progress for this user, skipping...');
        return;
      }

      fetchingRoleRef.current = true;
      currentUserIdRef.current = userId;
      console.log('Getting role for user:', userId);

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        if (!mounted) {
          fetchingRoleRef.current = false;
          return;
        }

        if (error) {
          console.error('Role query error:', error);
          setRole('user');
        } else {
          console.log('Role fetched:', data?.role || 'user');
          setRole((data?.role as UserRole) || 'user');
        }
        setIsLoading(false);
        fetchingRoleRef.current = false;
      } catch (err) {
        if (mounted) {
          console.error('Role fetch exception:', err);
          setRole('user');
          setIsLoading(false);
          fetchingRoleRef.current = false;
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
          fetchingRoleRef.current = false;
          currentUserIdRef.current = null;
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) {
          setUser(null);
          setRole(null);
          setIsLoading(false);
          fetchingRoleRef.current = false;
          currentUserIdRef.current = null;
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
          // Only fetch role if not already fetching or user changed
          if (currentUserIdRef.current !== session.user.id) {
            setIsLoading(true);
            await getUserRole(session.user.id);
          }
        } else {
          setUser(null);
          setRole(null);
          setIsLoading(false);
          fetchingRoleRef.current = false;
          currentUserIdRef.current = null;
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
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
