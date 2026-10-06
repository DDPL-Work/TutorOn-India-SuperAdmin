import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/dashboard/');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch dashboard metrics');
    }
  }
);

export const fetchDashboardActivity = createAsyncThunk(
  'dashboard/fetchActivity',
  async (range = '30d', { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/dashboard/activity/', { range });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch activity feed');
    }
  }
);

export const searchGlobal = createAsyncThunk(
  'dashboard/searchGlobal',
  async (q, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/dashboard/search/', { q });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Search failed');
    }
  }
);

export const sendClassReminders = createAsyncThunk(
  'dashboard/sendClassReminders',
  async ({ window_minutes = 60 }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/admin/classes/send-reminders/', { window_minutes });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to trigger reminders');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    metrics: null,
    activity: null,
    recentActivity: [],
    searchResults: null,
    isSearching: false,
    isLoading: false,
    isActivityLoading: false,
    isRemindersLoading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Metrics
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload;
        if (action.payload?.recent_activity) {
          state.recentActivity = action.payload.recent_activity;
        }
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Dashboard Activity
      .addCase(fetchDashboardActivity.pending, (state) => {
        state.isActivityLoading = true;
      })
      .addCase(fetchDashboardActivity.fulfilled, (state, action) => {
        state.isActivityLoading = false;
        state.activity = action.payload;
      })
      .addCase(fetchDashboardActivity.rejected, (state) => {
        state.isActivityLoading = false;
      })
      // Global Search
      .addCase(searchGlobal.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchGlobal.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchGlobal.rejected, (state) => {
        state.isSearching = false;
      })
      // Reminders
      .addCase(sendClassReminders.pending, (state) => {
        state.isRemindersLoading = true;
      })
      .addCase(sendClassReminders.fulfilled, (state) => {
        state.isRemindersLoading = false;
      })
      .addCase(sendClassReminders.rejected, (state) => {
        state.isRemindersLoading = false;
      });
  },
});

export const { clearSearchResults } = dashboardSlice.actions;
export default dashboardSlice.reducer;
