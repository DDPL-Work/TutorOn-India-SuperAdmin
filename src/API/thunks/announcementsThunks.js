import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.audience) queryParams.append('audience', params.audience);
      if (params.type) queryParams.append('type', params.type);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      if (params.is_banner !== undefined) queryParams.append('is_banner', params.is_banner);

      const response = await fetchApi(`/admin/announcements/?${queryParams.toString()}`);
      if (response.success !== undefined) {
        if (response.success) return response;
        return rejectWithValue(response.message || 'Failed to fetch announcements');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAnnouncementStatus = createAsyncThunk(
  'announcements/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/announcements/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (response.success !== undefined) {
        if (response.success) return response.data;
        return rejectWithValue(response.message || 'Failed to update announcement status');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  'announcements/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/announcements/${id}/`, {
        method: 'DELETE',
      });
      if (!response || response.success === undefined || response.success) return id;
      return rejectWithValue(response.message || 'Failed to delete announcement');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAnnouncementById = createAsyncThunk(
  'announcements/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/announcements/${id}/`);
      if (response.success !== undefined) {
        if (response.success) return response.data;
        return rejectWithValue(response.message || 'Failed to fetch announcement details');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  'announcements/create',
  async (announcementData, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/admin/announcements/', {
        method: 'POST',
        body: JSON.stringify(announcementData),
      });
      if (response.success !== undefined) {
        if (response.success) return response.data || response;
        return rejectWithValue(response.message || 'Failed to create announcement');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const updateAnnouncement = createAsyncThunk(
  'announcements/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/announcements/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.success !== undefined) {
        if (response.success) return response.data || response;
        return rejectWithValue(response.message || 'Failed to update announcement');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
