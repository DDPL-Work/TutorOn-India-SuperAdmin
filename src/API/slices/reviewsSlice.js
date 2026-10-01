import { createSlice } from '@reduxjs/toolkit';
import { fetchReviews, updateReviewStatus } from '../thunks/reviewsThunks';

const initialState = {
  data: [],
  totalCount: 0,
  publishedCount: 0,
  flaggedCount: 0,
  removedCount: 0,
  pagination: {
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  },
  isLoading: false,
  error: null,
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.data = payload.data || [];
        state.totalCount = payload.total_count || payload.data?.length || 0;
        state.publishedCount = payload.published_count || 0;
        state.flaggedCount = payload.flagged_count || 0;
        state.removedCount = payload.removed_count || 0;
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateReviewStatus.fulfilled, (state, action) => {
        const payload = action.payload; // Assuming payload returns the updated review
        if (payload?.id) {
            const index = state.data.findIndex((r) => r.id === payload.id);
            if (index !== -1) {
              state.data[index].status = payload.status;
            }
        }
      });
  },
});

export default reviewsSlice.reducer;
