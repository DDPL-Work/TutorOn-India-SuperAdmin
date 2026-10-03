import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchEnrollmentById } from '../../API/thunks/enrollmentsThunks';
import {
  FiArrowLeft,
  FiClock,
  FiCreditCard,
  FiShield,
  FiExternalLink,
  FiStar,
  FiBookOpen,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatDateTime } from '../../utils/formatters';

export function EnrollmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useDispatch();

  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    dispatch(fetchEnrollmentById(id))
      .unwrap()
      .then((data) => setEnrollment(data?.data || data))
      .catch((err) => {
        toast.error('Fetch Failed', err?.toString() || 'Could not fetch enrollment details.');
        setEnrollment(null);
      })
      .finally(() => setIsLoading(false));
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#123B66]"></div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/enrollments')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Enrollments
        </button>
        <EmptyState
          title="Enrollment Record Not Found"
          description={`No enrollment application matches reference ID ${id}.`}
          action={
            <Button variant="primary" size="sm" onClick={() => navigate('/enrollments')}>
              Return to Enrollments Directory
            </Button>
          }
        />
      </div>
    );
  }

  const enrollmentDisplayCode = enrollment.enrollment_code || 'ENR-CODE';
  const batchDisplayCode = enrollment.batch_code || 'BATCH-CODE';

  const studentFullName =
    enrollment.student_name ||
    enrollment.student?.user?.full_name ||
    `${enrollment.student?.user?.first_name || ''} ${enrollment.student?.user?.last_name || ''}`.trim() ||
    'Student';

  const studentProfilePhoto =
    enrollment.student_avatar || enrollment.student?.user?.profile_photo;

  const teacherDisplayName =
    enrollment.teacher_name ||
    enrollment.batch?.teacher?.display_name ||
    enrollment.batch?.teacher?.full_name ||
    enrollment.batch?.teacher?.name ||
    'Faculty Member';

  const teacherProfilePhoto =
    enrollment.teacher_avatar || enrollment.batch?.teacher?.profile_photo;

  // Synthesize audit events from timestamps if explicit auditTrail is not provided
  const auditLogs = enrollment.auditTrail || [
    ...(enrollment.cancelled_at
      ? [
          {
            action: 'Enrollment Cancelled',
            timestamp: formatDateTime(enrollment.cancelled_at),
            performedBy: 'Student / System',
            notes: 'Enrollment request was marked as cancelled.',
          },
        ]
      : []),
    ...(enrollment.approved_at
      ? [
          {
            action: 'Enrollment Approved',
            timestamp: formatDateTime(enrollment.approved_at),
            performedBy: 'Faculty / Admin',
            notes: `Admitted into batch ${batchDisplayCode}.`,
          },
        ]
      : []),
    ...(enrollment.requested_at
      ? [
          {
            action: 'Enrollment Requested',
            timestamp: enrollment.formatted_date || formatDateTime(enrollment.requested_at),
            performedBy: studentFullName,
            notes: `Application code ${enrollmentDisplayCode} generated with status: ${enrollment.status_display || enrollment.status}.`,
          },
        ]
      : []),
    ...(enrollment.batch?.created_at
      ? [
          {
            action: 'Batch Published',
            timestamp: formatDateTime(enrollment.batch.created_at),
            performedBy: teacherDisplayName,
            notes: `Batch ${batchDisplayCode} opened with capacity of ${enrollment.batch.capacity || 0} seats.`,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="hidden sm:flex items-center text-xs">
        <ol className="flex items-center gap-1.5 text-slate-500 flex-wrap">
          <li>
            <Link to="/dashboard" className="hover:text-[#123B66] hover:underline font-medium">
              Dashboard
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li>
            <Link to="/enrollments" className="hover:text-[#123B66] hover:underline font-medium">
              Enrollments
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li className="font-semibold text-slate-800 font-mono">{enrollmentDisplayCode}</li>
        </ol>
      </nav>

      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold font-geist text-slate-900 tracking-tight">
                Enrollment Code: <span className="font-mono text-[#123B66]">{enrollmentDisplayCode}</span>
              </h1>
              <StatusBadge
                status={enrollment.status}
                label={enrollment.status_display}
              />
              <StatusBadge
                status={enrollment.payment_status}
                label={enrollment.payment_status_display}
              />
              <Badge variant="navy" size="sm" className="font-mono">
                {batchDisplayCode}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Submitted on {enrollment.formatted_date || (enrollment.requested_at ? formatDate(enrollment.requested_at) : 'N/A')} • Super Admin Enrollment Oversight
            </p>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/enrollments')}
              leftIcon={<FiArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to List
            </Button>
          </div>
        </div>
      </div>

      {/* 2-Column Dossiers Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Student, Teacher & Batch Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Dossier */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2">
                <span>Student Information</span>
                {enrollment.student?.student_code && (
                  <span className="font-mono text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {enrollment.student.student_code}
                  </span>
                )}
              </h2>
              {enrollment.student?.id && (
                <button
                  type="button"
                  onClick={() => navigate(`/students/${enrollment.student.id}`)}
                  className="text-xs text-[#1D4ED8] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>View Full Student Profile</span>
                  <FiExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-start gap-4">
              <Avatar
                name={studentFullName}
                src={studentProfilePhoto}
                size="lg"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 text-xs">
                <div>
                  <span className="text-slate-500 block">Full Name:</span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {studentFullName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Class / Academic Goal:</span>
                  <span className="font-medium text-slate-800">
                    {enrollment.student_grade || enrollment.student?.education_level || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">School / Institution:</span>
                  <span className="font-medium text-slate-800">
                    {enrollment.student?.school_name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location:</span>
                  <span className="text-slate-800">
                    {enrollment.student?.city ? `${enrollment.student.city}, ${enrollment.student.state || 'India'}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Preferred Medium:</span>
                  <span className="text-slate-800 font-medium">
                    {enrollment.student?.preferred_language || 'Hindi / English'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Subjects of Interest:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {(enrollment.student?.subjects_of_interest || []).length > 0 ? (
                      enrollment.student.subjects_of_interest.map((sub, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                        >
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">None specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher & Batch Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2">
                <span>Faculty & Batch Specification</span>
              </h2>
              {enrollment.batch?.teacher?.id && (
                <button
                  type="button"
                  onClick={() => navigate(`/teachers/${enrollment.batch.teacher.id}`)}
                  className="text-xs text-[#1D4ED8] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>View Teacher Profile</span>
                  <FiExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <Avatar
                name={teacherDisplayName}
                src={teacherProfilePhoto}
                size="md"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-semibold text-slate-900">
                    {teacherDisplayName}
                  </h3>
                  {enrollment.batch?.teacher?.average_rating && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800">
                      <FiStar className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{enrollment.batch.teacher.average_rating}</span>
                      <span className="text-slate-400 font-normal">
                        ({enrollment.batch.teacher.total_reviews ?? 0} reviews)
                      </span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {enrollment.batch?.teacher?.qualification || 'N/A'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {enrollment.batch?.teacher?.experience_years ? `${enrollment.batch.teacher.experience_years} Years Experience` : ''}
                  {enrollment.batch?.teacher?.subjects ? ` • Specialist in ${enrollment.batch.teacher.subjects.join(', ')}` : ''}
                </p>
              </div>
            </div>

            {/* Batch Details Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {enrollment.batch_title || enrollment.batch?.title || 'N/A'}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                    <span className="font-semibold text-slate-700">{batchDisplayCode}</span>
                    <span>•</span>
                    <span>{enrollment.batch?.language || 'Language'}</span>
                    <span>•</span>
                    <span>{enrollment.batch?.grade_level || 'Grade'}</span>
                  </div>
                </div>
                <Badge variant="info" size="sm">
                  {enrollment.teacher_subject || enrollment.batch?.subject || 'Course'}
                </Badge>
              </div>

              {enrollment.batch?.description && (
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {enrollment.batch.description}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Start Date</span>
                  <span className="font-medium text-slate-800">
                    {enrollment.batch?.start_date ? formatDate(enrollment.batch.start_date) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Timings</span>
                  <span className="font-medium text-slate-800">
                    {enrollment.batch?.timing || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Batch Capacity</span>
                  <span className="font-medium text-slate-800">
                    {enrollment.batch?.enrolled_count ?? enrollment.batch?.student_summary?.enrolled_students ?? 0} / {enrollment.batch?.capacity ?? 0} seats
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ({enrollment.batch?.available_seats ?? enrollment.batch?.student_summary?.available_seats ?? 0} open)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Course Fee</span>
                  <span className="font-bold text-slate-900">
                    {enrollment.formatted_price || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Financials, Standing & Audit */}
        <div className="space-y-6">
          {/* Payment & Invoice Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FiCreditCard className="w-4 h-4 text-[#123B66]" />
              <span>Financial & Payment Details</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-600 font-medium block">Total Tuition Fee</span>
                  <span className="text-[11px] text-slate-400">
                    {enrollment.batch?.is_free ? 'Free bridge cohort' : 'Standard admission fee'}
                  </span>
                </div>
                <span className="text-base font-bold text-slate-900 font-geist">
                  {enrollment.formatted_price || 'N/A'}
                </span>
              </div>

              <div className="space-y-2 pt-1 text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Payment Status:</span>
                  <StatusBadge
                    status={enrollment.payment_status}
                    label={enrollment.payment_status_display}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Batch Code:</span>
                  <span className="font-mono font-medium text-slate-800">{batchDisplayCode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment Standing & Review Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FiShield className="w-4 h-4 text-[#123B66]" />
              <span>Enrollment Standing</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Enrollment Code:</span>
                  <span className="font-mono font-bold text-slate-900">{enrollmentDisplayCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Lifecycle Status:</span>
                  <StatusBadge
                    status={enrollment.status}
                    label={enrollment.status_display}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Payment Status:</span>
                  <StatusBadge
                    status={enrollment.payment_status}
                    label={enrollment.payment_status_display}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Enrollment admission and seat allocation are managed between the faculty member and student upon fee clearance. Super Admin maintains read-only oversight for compliance and records audit.
              </p>
            </div>
          </div>

          {/* Audit History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <FiClock className="w-4 h-4 text-slate-500" />
              <span>Audit History</span>
            </h2>

            <div className="space-y-3">
              {auditLogs.map((log, index) => (
                <div
                  key={index}
                  className="text-xs pl-3 border-l-2 border-slate-200 space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{log.performedBy}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5 bg-slate-50 p-1.5 rounded">
                    {log.notes}
                  </p>
                </div>
              ))}

              {!auditLogs.length && (
                <div className="p-4 text-center border border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
                  No audit logs available for this enrollment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentDetails;
