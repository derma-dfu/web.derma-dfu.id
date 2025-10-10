import { supabase } from '@/integrations/supabase/client';

/**
 * Force logout by clearing auth data while preserving Supabase config
 * Use this as emergency logout when normal logout doesn't work
 */
export const forceLogout = async () => {
  console.log('Force logout initiated');
  
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear only auth-related items from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('supabase.auth.token'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    console.log('Force logout complete, reloading...');
    
    // Force reload to clear all state
    window.location.href = '/';
  } catch (error) {
    console.error('Error during force logout:', error);
    // Force reload anyway but preserve Supabase config
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('supabase.auth.token'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
    window.location.href = '/';
  }
};
