import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const normalizeConnection = (item) => {
  if (!item) return null;
  const isApproved = item.status === 'ADMIN_APPROVED' || item.status === 'APPROVED' || item.admin_approved;
  const isRejected = item.status === 'REJECTED';
  let status = 'Pending Admin Verification';
  if (isApproved) {
    status = 'Approved';
  } else if (isRejected) {
    status = 'Rejected';
  } else if (item.student_approved === false) {
    status = 'Pending Student Approval';
  }

  const sUser = item.student?.user || {};
  const tUser = item.teacher || {};

  return {
    ...item,
    id: item.id,
    status,
    contactShared: Boolean(item.contact_unlocked || item.contactShared),
    requestDate: item.created_at || item.requestDate || new Date().toISOString(),
    reason: item.message || item.reason || 'Academic mentorship & batch inquiry.',
    student: {
      id: item.student?.id || sUser.id || 'STU-001',
      name: sUser.full_name || `${sUser.first_name || ''} ${sUser.last_name || ''}`.trim() || item.student?.name || 'Student',
      grade: item.student?.education_level || item.student?.grade || 'Class 12',
      city: item.student?.city || 'India',
      avatar: sUser.profile_photo || null,
      phone: item.student?.phone || sUser.phone || '+91 ••••• •••••',
      email: item.student?.email || sUser.email || '••••••@student.in',
    },
    teacher: {
      id: tUser.id || 'TCH-001',
      name: tUser.display_name || tUser.full_name || `${tUser.first_name || ''} ${tUser.last_name || ''}`.trim() || item.teacher?.name || 'Educator',
      subject: Array.isArray(tUser.subjects) ? tUser.subjects[0] : (tUser.subject || 'All Subjects'),
      avatar: tUser.profile_photo || null,
      phone: tUser.phone_number || tUser.phone || '+91 ••••• •••••',
      email: tUser.email || '••••••@tutoron.in',
      qualification: tUser.qualification || 'Certified Faculty',
    },
  };
};

export const fetchConnections = createAsyncThunk(
  'connections/fetchConnections',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/connections/', params);
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      return {
        connections: rawList.map(normalizeConnection),
        pagination: response.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch connections');
    }
  }
);

export const approveConnection = createAsyncThunk(
  'connections/approveConnection',
  async ({ id, admin_note = '' }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/admin/connections/${id}/approve/`, { admin_note });
      dispatch(fetchConnections());
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to approve connection');
    }
  }
);

export const rejectConnection = createAsyncThunk(
  'connections/rejectConnection',
  async ({ id, rejection_reason = '' }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/admin/connections/${id}/reject/`, { rejection_reason });
      dispatch(fetchConnections());
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reject connection');
    }
  }
);

export const fetchContactDetails = createAsyncThunk(
  'connections/fetchContactDetails',
  async (connectionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/connections/${connectionId}/contact/`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to unlock contact details');
    }
  }
);

const connectionsSlice = createSlice({
  name: 'connections',
  initialState: {
    connections: [],
    pagination: null,
    selectedConnection: null,
    unlockedContacts: {},
    isLoading: false,
    isProcessing: false,
    error: null,
  },
  reducers: {
    setSelectedConnection: (state, action) => {
      state.selectedConnection = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections = action.payload.connections;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(approveConnection.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(approveConnection.fulfilled, (state) => {
        state.isProcessing = false;
      })
      .addCase(approveConnection.rejected, (state) => {
        state.isProcessing = false;
      })
      .addCase(fetchContactDetails.fulfilled, (state, action) => {
        if (action.payload?.connection_id) {
          state.unlockedContacts[action.payload.connection_id] = action.payload;
        }
      });
  },
});

export const { setSelectedConnection } = connectionsSlice.actions;
export default connectionsSlice.reducer;
