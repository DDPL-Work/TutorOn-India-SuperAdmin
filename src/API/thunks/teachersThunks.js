import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

export const fetchTeachers = createAsyncThunk(
  'teachers/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.verification_status) queryParams.append('verification_status', params.verification_status);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const response = await fetchApi(`/admin/teachers/?${queryParams.toString()}`);
      
      // Sometimes APIs wrap in success/data, let's handle the response
      if (response.success !== undefined) {
          if (response.success) return response;
          return rejectWithValue(response.message || 'Failed to fetch teachers');
      }
      return response; // if it returns directly
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTeacherById = createAsyncThunk(
  'teachers/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/teachers/${id}/`);
      if (response.success !== undefined) {
        if (response.success) return response.data;
        return rejectWithValue(response.message || 'Failed to fetch teacher details');
      }
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveTeacher = createAsyncThunk(
  'teachers/approve',
  async ({ id, admin_notes }, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/teacher-verifications/${id}/approve/`, {
        method: 'POST',
        body: JSON.stringify({ admin_notes }),
      });
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to approve teacher');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectTeacher = createAsyncThunk(
  'teachers/reject',
  async ({ id, rejection_reason, admin_note }, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/teacher-verifications/${id}/reject/`, {
        method: 'POST',
        body: JSON.stringify({ rejection_reason, admin_note }),
      });
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to reject teacher');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  'teachers/delete',
  async (id, { rejectWithValue }) => {
    try {
      await fetchApi(`/admin/teachers/${id}/`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
