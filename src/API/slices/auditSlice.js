import { createSlice } from '@reduxjs/toolkit';
import { fetchAuditLogs, fetchAuditLogDetails } from '../thunks/auditThunks';

const initialState = {
  data: [],
  currentLog: null,
  totalCount: 0,
  isLoading: false,
  error: null,
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.data = payload.data || [];
        state.totalCount = payload.total ?? payload.pagination?.total ?? payload.data?.length ?? 0;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAuditLogDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLog = action.payload;
      })
      .addCase(fetchAuditLogDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default auditSlice.reducer;
