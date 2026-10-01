import { createSlice } from '@reduxjs/toolkit';
import { fetchConnections, approveConnection } from '../thunks/connectionsThunks';

const initialState = {
  data: [],
  totalCount: 0,
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

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.data = payload.data || [];
        state.totalCount = payload.total_count || payload.data?.length || 0;
        state.pendingCount = payload.pending_count || 0;
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(approveConnection.fulfilled, (state, action) => {
        const index = state.data.findIndex((c) => c.id === action.payload?.id);
        if (index !== -1) {
          state.data[index].status = 'APPROVED';
        }
        state.pendingCount = Math.max(0, state.pendingCount - 1);
      });
  },
});

export default connectionsSlice.reducer;
