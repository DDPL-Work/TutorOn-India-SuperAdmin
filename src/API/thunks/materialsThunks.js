import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

export const fetchMaterials = createAsyncThunk(
  'materials/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      
      const response = await fetchApi(`/admin/materials/?${queryParams.toString()}`);
      if (response.success !== undefined) {
        if (response.success) return response;
        return rejectWithValue(response.message || 'Failed to fetch materials');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const moderateMaterial = createAsyncThunk(
  'materials/moderate',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/materials/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (response.success !== undefined) {
        if (response.success) return response;
        return rejectWithValue(response.message || 'Failed to moderate material');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMaterialById = createAsyncThunk(
  'materials/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/materials/${id}/`);
      if (response.success !== undefined) {
        if (response.success) return response.data;
        return rejectWithValue(response.message || 'Failed to fetch material details');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
