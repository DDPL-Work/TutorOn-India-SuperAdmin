import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import Login from '../pages/auth/Login';
import DashboardOverview from '../pages/dashboard/DashboardOverview';
import StudentsList from '../pages/students/StudentsList';
import StudentDetails from '../pages/students/StudentDetails';
import TeachersList from '../pages/teachers/TeachersList';
import TeacherDetails from '../pages/teachers/TeacherDetails';
import ConnectionsList from '../pages/connections/ConnectionsList';
import ConnectionDetails from '../pages/connections/ConnectionDetails';
import EnrollmentsList from '../pages/enrollments/EnrollmentsList';
import EnrollmentDetails from '../pages/enrollments/EnrollmentDetails';
import StudyMaterials from '../pages/content/StudyMaterials';
import TeacherAnnouncements from '../pages/content/TeacherAnnouncements';
import AnnouncementsList from '../pages/announcements/AnnouncementsList';
import AnnouncementEditor from '../pages/announcements/AnnouncementEditor';
import BannersList from '../pages/announcements/BannersList';
import ReviewsList from '../pages/reviews/ReviewsList';
import PaymentsList from '../pages/payments/PaymentsList';
import PaymentDetails from '../pages/payments/PaymentDetails';
import ReportsList from '../pages/reports/ReportsList';
import ReportDetails from '../pages/reports/ReportDetails';
import AuditLogsList from '../pages/audit/AuditLogsList';
import AuditLogDetails from '../pages/audit/AuditLogDetails';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="students" element={<StudentsList />} />
        <Route path="students/:id" element={<StudentDetails />} />
        <Route path="teachers" element={<TeachersList />} />
        <Route path="teachers/pending" element={<TeachersList defaultTab="pending" />} />
        <Route path="teachers/verified" element={<TeachersList defaultTab="verified" />} />
        <Route path="teachers/:id" element={<TeacherDetails />} />
        <Route path="connections" element={<ConnectionsList />} />
        <Route path="connections/:id" element={<ConnectionDetails />} />
        <Route path="enrollments" element={<EnrollmentsList />} />
        <Route path="enrollments/:id" element={<EnrollmentDetails />} />
        <Route path="content" element={<Navigate to="/content/materials" replace />} />
        <Route path="content/materials" element={<StudyMaterials />} />
        <Route path="content/teacher-announcements" element={<TeacherAnnouncements />} />
        <Route
          path="announcements-promotions"
          element={<Navigate to="/announcements-promotions/announcements" replace />}
        />
        <Route path="announcements-promotions/announcements" element={<AnnouncementsList />} />
        <Route path="announcements-promotions/banners" element={<BannersList />} />
        <Route path="announcements-promotions/create" element={<AnnouncementEditor />} />
        <Route path="reviews" element={<ReviewsList />} />
        <Route path="payments" element={<PaymentsList />} />
        <Route path="payments/:id" element={<PaymentDetails />} />
        <Route path="reports" element={<ReportsList />} />
        <Route path="reports/:id" element={<ReportDetails />} />
        <Route path="audit-logs" element={<AuditLogsList />} />
        <Route path="audit-logs/:id" element={<AuditLogDetails />} />

        {/* Future parts routes placeholder fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
