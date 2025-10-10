import { supabase } from '@/integrations/supabase/client';

/**
 * Force logout by clearing all auth data
 * Use this as emergency logout when normal logout doesn't work
 */
export const forceLogout = async () => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Force reload to clear all state
    window.location.href = '/';
  } catch (error) {
    console.error('Error during force logout:', error);
    // Force reload anyway
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
};
