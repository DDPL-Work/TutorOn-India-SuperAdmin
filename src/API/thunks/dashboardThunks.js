import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/admin/dashboard/');
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch dashboard stats');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDashboardActivity = createAsyncThunk(
  'dashboard/fetchActivity',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/admin/dashboard/activity/');
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch dashboard activity');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
