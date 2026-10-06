import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const normalizeReport = (item) => {
  if (!item) return null;
  const statusMap = {
    OPEN: 'Open',
    UNDER_REVIEW: 'Under Review',
    RESOLVED: 'Resolved',
    DISMISSED: 'Dismissed',
  };
  const status = statusMap[item.status] || item.status || 'Open';

  const filed = item.filed_by || item.reported_by || item.reportedBy || {};
  const reporterName = filed.name || item.reporter_name || (typeof filed === 'string' ? filed : 'Platform User');
  const reporterEmail = filed.email || item.reporter_email || 'user@tutoron.in';
  const reporterRole = filed.role || item.reporter_role || 'Student';
  const reporterId = filed.id || item.reporter_id || 'STU-10022';

  const target = item.reported_user || item.reportedUser || {};
  const targetName = target.name || item.reported_entity_name || item.target_name || (typeof target === 'string' ? target : 'Reported Entity');
  const targetRole = target.role || item.target_type || 'Teacher';
  const targetId = target.id || item.target_id || 'TCH-10001';
  const targetAvatar = target.avatar || item.target_avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80';
  const targetSubject = target.subject || item.target_subject || '';

  const dateStr = item.date || (item.created_at ? new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Today');

  return {
    ...item,
    id: item.report_code || item.id || `REP-${item.id}`,
    originalId: item.id,
    reportedBy: {
      id: reporterId,
      name: reporterName,
      role: reporterRole,
      email: reporterEmail,
    },
    reportedUser: {
      id: targetId,
      name: targetName,
      role: targetRole,
      avatar: targetAvatar,
      subject: targetSubject,
    },
    category: item.category || 'Abuse',
    priority: item.priority || 'Medium',
    status,
    date: dateStr,
    description: item.description || item.reason || item.admin_notes || 'Flagged for administrator review.',
    evidenceUrls: item.evidenceUrls || item.evidence_urls || [],
    timeline: item.timeline || [
      {
        action: 'Report Submitted',
        timestamp: dateStr,
        performedBy: reporterName,
        notes: item.description || 'Report filed.',
      },
    ],
    adminNotes: item.adminNotes || item.admin_notes || '',
    resolution: item.resolution || null,
  };
};

export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/reports/', params);
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      return {
        reports: rawList.map(normalizeReport),
        counts: response.counts || null,
        pagination: response.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch reports');
    }
  }
);

export const resolveReport = createAsyncThunk(
  'reports/resolveReport',
  async ({ id, resolution_action = 'RESOLVED', admin_notes = '' }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/admin/reports/${id}/resolve/`, {
        resolution_action,
        admin_notes,
      });
      dispatch(fetchReports());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to resolve report');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    reports: [],
    counts: null,
    pagination: null,
    selectedReport: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedReport: (state, action) => {
      state.selectedReport = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload.reports;
        state.counts = action.payload.counts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedReport } = reportsSlice.actions;
export default reportsSlice.reducer;
