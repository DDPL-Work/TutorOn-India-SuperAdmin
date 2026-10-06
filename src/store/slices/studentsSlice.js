import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const normalizeStudent = (item) => {
  if (!item) return null;
  const user = item.user || {};
  const firstName = item.first_name || user.first_name || '';
  const lastName = item.last_name || user.last_name || '';
  const name = `${firstName} ${lastName}`.trim() || item.name || 'Student';
  const email = item.email || user.email || '';
  const phone = item.phone_number || item.phone || user.phone || '';
  const grade = item.education_level || item.grade_target || item.grade || 'Class XII (PCM)';
  const school = item.school_name || item.school || 'Public School';
  const status = item.is_active === false ? 'Inactive' : (item.status || 'Active');

  return {
    ...item,
    id: item.id,
    name,
    email,
    phone,
    avatar: item.profile_photo || user.profile_photo || null,
    grade,
    board: item.board || 'CBSE',
    school,
    city: item.city || 'India',
    state: item.state || '',
    guardianName: item.guardian_name || item.guardianName || 'Parent / Guardian',
    guardianPhone: item.guardian_phone || item.guardianPhone || phone,
    status,
    joinedDate: item.created_at ? item.created_at.split('T')[0] : (item.joinedDate || '2026-09-20'),
    enrolledBatchesCount: item.enrolled_batches_count ?? item.batchesCount ?? 0,
    batchesCount: item.enrolled_batches_count ?? item.batchesCount ?? 0,
  };
};

export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/students/', params);
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      return {
        students: rawList.map(normalizeStudent),
        pagination: response.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch students');
    }
  }
);

export const createStudent = createAsyncThunk(
  'students/createStudent',
  async (studentData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/admin/students/', studentData);
      dispatch(fetchStudents());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create student');
    }
  }
);

export const updateStudent = createAsyncThunk(
  'students/updateStudent',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/admin/students/${id}/`, data);
      dispatch(fetchStudents());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update student');
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'students/deleteStudent',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/admin/students/${id}/`);
      dispatch(fetchStudents());
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete student');
    }
  }
);

const studentsSlice = createSlice({
  name: 'students',
  initialState: {
    students: [],
    pagination: null,
    selectedStudent: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload.students;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedStudent } = studentsSlice.actions;
export default studentsSlice.reducer;
