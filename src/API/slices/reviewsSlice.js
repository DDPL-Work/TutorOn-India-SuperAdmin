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
        state.totalCount = payload.total_count ?? (payload.counts?.all ?? payload.data?.length ?? 0);
        state.publishedCount = payload.published_count ?? (payload.counts?.published ?? 0);
        state.flaggedCount = payload.flagged_count ?? (payload.counts?.flagged ?? 0);
        state.removedCount = payload.removed_count ?? (payload.counts?.removed ?? 0);
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateReviewStatus.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload?.id) {
          const index = state.data.findIndex((r) => r.id === payload.id);
          if (index !== -1) {
            const oldStatus = state.data[index].status;
            state.data[index] = {
              ...state.data[index],
              ...payload,
              status: payload.status,
            };

            // Update badge counts if status changed
            if (oldStatus && payload.status && oldStatus !== payload.status) {
              if (oldStatus === 'PUBLISHED') state.publishedCount = Math.max(0, state.publishedCount - 1);
              if (oldStatus === 'FLAGGED') state.flaggedCount = Math.max(0, state.flaggedCount - 1);
              if (oldStatus === 'REMOVED') state.removedCount = Math.max(0, state.removedCount - 1);

              if (payload.status === 'PUBLISHED') state.publishedCount += 1;
              if (payload.status === 'FLAGGED') state.flaggedCount += 1;
              if (payload.status === 'REMOVED') state.removedCount += 1;
            }
          }
        }
      });
  },
});

export default reviewsSlice.reducer;
