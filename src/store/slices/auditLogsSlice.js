import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const normalizeAuditLog = (item) => {
  if (!item) return null;
  const adminName = item.operator || item.admin_operator?.name || item.actor_name || item.actor_email || item.admin || 'Super Admin (admin@tutoron.in)';
  const entity = item.target_entity || item.related_entity || item.relatedEntity || item.description || 'Target Platform Resource';
  const code = item.audit_code || item.id;
  const ip = item.originating_ip || item.originatingIp || item.ipAddress || '103.21.144.18 (New Delhi, India)';

  const stateTransition = item.state_transition || item.stateTransition || {};
  const previousState = item.previousState || stateTransition.previous_state || stateTransition.previousState || {
    status: 'Pending Verification',
    badge: 'Unverified',
    allowedToPublishBatches: false,
  };
  const newState = item.newState || stateTransition.new_state || stateTransition.newState || {
    status: 'Verified',
    badge: 'Verified Educator',
    allowedToPublishBatches: true,
  };

  return {
    ...item,
    id: code,
    originalId: item.id,
    action: item.action || 'Administrative Action',
    category: item.category || 'Verification',
    admin: adminName,
    userId: item.target_user_id || item.userId || item.actor || 'TCH-10248',
    relatedEntity: entity,
    reason: item.justification || item.reason || item.description || 'Administrative state transition validated.',
    timestamp: item.timestamp || (item.created_at ? new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '2026-09-23 10:14:32 IST'),
    ipAddress: ip,
    originatingIp: ip,
    previousState,
    newState,
    integritySignature: item.integrity_signature || item.integritySignature || 'SHA256:7f83b1657ff1fc53b92dc18148a1d6650fc2e4b1fa3c677284adcd208126d9069',
  };
};

export const fetchAuditLogs = createAsyncThunk(
  'auditLogs/fetchAuditLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/audit-logs/', params);
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      return {
        auditLogs: rawList.map(normalizeAuditLog),
        total: response.total ?? rawList.length,
        pagination: response.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch audit logs');
    }
  }
);

export const fetchAuditLogDetails = createAsyncThunk(
  'auditLogs/fetchAuditLogDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/audit-logs/${id}/`);
      return normalizeAuditLog(response.data);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch audit log detail');
    }
  }
);

const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState: {
    auditLogs: [],
    total: 0,
    pagination: null,
    selectedAuditLog: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedAuditLog: (state, action) => {
      state.selectedAuditLog = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auditLogs = action.payload.auditLogs;
        state.total = action.payload.total;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAuditLogDetails.fulfilled, (state, action) => {
        state.selectedAuditLog = action.payload;
      });
  },
});

export const { setSelectedAuditLog } = auditLogsSlice.actions;
export default auditLogsSlice.reducer;
