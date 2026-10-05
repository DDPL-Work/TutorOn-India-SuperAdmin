import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../apiClient';

export const fetchStudents = createAsyncThunk(
  'students/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const response = await fetchApi(`/admin/students/?${queryParams.toString()}`);
      
      if (response.success !== undefined) {
          if (response.success) return response;
          return rejectWithValue(response.message || 'Failed to fetch students');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStudentById = createAsyncThunk(
  'students/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/students/${id}/`);
      if (response.success !== undefined) {
        if (response.success) return response.data; // return just the data
        return rejectWithValue(response.message || 'Failed to fetch student details');
      }
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deactivateStudent = createAsyncThunk(
  'students/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/students/${id}/deactivate/`, {
        method: 'POST',
      });
      // console.log("deactivateStudent response:", response); // Debugging log
      if (response.success !== undefined) {
        if (response.success) return response.data || response;
        return rejectWithValue(response.message || 'Failed to deactivate student');
      }
      return response.data || response;
    } catch (error) {
      // console.error("Error deactivating student:", error); // Debugging log
      return rejectWithValue(error.message);
    }
  }
);

export const activateStudent = createAsyncThunk(
  'students/activate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/admin/students/${id}/activate/`, {
        method: 'POST',
      });
      // console.log("activateStudent response:", response); // Debugging log
      if (response.success !== undefined) {
        if (response.success) return response.data || response;
        return rejectWithValue(response.message || 'Failed to activate student');
      }
      return response.data || response;
    } catch (error) {
      // console.error("Error activating student:", error); // Debugging log
      return rejectWithValue(error.message);
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'students/delete',
  async (id, { rejectWithValue }) => {
    try {
      await fetchApi(`/admin/students/${id}/`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
