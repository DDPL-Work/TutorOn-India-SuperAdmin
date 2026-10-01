import { createSlice } from '@reduxjs/toolkit';
import { fetchBatches, deleteBatch } from '../thunks/batchesThunks';

const initialState = {
  data: [],
  totalCount: 0,
  activeCount: 0,
  completedCount: 0,
  pagination: {
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  },
  isLoading: false,
  error: null,
};

const batchesSlice = createSlice({
  name: 'batches',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.data = payload.data || [];
        state.totalCount = payload.total_count || payload.data?.length || 0;
        state.activeCount = payload.active_count || 0;
        state.completedCount = payload.completed_count || 0;
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteBatch.fulfilled, (state, action) => {
        state.data = state.data.filter((b) => b.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
      });
  },
});

export default batchesSlice.reducer;
