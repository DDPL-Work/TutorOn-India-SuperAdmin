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
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/reviews/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
      if (response.success) return response.data;
      return rejectWithValue(response.message || 'Failed to update review status');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
