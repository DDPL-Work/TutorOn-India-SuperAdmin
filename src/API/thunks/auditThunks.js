import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

export const fetchAuditLogs = createAsyncThunk(
  'audit/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const response = await fetchApi(`/admin/audit-logs/?${queryParams.toString()}`);
      if (response.success !== undefined) {
        if (response.success) return response;
        return rejectWithValue(response.message || 'Failed to fetch audit logs');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAuditLogDetails = createAsyncThunk(
  'audit/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/audit-logs/${id}/`);
      if (response.success !== undefined) {
        if (response.success) return response.data || response;
        return rejectWithValue(response.message || 'Failed to fetch audit log details');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
