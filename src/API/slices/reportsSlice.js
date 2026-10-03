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
  isResolving: false,
  resolveError: null,
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
      .addCase(resolveReport.pending, (state) => {
        state.isResolving = true;
        state.resolveError = null;
      })
      .addCase(resolveReport.fulfilled, (state, action) => {
        state.isResolving = false;
        state.resolveError = null;
        const payload = action.payload;
        const targetId = payload?.report_id || payload?.id || action.meta?.arg?.id;

        if (targetId) {
          let prevStatus = null;

          // Update in reports data list
          const index = state.data.findIndex((r) => r.id === targetId || r.report_id === targetId);
          if (index !== -1) {
            prevStatus = (state.data[index].status || '').toUpperCase();
            state.data[index] = {
              ...state.data[index],
              status: payload.status || 'RESOLVED',
              resolution_action: payload.resolution_action,
              resolved_by: payload.resolved_by,
              admin_notes: payload.admin_notes || state.data[index].admin_notes,
              admin_note: payload.admin_notes || state.data[index].admin_note,
              resolved_at: payload.resolved_at || new Date().toISOString(),
            };
          }

          // Update current report detail if viewed
          if (state.currentReport && (state.currentReport.id === targetId || state.currentReport.report_id === targetId)) {
            prevStatus = prevStatus || (state.currentReport.status || '').toUpperCase();
            state.currentReport = {
              ...state.currentReport,
              status: payload.status || 'RESOLVED',
              resolution_action: payload.resolution_action,
              resolved_by: payload.resolved_by,
              admin_notes: payload.admin_notes || state.currentReport.admin_notes,
              admin_note: payload.admin_notes || state.currentReport.admin_note,
              resolved_at: payload.resolved_at || new Date().toISOString(),
            };
          }

          // Adjust status counters
          if (prevStatus === 'OPEN') {
            state.openCount = Math.max(0, state.openCount - 1);
          } else if (prevStatus === 'UNDER_REVIEW' || prevStatus === 'UNDER REVIEW') {
            state.underReviewCount = Math.max(0, state.underReviewCount - 1);
          }

          const newStatus = (payload.status || 'RESOLVED').toUpperCase();
          if (newStatus === 'RESOLVED') {
            state.resolvedCount = (state.resolvedCount || 0) + 1;
          } else if (newStatus === 'DISMISSED') {
            state.dismissedCount = (state.dismissedCount || 0) + 1;
          }
        }
      })
      .addCase(resolveReport.rejected, (state, action) => {
        state.isResolving = false;
        state.resolveError = action.payload;
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
