import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const normalizeReview = (item) => {
  if (!item) return null;
  const statusMap = {
    PUBLISHED: 'Published',
    FLAGGED: 'Flagged',
    REMOVED: 'Removed',
  };
  const status = statusMap[item.status] || item.status || 'Published';

  return {
    ...item,
    id: item.code || item.id,
    originalId: item.id,
    studentName: item.student_name || item.reviewer?.name || item.studentName || 'Student Reviewer',
    teacherName: item.teacher_name || item.teacherName || 'Faculty Educator',
    rating: parseFloat(item.rating || 5),
    comment: item.comment || item.review || 'Exceptional mentorship and clear conceptual teaching.',
    status,
    createdDate: item.created_at ? item.created_at.split('T')[0] : (item.createdDate || '2026-09-23'),
    batchName: item.batch_title || item.batchName || 'General Academic Cohort',
  };
};

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/reviews/', params);
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      return {
        reviews: rawList.map(normalizeReview),
        counts: response.counts || null,
        pagination: response.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch reviews');
    }
  }
);

export const removeReview = createAsyncThunk(
  'reviews/removeReview',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/admin/reviews/${id}/`);
      dispatch(fetchReviews());
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to remove review');
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    counts: null,
    pagination: null,
    selectedReview: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedReview: (state, action) => {
      state.selectedReview = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews;
        state.counts = action.payload.counts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedReview } = reviewsSlice.actions;
export default reviewsSlice.reducer;
