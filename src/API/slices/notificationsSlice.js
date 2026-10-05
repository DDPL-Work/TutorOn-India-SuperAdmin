import { createSlice } from '@reduxjs/toolkit';
import {
  fetchNotifications,
  fetchAllNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../thunks/notificationsThunks';

const initialState = {
  // Current / Inbox alerts
  items: [],
  unreadCount: 0,
  isLoading: false,

  // All platform audit alerts (?all=true)
  allNotifications: [],
  allUnreadCount: 0,
  isLoadingAll: false,

  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markLocalRead: (state, action) => {
      const id = action.payload;
      const item = state.items.find((n) => n.id === id);
      if (item && !item.is_read) {
        item.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      const allItem = state.allNotifications.find((n) => n.id === id);
      if (allItem && !allItem.is_read) {
        allItem.is_read = true;
        state.allUnreadCount = Math.max(0, state.allUnreadCount - 1);
      }
    },
    markAllLocalRead: (state) => {
      state.items.forEach((n) => {
        n.is_read = true;
      });
      state.unreadCount = 0;
      state.allNotifications.forEach((n) => {
        n.is_read = true;
      });
      state.allUnreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications (Current)
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.items = payload?.notifications || [];
        state.unreadCount =
          payload?.unread_count ?? state.items.filter((n) => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch All Platform Notifications
      .addCase(fetchAllNotifications.pending, (state) => {
        state.isLoadingAll = true;
        state.error = null;
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.isLoadingAll = false;
        const payload = action.payload;
        state.allNotifications = payload?.notifications || [];
        state.allUnreadCount =
          payload?.unread_count ?? state.allNotifications.filter((n) => !n.is_read).length;
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.isLoadingAll = false;
        state.error = action.payload;
      })

      // Mark single notification read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload?.id;
        if (id) {
          const item = state.items.find((n) => n.id === id);
          if (item && !item.is_read) {
            item.is_read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          const allItem = state.allNotifications.find((n) => n.id === id);
          if (allItem && !allItem.is_read) {
            allItem.is_read = true;
            state.allUnreadCount = Math.max(0, state.allUnreadCount - 1);
          }
        }
      })

      // Mark all notifications read
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.is_read = true;
        });
        state.unreadCount = 0;
        state.allNotifications.forEach((n) => {
          n.is_read = true;
        });
        state.allUnreadCount = 0;
      });
  },
});

export const { markLocalRead, markAllLocalRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
