import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

// 1. Fetch Current Admin Notifications (Personal Inbox or filtered)
export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.all) queryParams.append('all', 'true');
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/admin/notifications/?${queryString}` : '/admin/notifications/';

      const response = await fetchApi(endpoint);
      if (response && response.success !== undefined) {
        if (response.success) return response.data || response;
        return rejectWithValue(response.message || 'Failed to fetch notifications');
      }
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Fetch All Platform Notifications (Global Audit View: ?all=true)
export const fetchAllNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/admin/notifications/?all=true');
      if (response && response.success !== undefined) {
        if (response.success) return response.data || response;
        return rejectWithValue(response.message || 'Failed to fetch all platform notifications');
      }
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. Mark Single Notification as Read (POST /admin/notifications/{id}/read/)
export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/notifications/${id}/read/`, {
        method: 'POST',
      });
      if (response && response.success !== undefined) {
        if (response.success) return { id, ...response };
        return rejectWithValue(response.message || 'Failed to mark notification as read');
      }
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 4. Mark All Notifications as Read (POST /admin/notifications/read-all/)
export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/admin/notifications/read-all/', {
        method: 'POST',
      });
      if (response && response.success !== undefined) {
        if (response.success) return response;
        return rejectWithValue(response.message || 'Failed to mark all notifications as read');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
