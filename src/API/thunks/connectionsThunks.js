import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

export const fetchConnections = createAsyncThunk(
  'connections/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const response = await fetchApi(`/admin/connections/?${queryParams.toString()}`);
      if (response.success !== undefined) {
          if (response.success) return response;
          return rejectWithValue(response.message || 'Failed to fetch connections');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveConnection = createAsyncThunk(
  'connections/approve',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/connections/${id}/approve/`, {
        method: 'POST',
      });
      if (response.success) return response.data;
      return rejectWithValue(response.message || 'Failed to approve connection');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
