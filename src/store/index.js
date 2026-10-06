import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import teachersReducer from './slices/teachersSlice';
import studentsReducer from './slices/studentsSlice';
import connectionsReducer from './slices/connectionsSlice';
import enrollmentsReducer from './slices/enrollmentsSlice';
import materialsReducer from './slices/materialsSlice';
import announcementsReducer from './slices/announcementsSlice';
import reviewsReducer from './slices/reviewsSlice';
import paymentsReducer from './slices/paymentsSlice';
import reportsReducer from './slices/reportsSlice';
import auditLogsReducer from './slices/auditLogsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    teachers: teachersReducer,
    students: studentsReducer,
    connections: connectionsReducer,
    enrollments: enrollmentsReducer,
    materials: materialsReducer,
    announcements: announcementsReducer,
    reviews: reviewsReducer,
    payments: paymentsReducer,
    reports: reportsReducer,
    auditLogs: auditLogsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
