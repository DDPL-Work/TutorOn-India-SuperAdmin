import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

export const fetchReviews = createAsyncThunk(
  'reviews/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.rating) queryParams.append('rating', params.rating);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const response = await fetchApi(`/admin/reviews/?${queryParams.toString()}`);
      if (response.success !== undefined) {
        if (response.success) return response;
        return rejectWithValue(response.message || 'Failed to fetch reviews');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateReviewStatus = createAsyncThunk(
  'reviews/updateStatus',
  async ({ id, status, notes, reason }, { rejectWithValue }) => {
    try {
      const payload = { status };
      const noteText = notes || reason;
      if (noteText) {
        payload.notes = noteText;
        payload.moderation_notes = noteText;
        payload.reason = noteText;
      }

      const response = await fetchApi(`/admin/reviews/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (response && response.success !== undefined) {
        if (response.success) {
          return { id, status, ...(response.data || response) };
        }
        return rejectWithValue(response.message || 'Failed to update review status');
      }

      return { id, status, ...(response || {}) };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update review status');
    }
  }
);
