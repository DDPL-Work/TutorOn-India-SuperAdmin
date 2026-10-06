import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const normalizeAnnouncement = (item) => {
  if (!item) return null;
  const statusMap = {
    PUBLISHED: 'Published',
    SCHEDULED: 'Scheduled',
    DRAFTS: 'Draft',
    DRAFT: 'Draft',
    EXPIRED: 'Expired',
  };
  const status = statusMap[item.status] || item.status || 'Published';

  const typeMap = {
    PROMOTIONAL: 'Promotional',
    SYSTEM: 'System',
    ACADEMIC: 'Academic',
    POLICY: 'Policy',
  };
  const type = typeMap[item.announcement_type || item.type] || item.type || 'Promotional';

  const audienceMap = {
    ALL: 'All Users',
    STUDENTS: 'Students Only',
    TEACHERS: 'Teachers Only',
  };
  const audience = audienceMap[item.target_audience || item.audience] || item.audience || 'All Users';

  return {
    ...item,
    id: item.code || item.id,
    originalId: item.id,
    title: item.title,
    content: item.content || item.description || '',
    type,
    audience,
    status,
    publishedDate: item.created_at ? item.created_at.split('T')[0] : (item.publishedDate || '2026-09-23'),
  };
};

export const normalizeBanner = (item) => {
  if (!item) return null;
  const isActive = item.is_active !== undefined ? item.is_active : (item.status === 'PUBLISHED' || item.status === 'ACTIVE' || item.status === 'Active');

  return {
    ...item,
    id: item.code || item.id,
    originalId: item.id,
    title: item.title,
    targetUrl: item.target_url || item.targetUrl || '/batches',
    status: isActive ? 'Active' : 'Inactive',
    imageUrl: item.image || item.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    clicks: item.clicks || 0,
    impressions: item.impressions || 0,
    createdDate: item.created_at ? item.created_at.split('T')[0] : (item.createdDate || '2026-09-23'),
  };
};

export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAnnouncements',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/announcements/', params);
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      return {
        announcements: rawList.map(normalizeAnnouncement),
        counts: response.counts || null,
        pagination: response.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch announcements');
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  'announcements/createAnnouncement',
  async (announcementData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/admin/announcements/', announcementData);
      dispatch(fetchAnnouncements());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create announcement');
    }
  }
);

export const fetchBanners = createAsyncThunk(
  'announcements/fetchBanners',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/banners/', params);
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      return {
        banners: rawList.map(normalizeBanner),
        activeCount: response.active_count || 0,
        totalCount: response.total_count || rawList.length,
        pagination: response.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch promotional banners');
    }
  }
);

export const createBanner = createAsyncThunk(
  'announcements/createBanner',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/admin/banners/', formData);
      dispatch(fetchBanners());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create banner');
    }
  }
);

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState: {
    announcements: [],
    banners: [],
    counts: null,
    bannerCounts: { active: 0, total: 0 },
    pagination: null,
    selectedAnnouncement: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedAnnouncement: (state, action) => {
      state.selectedAnnouncement = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.announcements = action.payload.announcements;
        state.counts = action.payload.counts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.banners = action.payload.banners;
        state.bannerCounts = {
          active: action.payload.activeCount,
          total: action.payload.totalCount,
        };
      });
  },
});

export const { setSelectedAnnouncement } = announcementsSlice.actions;
export default announcementsSlice.reducer;
