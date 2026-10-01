import { createSlice } from '@reduxjs/toolkit';
import { fetchTeacherAnnouncements } from '../thunks/teacherAnnouncementsThunks';

const initialState = {
  data: [],
  totalCount: 0,
  publishedCount: 0,
  urgentCount: 0,
  flaggedCount: 0,
  draftCount: 0,
  isLoading: false,
  error: null,
};

const teacherAnnouncementsSlice = createSlice({
  name: 'teacherAnnouncements',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherAnnouncements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeacherAnnouncements.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.data = payload.data || [];
        const counts = payload.counts || {};
        state.totalCount = counts.all ?? payload.total_count ?? payload.pagination?.total ?? payload.data?.length ?? 0;
        state.publishedCount = counts.published ?? 0;
        state.urgentCount = counts.high_priority_urgent ?? 0;
        state.flaggedCount = counts.flagged_by_admin ?? 0;
        state.draftCount = counts.drafts ?? 0;
      })
      .addCase(fetchTeacherAnnouncements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default teacherAnnouncementsSlice.reducer;
