import { createSlice } from '@reduxjs/toolkit';
import { fetchPayments } from '../thunks/paymentsThunks';

const initialState = {
  data: [],
  totalCount: 0,
  successfulCount: 0,
  pendingCount: 0,
  failedCount: 0,
  totalRevenue: 0,
  pagination: {
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  },
  isLoading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.data = payload.data || [];
        state.totalCount = payload.total_count || payload.data?.length || 0;
        state.successfulCount = payload.successful_count || 0;
        state.pendingCount = payload.pending_count || 0;
        state.failedCount = payload.failed_count || 0;
        state.totalRevenue = payload.total_revenue || 0;
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default paymentsSlice.reducer;
