/**
 * Force logout - immediately clear auth and reload
 * Use this as emergency logout when normal logout doesn't work
 */
export const forceLogout = () => {
  console.log('Force logout initiated - clearing auth data immediately');
  
  // Clear auth-related items from localStorage synchronously
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('supabase.auth')) {
      keysToRemove.push(key);
    }
  }
  
  console.log('Removing auth keys:', keysToRemove);
  keysToRemove.forEach(key => {
    console.log('Removing key:', key);
    localStorage.removeItem(key);
  });
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  console.log('Force logout complete - reloading now');
  
  // Force immediate reload
  window.location.replace('/');
};
