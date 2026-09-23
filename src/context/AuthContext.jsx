import { useState } from 'react';
import { AuthContext } from './auth-context';
import { AUTH_STORAGE_KEY, DEFAULT_SUPER_ADMIN, DEMO_CREDENTIALS } from '../data/mockAuth';

export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return null;
  });

  const [isLoading] = useState(false);

  const login = async (email, password, rememberMe = true) => {
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid administrative email address.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isDemoEmail = normalizedEmail === DEMO_CREDENTIALS.email.toLowerCase();

    if (isDemoEmail && password !== DEMO_CREDENTIALS.password) {
      throw new Error('Invalid Super Admin credentials. Please check your password.');
    }

    const authPayload = {
      ...DEFAULT_SUPER_ADMIN,
      email: normalizedEmail,
      name: isDemoEmail ? DEFAULT_SUPER_ADMIN.name : 'Super Admin',
      loggedInAt: new Date().toISOString(),
    };

    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authPayload));
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authPayload));
    }

    setUser(authPayload);
    return authPayload;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
