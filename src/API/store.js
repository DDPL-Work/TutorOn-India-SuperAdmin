import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import teachersReducer from './slices/teachersSlice';
import studentsReducer from './slices/studentsSlice';
import connectionsReducer from './slices/connectionsSlice';
import batchesReducer from './slices/batchesSlice';
import enrollmentsReducer from './slices/enrollmentsSlice';
import paymentsReducer from './slices/paymentsSlice';
import reviewsReducer from './slices/reviewsSlice';
import announcementsReducer from './slices/announcementsSlice';
import reportsReducer from './slices/reportsSlice';
import auditReducer from './slices/auditSlice';
import teacherAnnouncementsReducer from './slices/teacherAnnouncementsSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    teachers: teachersReducer,
    students: studentsReducer,
    connections: connectionsReducer,
    batches: batchesReducer,
    enrollments: enrollmentsReducer,
    payments: paymentsReducer,
    reviews: reviewsReducer,
    announcements: announcementsReducer,
    reports: reportsReducer,
    audit: auditReducer,
    teacherAnnouncements: teacherAnnouncementsReducer,
  },
});
