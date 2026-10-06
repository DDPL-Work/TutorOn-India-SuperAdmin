import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const normalizeTeacher = (item) => {
  if (!item) return null;
  const isVerified = item.verification_status === 'VERIFIED' || item.current_status === 'VERIFIED';
  const isRejected = item.verification_status === 'REJECTED';
  const verificationStatus = isVerified ? 'Verified' : isRejected ? 'Rejected' : 'Pending Verification';

  return {
    ...item,
    id: item.id,
    name: item.display_name || item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Educator',
    avatar: item.profile_photo || null,
    qualification: item.qualification || item.qualifications || 'Certified Educator',
    experience: item.experience || (item.experience_years ? `${item.experience_years} Years Experience` : 'Experienced Faculty'),
    subjects: Array.isArray(item.subjects) ? item.subjects : (item.subjects ? [item.subjects] : ['General Studies']),
    examExpertise: Array.isArray(item.exam_expertise) ? item.exam_expertise : ['IIT-JEE', 'CBSE Board'],
    languages: Array.isArray(item.teaching_languages) ? item.teaching_languages : (Array.isArray(item.languages) ? item.languages : ['English', 'Hindi']),
    rating: parseFloat(item.average_rating || item.rating || 4.8),
    ratingCount: parseInt(item.total_reviews || item.ratingCount || 0, 10),
    studentsTaught: parseInt(item.total_students || item.studentsTaught || 0, 10),
    verificationStatus,
    joinedDate: item.created_at ? item.created_at.split('T')[0] : (item.joinedDate || '2026-09-20'),
    hourlyRate: parseFloat(item.hourly_rate || item.hourlyRate || 500),
    email: item.email || '',
    phone: item.phone_number || item.phone || '',
    city: item.city || 'India',
    state: item.state || '',
    bio: item.bio || '',
    documents: item.documents || [
      { id: 'DOC-1', name: 'Identity & Degree Document', type: 'Certificate', status: isVerified ? 'Verified' : 'Pending Review', verified: isVerified }
    ],
    batchesCount: item.batchesCount || 1,
    activeBatches: item.activeBatches || [],
    verificationAudit: item.verificationAudit || [],
  };
};

export const fetchTeachers = createAsyncThunk(
  'teachers/fetchTeachers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/teachers/', params);
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      return {
        teachers: rawList.map(normalizeTeacher),
        total_count: response.total_count ?? rawList.length,
        verified_count: response.verified_count ?? 0,
        pending_count: response.pending_count ?? 0,
        pagination: response.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch teachers');
    }
  }
);

export const fetchTeacherVerifications = createAsyncThunk(
  'teachers/fetchTeacherVerifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/teacher-verifications/', params);
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch teacher verifications');
    }
  }
);

export const approveTeacherVerification = createAsyncThunk(
  'teachers/approveTeacherVerification',
  async ({ id, admin_notes = '' }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/admin/teacher-verifications/${id}/approve/`, { admin_notes });
      dispatch(fetchTeachers());
      dispatch(fetchTeacherVerifications());
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to approve verification');
    }
  }
);

export const rejectTeacherVerification = createAsyncThunk(
  'teachers/rejectTeacherVerification',
  async ({ id, rejection_reason = '', admin_note = '' }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/admin/teacher-verifications/${id}/reject/`, {
        rejection_reason,
        admin_note: admin_note || rejection_reason,
      });
      dispatch(fetchTeachers());
      dispatch(fetchTeacherVerifications());
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reject verification');
    }
  }
);

export const createTeacher = createAsyncThunk(
  'teachers/createTeacher',
  async (teacherData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/admin/teachers/', teacherData);
      dispatch(fetchTeachers());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create teacher');
    }
  }
);

export const updateTeacher = createAsyncThunk(
  'teachers/updateTeacher',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/admin/teachers/${id}/`, data);
      dispatch(fetchTeachers());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update teacher');
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  'teachers/deleteTeacher',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/admin/teachers/${id}/`);
      dispatch(fetchTeachers());
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete teacher');
    }
  }
);

const teachersSlice = createSlice({
  name: 'teachers',
  initialState: {
    teachers: [],
    verifications: [],
    totalCount: 0,
    verifiedCount: 0,
    pendingCount: 0,
    pagination: null,
    selectedTeacher: null,
    isLoading: false,
    isVerifying: false,
    error: null,
  },
  reducers: {
    setSelectedTeacher: (state, action) => {
      state.selectedTeacher = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teachers
      .addCase(fetchTeachers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = action.payload.teachers;
        state.totalCount = action.payload.total_count;
        state.verifiedCount = action.payload.verified_count;
        state.pendingCount = action.payload.pending_count;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch verifications
      .addCase(fetchTeacherVerifications.fulfilled, (state, action) => {
        state.verifications = action.payload;
      })
      // Approve verification
      .addCase(approveTeacherVerification.pending, (state) => {
        state.isVerifying = true;
      })
      .addCase(approveTeacherVerification.fulfilled, (state) => {
        state.isVerifying = false;
      })
      .addCase(approveTeacherVerification.rejected, (state) => {
        state.isVerifying = false;
      })
      // Reject verification
      .addCase(rejectTeacherVerification.pending, (state) => {
        state.isVerifying = true;
      })
      .addCase(rejectTeacherVerification.fulfilled, (state) => {
        state.isVerifying = false;
      })
      .addCase(rejectTeacherVerification.rejected, (state) => {
        state.isVerifying = false;
      });
  },
});

export const { setSelectedTeacher } = teachersSlice.actions;
export default teachersSlice.reducer;
