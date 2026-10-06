import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const normalizeMaterial = (item) => {
  if (!item) return null;
  const statusMap = {
    PUBLISHED: 'Published',
    REPORTED: 'Reported',
    HIDDEN: 'Hidden',
    DRAFT: 'Draft',
  };
  const status = statusMap[item.status] || item.status || 'Published';

  return {
    ...item,
    id: item.code || item.id,
    originalId: item.id,
    code: item.code || `MAT-${item.id.slice(0, 5).toUpperCase()}`,
    title: item.title || 'Course Material',
    batchName: item.batch_title || item.batchName || 'General Academic Batch',
    teacherName: item.teacher_name || item.teacherName || 'Faculty Mentor',
    status,
    fileSize: item.file_size || item.fileSize || '3.4 MB',
    fileType: item.file_type || item.fileType || 'PDF Document',
    uploadDate: item.created_at ? item.created_at.split('T')[0] : (item.uploadDate || '2026-09-23'),
    chapters: Array.isArray(item.chapters) && item.chapters.length > 0 ? item.chapters : [
      {
        id: 'CH-1',
        title: item.title || 'Chapter 1: Curriculum Module',
        pages: 24,
        fileSize: '3.4 MB',
        uploadDate: item.created_at ? item.created_at.split('T')[0] : '2026-09-23',
        status: 'Active',
      }
    ],
  };
};

export const fetchMaterials = createAsyncThunk(
  'materials/fetchMaterials',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/admin/materials/', params);
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      return {
        materials: rawList.map(normalizeMaterial),
        counts: response.counts || null,
        pagination: response.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch study materials');
    }
  }
);

export const updateMaterialStatus = createAsyncThunk(
  'materials/updateMaterialStatus',
  async ({ id, status }, { dispatch, rejectWithValue }) => {
    try {
      const apiStatus = status.toUpperCase();
      const response = await api.patch(`/api/v1/admin/materials/${id}/`, { status: apiStatus });
      dispatch(fetchMaterials());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update material status');
    }
  }
);

const materialsSlice = createSlice({
  name: 'materials',
  initialState: {
    materials: [],
    counts: null,
    pagination: null,
    selectedMaterial: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedMaterial: (state, action) => {
      state.selectedMaterial = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials = action.payload.materials;
        state.counts = action.payload.counts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedMaterial } = materialsSlice.actions;
export default materialsSlice.reducer;
