import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const response = await fetchApi(`/admin/enrollments/?${queryParams.toString()}`);
      if (response.success !== undefined) {
        if (response.success) return response;
        return rejectWithValue(response.message || 'Failed to fetch enrollments');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchEnrollmentById = createAsyncThunk(
  'enrollments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/enrollments/${id}/`);
      if (response.success !== undefined) {
        if (response.success) return response.data;
        return rejectWithValue(response.message || 'Failed to fetch enrollment details');
      }
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveEnrollment = createAsyncThunk(
  'enrollments/approve',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/enrollments/${id}/approve/`, {
        method: 'POST',
      });
      if (response.success) return response.data;
      return rejectWithValue(response.message || 'Failed to approve enrollment');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectEnrollment = createAsyncThunk(
  'enrollments/reject',
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/enrollments/${id}/reject/`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
      if (response.success) return response.data;
      return rejectWithValue(response.message || 'Failed to reject enrollment');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
