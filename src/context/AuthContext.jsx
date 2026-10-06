import { useState } from 'react';
import { AuthContext } from './auth-context';
import { fetchApi } from '../API/apiClient';

const AUTH_STORAGE_KEY = 'tutoron_super_admin_auth';

export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user) {
          parsed.user.name = `${parsed.user.first_name || ''} ${parsed.user.last_name || ''}`.trim() || parsed.user.email;
          return parsed.user;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
      // localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password, rememberMe = true) => {
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    setIsLoading(true);
    try {
      const data = await fetchApi('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (data.success && data.data) {
        const authPayload = data.data; // { access, refresh, user }
        if (rememberMe) {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authPayload));
        } else {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authPayload));
        }
        if (authPayload.user) {
          authPayload.user.name = `${authPayload.user.first_name || ''} ${authPayload.user.last_name || ''}`.trim() || authPayload.user.email;
          setUser(authPayload.user);
        } else {
          setUser(authPayload);
        }
        return authPayload;
      } else {
        throw new Error(data.message || 'Login failed.');
      }
    } catch (e) {
      throw new Error(e.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // localStorage.removeItem(AUTH_STORAGE_KEY);
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
