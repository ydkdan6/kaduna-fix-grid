export const cleanupAuthState = () => {
  try {
    // Remove specific known keys
    localStorage.removeItem('supabase.auth.token');

    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        try {
          localStorage.removeItem(key);
        } catch {}
      }
    });

    // Remove from sessionStorage as well
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          try {
            sessionStorage.removeItem(key);
          } catch {}
        }
      });
    } catch {}
  } catch {}
};
