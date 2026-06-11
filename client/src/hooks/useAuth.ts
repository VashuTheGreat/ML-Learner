import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check local storage or any state manager where token is stored
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  return {
    isAuthenticated,
    isLoading: isAuthenticated === null,
  };
};
