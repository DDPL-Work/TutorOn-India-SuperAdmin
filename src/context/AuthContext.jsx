import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from './auth-context';
import { loginAdmin, logout as logoutAction, setUser } from '../store/slices/authSlice';
import { AUTH_STORAGE_KEY } from '../data/mockAuth';
import { clearAuthTokens } from '../services/api';

export { AuthContext };

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);
  const reduxLoading = useSelector((state) => state.auth.isLoading);

  const [user, setLocalUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return null;
  });

  useEffect(() => {
    if (reduxUser) {
      setLocalUser(reduxUser);
    }
  }, [reduxUser]);

  const login = async (email, password, rememberMe = true) => {
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid administrative email address.');
    }

    const resultAction = await dispatch(loginAdmin({ email: email.trim(), password, rememberMe }));
    if (loginAdmin.fulfilled.match(resultAction)) {
      setLocalUser(resultAction.payload.user);
      return resultAction.payload.user;
    } else {
      throw new Error(resultAction.payload || 'Authentication failed. Please verify credentials.');
    }
  };

  const logout = () => {
    clearAuthTokens();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    dispatch(logoutAction());
    setLocalUser(null);
  };

  const value = {
    user: user || reduxUser,
    isAuthenticated: Boolean(user || reduxUser),
    isLoading: reduxLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

