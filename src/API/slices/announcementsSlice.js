import { createSlice } from '@reduxjs/toolkit';
import { fetchAnnouncements, updateAnnouncementStatus, deleteAnnouncement } from '../thunks/announcementsThunks';

const initialState = {
  data: [],
  totalCount: 0,
  publishedCount: 0,
  scheduledCount: 0,
  draftCount: 0,
  expiredCount: 0,
  pagination: {
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  },
  isLoading: false,
  error: null,
};

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.data = payload.data || [];
        const counts = payload.counts || {};
        state.totalCount = counts.all ?? payload.total_count ?? payload.data?.length ?? 0;
        state.publishedCount = counts.published ?? payload.published_count ?? 0;
        state.scheduledCount = counts.scheduled ?? payload.scheduled_count ?? 0;
        state.draftCount = counts.drafts ?? payload.draft_count ?? 0;
        state.expiredCount = counts.expired ?? payload.expired_count ?? 0;
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateAnnouncementStatus.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload?.id) {
          const index = state.data.findIndex((a) => a.id === payload.id);
          if (index !== -1) {
            state.data[index].status = payload.status;
          }
        }
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        const id = action.payload;
        state.data = state.data.filter((a) => a.id !== id);
        state.totalCount = Math.max(0, state.totalCount - 1);
      });
  },
});

export default announcementsSlice.reducer;
