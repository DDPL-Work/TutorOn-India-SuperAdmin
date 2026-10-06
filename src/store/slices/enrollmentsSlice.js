import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const normalizeEnrollment = (item) => {
  if (!item) return null;
  const sUser = item.student?.user || item.student || {};
  const sName = sUser.full_name || `${sUser.first_name || ''} ${sUser.last_name || ''}`.trim() || item.student_name || 'Enrolled Student';
  const batch = item.batch || {};
  
  let status = 'Payment Pending';
  if (item.status === 'CONFIRMED' || item.status === 'Confirmed' || item.status === 'COMPLETED') {
    status = 'Confirmed';
  } else if (item.status === 'REJECTED' || item.status === 'Rejected') {
    status = 'Rejected';
  } else if (item.status === 'REQUESTED' || item.status === 'PAYMENT_PENDING' || item.payment_status === 'UNPAID') {
    status = 'Payment Pending';
  }

  let paymentStatus = 'Payment Pending';
  if (item.payment_status === 'PAID' || item.payment_status === 'SUCCESS' || status === 'Confirmed') {
    paymentStatus = 'Paid';
  } else if (item.payment_status === 'FAILED') {
    paymentStatus = 'Failed';
  }

  return {
    ...item,
    id: item.enrollment_code || item.id,
    originalId: item.id,
    student: {
      name: sName,
      email: sUser.email || item.student_email || 'student@tutoron.in',
      phone: sUser.phone_number || sUser.phone || item.student_phone || '+91 ••••• •••••',
      avatar: sUser.profile_photo || null,
    },
    batch: {
      id: batch.id || 'BAT-001',
      name: batch.title || batch.name || 'Academic Batch',
      title: batch.title || batch.name || 'Academic Batch',
      subject: batch.subject || 'All Subjects',
      teacherName: batch.teacher || batch.teacher_name || 'Faculty Mentor',
      fee: batch.price ? `₹${parseFloat(batch.price).toLocaleString('en-IN')}` : '₹9,999',
    },
    status,
    paymentStatus,
    fee: batch.price ? `₹${parseFloat(batch.price).toLocaleString('en-IN')}` : '₹9,999',
    requestedDate: item.requested_at || item.created_at || item.requestedDate || new Date().toISOString(),
  };
};

export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetchEnrollments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/enrollments/', params);
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      return {
        enrollments: rawList.map(normalizeEnrollment),
        counts: response.counts || null,
        pagination: response.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch enrollments');
    }
  }
);

export const fetchBatches = createAsyncThunk(
  'enrollments/fetchBatches',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/batches/', params);
      return {
        batches: response.data || [],
        batch_count: response.batch_count || 0,
        status_counts: response.status_counts || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch batches');
    }
  }
);

const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState: {
    enrollments: [],
    batches: [],
    batchCounts: null,
    counts: null,
    pagination: null,
    selectedEnrollment: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedEnrollment: (state, action) => {
      state.selectedEnrollment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollments = action.payload.enrollments;
        state.counts = action.payload.counts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.batches = action.payload.batches;
        state.batchCounts = action.payload.status_counts;
      });
  },
});

export const { setSelectedEnrollment } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;
