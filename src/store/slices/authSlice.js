import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, setAuthTokens, clearAuthTokens, getAccessToken } from '../../services/api';
import { AUTH_STORAGE_KEY, DEFAULT_SUPER_ADMIN } from '../../data/mockAuth';

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password, rememberMe = true }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/auth/login/', { email, password });
      if (response && response.success) {
        const { access, refresh, user } = response.data;
        setAuthTokens(access, refresh, rememberMe);

        const normalizedUser = {
          id: user.id || DEFAULT_SUPER_ADMIN.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Super Admin',
          email: user.email,
          role: user.role === 'ADMIN' ? 'Super Admin' : user.role,
          roleBadge: 'Super Admin Access',
          avatar: user.profile_photo || '',
          department: 'Platform Governance & Operations',
          lastLogin: new Date().toISOString(),
          permissions: ['ALL'],
          isVerified: user.is_verified,
        };

        if (rememberMe) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
        } else {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
        }

        return { user: normalizedUser, access, refresh };
      }
      return rejectWithValue(response?.message || 'Login failed');
    } catch (err) {
      return rejectWithValue(err.message || 'Authentication failed. Please check credentials.');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/auth/forgot-password/', { email });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to dispatch recovery instructions.');
    }
  }
);

const getInitialUser = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse user session:', e);
  }
  return null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getInitialUser(),
    token: getAccessToken(),
    isAuthenticated: Boolean(getAccessToken() || getInitialUser()),
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      clearAuthTokens();
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
