import { createSlice } from '@reduxjs/toolkit';
import { fetchDashboardStats, fetchDashboardActivity } from '../thunks/dashboardThunks';

const initialState = {
  stats: null,
  activity: [],
  isLoadingStats: false,
  isLoadingActivity: false,
  statsError: null,
  activityError: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoadingStats = true;
        state.statsError = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.statsError = action.payload;
      })
      // Dashboard Activity
      .addCase(fetchDashboardActivity.pending, (state) => {
        state.isLoadingActivity = true;
        state.activityError = null;
      })
      .addCase(fetchDashboardActivity.fulfilled, (state, action) => {
        state.isLoadingActivity = false;
        state.activity = action.payload;
      })
      .addCase(fetchDashboardActivity.rejected, (state, action) => {
        state.isLoadingActivity = false;
        state.activityError = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
