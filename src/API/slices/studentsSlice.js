import { createSlice } from '@reduxjs/toolkit';
import { fetchStudents, deleteStudent } from '../thunks/studentsThunks';

const initialState = {
  data: [],
  totalCount: 0,
  pagination: {
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  },
  isLoading: false,
  error: null,
};

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.data = payload.data || [];
        // Handle pagination from payload if present
        if (payload.pagination) {
          state.pagination = payload.pagination;
          state.totalCount = payload.pagination.total || payload.data?.length || 0;
        } else {
           // Fallback if pagination object isn't present
           state.totalCount = payload.data?.length || 0;
        }
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.data = state.data.filter((s) => s.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
      });
  },
});

export default studentsSlice.reducer;
