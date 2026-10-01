import { createSlice } from '@reduxjs/toolkit';
import { fetchTeachers, approveTeacher, rejectTeacher, deleteTeacher } from '../thunks/teachersThunks';

const initialState = {
  data: [],
  totalCount: 0,
  verifiedCount: 0,
  pendingCount: 0,
  pagination: {
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  },
  isLoading: false,
  error: null,
};

const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Teachers
      .addCase(fetchTeachers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.data = payload.data || [];
        state.totalCount = payload.total_count || 0;
        state.verifiedCount = payload.verified_count || 0;
        state.pendingCount = payload.pending_count || 0;
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Approve Teacher
      .addCase(approveTeacher.fulfilled, (state, action) => {
        const index = state.data.findIndex((t) => t.id === action.payload.teacher_id);
        if (index !== -1) {
          state.data[index].verification_status = 'VERIFIED';
        }
        state.verifiedCount += 1;
        state.pendingCount = Math.max(0, state.pendingCount - 1);
      })
      // Reject Teacher
      .addCase(rejectTeacher.fulfilled, (state, action) => {
        const index = state.data.findIndex((t) => t.id === action.payload.teacher_id);
        if (index !== -1) {
          state.data[index].verification_status = 'REJECTED';
        }
        state.pendingCount = Math.max(0, state.pendingCount - 1);
      })
      // Delete Teacher
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.data = state.data.filter((t) => t.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
      });
  },
});

export default teachersSlice.reducer;
