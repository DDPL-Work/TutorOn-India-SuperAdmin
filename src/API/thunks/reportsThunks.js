import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

export const fetchReports = createAsyncThunk(
  'reports/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.category) queryParams.append('category', params.category);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const response = await fetchApi(`/admin/reports/?${queryParams.toString()}`);
      if (response.success !== undefined) {
        if (response.success) return response;
        return rejectWithValue(response.message || 'Failed to fetch reports');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReportDetails = createAsyncThunk(
  'reports/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/reports/${id}/`);
      if (response.success !== undefined) {
        if (response.success) return response.data || response;
        return rejectWithValue(response.message || 'Failed to fetch report details');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resolveReport = createAsyncThunk(
  'reports/resolve',
  async ({ id, resolution_action, admin_notes }, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/reports/${id}/resolve/`, {
        method: 'POST',
        body: JSON.stringify({ resolution_action, admin_notes }),
      });
      
      if (response && response.success === false) {
        return rejectWithValue(response.message || 'Failed to resolve report');
      }

      const resData = response?.data || response || {};
      return {
        id,
        report_id: resData.report_id || resData.id || id,
        status: resData.status || 'RESOLVED',
        resolved_by: resData.resolved_by || 'Super Admin',
        resolution_action: resData.resolution_action || resolution_action,
        admin_notes: admin_notes || resData.admin_notes || resData.admin_note,
        admin_note: admin_notes || resData.admin_notes || resData.admin_note,
        resolved_at: resData.resolved_at || new Date().toISOString(),
        ...resData,
        message: response?.message || 'Report resolved successfully.',
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to resolve report');
    }
  }
);

