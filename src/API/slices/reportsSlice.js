import { createSlice } from '@reduxjs/toolkit';
import { fetchReports, resolveReport, fetchReportDetails } from '../thunks/reportsThunks';

const initialState = {
  data: [],
  currentReport: null,
  totalCount: 0,
  openCount: 0,
  underReviewCount: 0,
  resolvedCount: 0,
  dismissedCount: 0,
  pagination: {
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  },
  isLoading: false,
  error: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.data = payload.data || [];
        const counts = payload.counts || {};
        state.totalCount = counts.all ?? payload.total_count ?? payload.data?.length ?? 0;
        state.openCount = counts.open ?? 0;
        state.underReviewCount = counts.under_review ?? 0;
        state.resolvedCount = counts.resolved ?? 0;
        state.dismissedCount = counts.dismissed ?? 0;
        
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(resolveReport.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload?.report_id) {
          const index = state.data.findIndex((r) => r.id === payload.report_id);
          if (index !== -1) {
            state.data[index].status = payload.status;
            state.data[index].resolution_action = payload.resolution_action;
            state.data[index].resolved_by = payload.resolved_by;
          }
          if (state.currentReport && state.currentReport.id === payload.report_id) {
            state.currentReport.status = payload.status;
            state.currentReport.resolution_action = payload.resolution_action;
            state.currentReport.resolved_by = payload.resolved_by;
          }
        }
      })
      .addCase(fetchReportDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReport = action.payload;
      })
      .addCase(fetchReportDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default reportsSlice.reducer;
