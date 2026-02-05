'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        console.log('Session check response:', data);
        if (data?.data?.user) {
          setUser(data?.data?.user);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data?.data?.user);
        return { success: true, user: data?.data?.user };
      }
      setError(data.error);
      return { success: false, error: data.error };
    } catch (error) {
      const errorMsg = 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const signup = async (userData) => {
    console.log('Signup data:', userData);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      console.log('Signup response data:', data);

      if (res.ok) {
        setUser(data?.data?.user);
        return { success: true, user: data?.data?.user };
      }
      setError(data.error);
      return { success: false, error: data.error };
    } catch (error) {
      const errorMsg = 'Signup failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'student':
        return '/dashboard/student';
      case 'teacher':
        return '/dashboard/teacher';
      case 'admin':
        return '/dashboard/admin';
      case 'helper':
        return '/dashboard/helper';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        getDashboardPath,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
