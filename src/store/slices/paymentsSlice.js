import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const normalizePayment = (item) => {
  if (!item) return null;
  const statusMap = {
    SUCCESS: 'Successful',
    SUCCESSFUL: 'Successful',
    PENDING: 'Pending',
    FAILED: 'Failed',
  };
  const status = statusMap[item.status] || item.status || 'Successful';
  const numAmount = parseFloat(item.amount || item.numericAmount || 14999);

  let sName = 'Aarav Kumar';
  let sEmail = 'aarav@student.in';
  if (typeof item.student === 'string') {
    const parts = item.student.match(/(.*)\s*\((.*)\)/);
    if (parts) {
      sName = parts[1].trim();
      sEmail = parts[2].trim();
    } else {
      sName = item.student;
    }
  } else if (item.student) {
    sName = item.student.name || `${item.student.first_name || ''} ${item.student.last_name || ''}`.trim() || 'Student';
    sEmail = item.student.email || 'student@tutoron.in';
  }

  const batchName = typeof item.batch === 'string' ? item.batch : (item.batch?.name || item.batch?.title || 'Academic Course Cohort');
  const batchCode = item.batch?.code || 'BAT-PHY-101';

  return {
    ...item,
    id: item.transaction_id || item.id,
    originalId: item.id,
    student: {
      name: sName,
      email: sEmail,
      phone: item.student?.phone || '+91 98765 43210',
    },
    batch: {
      name: batchName,
      code: batchCode,
    },
    amount: `₹${numAmount.toLocaleString('en-IN')}`,
    numericAmount: numAmount,
    status,
    paymentMethod: item.payment_method || item.paymentMethod || 'UPI',
    date: item.paid_at || item.created_at || item.date || new Date().toISOString(),
  };
};

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/payments/', params);
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      return {
        payments: rawList.map(normalizePayment),
        pagination: response.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch payments');
    }
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState: {
    payments: [],
    pagination: null,
    selectedPayment: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedPayment: (state, action) => {
      state.selectedPayment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.payments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedPayment } = paymentsSlice.actions;
export default paymentsSlice.reducer;
