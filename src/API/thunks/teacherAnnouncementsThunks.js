import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

export const fetchTeacherAnnouncements = createAsyncThunk(
  'teacherAnnouncements/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.tab && params.tab !== 'all') queryParams.append('tab', params.tab);
      if (params.priority && params.priority !== 'ALL') queryParams.append('priority', params.priority);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const response = await fetchApi(`/admin/teacher-announcements/?${queryParams.toString()}`);
      if (response.success !== undefined) {
        if (response.success) return response;
        return rejectWithValue(response.message || 'Failed to fetch teacher announcements');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTeacherAnnouncementDetails = createAsyncThunk(
  'teacherAnnouncements/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/teacher-announcements/${id}/`);
      if (response.success !== undefined) {
        if (response.success) return response.data || response;
        return rejectWithValue(response.message || 'Failed to fetch details');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
