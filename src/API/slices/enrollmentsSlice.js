import { createSlice } from '@reduxjs/toolkit';
import { fetchEnrollments, approveEnrollment, rejectEnrollment } from '../thunks/enrollmentsThunks';

const initialState = {
  data: [],
  totalCount: 0,
  pendingCount: 0,
  confirmedCount: 0,
  rejectedCount: 0,
  pagination: {
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  },
  isLoading: false,
  error: null,
};

const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.data = payload.data || [];
        state.totalCount = payload.total_count || payload.data?.length || 0;
        state.pendingCount = payload.pending_count || 0;
        state.confirmedCount = payload.confirmed_count || 0;
        state.rejectedCount = payload.rejected_count || 0;
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(approveEnrollment.fulfilled, (state, action) => {
        const index = state.data.findIndex((e) => e.id === action.meta.arg);
        if (index !== -1) {
          state.data[index].status = 'CONFIRMED';
        }
        state.pendingCount = Math.max(0, state.pendingCount - 1);
        state.confirmedCount += 1;
      })
      .addCase(rejectEnrollment.fulfilled, (state, action) => {
        const index = state.data.findIndex((e) => e.id === action.meta.arg.id);
        if (index !== -1) {
          state.data[index].status = 'REJECTED';
        }
        state.pendingCount = Math.max(0, state.pendingCount - 1);
        state.rejectedCount += 1;
      });
  },
});

export default enrollmentsSlice.reducer;
