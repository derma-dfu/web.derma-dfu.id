import { supabase } from '@/integrations/supabase/client';

/**
 * Force logout - immediately clear auth and reload
 * Use this as emergency logout when normal logout doesn't work
 */
export const forceLogout = () => {
  console.log('Force logout initiated - signing out and clearing auth data');
  
  // Start signOut but don't wait for it
  supabase.auth.signOut().catch(err => console.log('SignOut error (ignored):', err));
  
  // Immediately clear ALL auth-related items from localStorage
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('supabase.auth') || 
      key.includes('sb-') ||
      key.startsWith('supabase-auth')
    )) {
      keysToRemove.push(key);
    }
  }
  
  console.log('Removing auth keys:', keysToRemove);
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear all cookies (backup)
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  console.log('Force logout complete - reloading immediately');
  
  // Use setTimeout 0 to ensure storage is cleared before reload
  setTimeout(() => {
    window.location.replace('/');
  }, 0);
};
