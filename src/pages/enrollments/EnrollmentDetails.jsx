import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchEnrollmentById, approveEnrollment, rejectEnrollment } from '../../API/thunks/enrollmentsThunks';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCreditCard,
  FiBookOpen,
  FiCheck,
  FiX,
  FiShield,
  FiExternalLink,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';


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
      .then((data) => setEnrollment(data))
      .catch((err) => {
        toast.error('Fetch Failed', err?.toString() || 'Could not fetch enrollment details.');
        setEnrollment(null);
      })
      .finally(() => setIsLoading(false));
  }, [dispatch, id]);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Batch Capacity Exceeded');

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

  // Handle Super Admin Confirmation
  const handleConfirm = async () => {
    try {
      await dispatch(approveEnrollment(id)).unwrap();
      
      // Re-fetch to get updated status and audit logs
      setIsLoading(true);
      const data = await dispatch(fetchEnrollmentById(id)).unwrap();
      setEnrollment(data);
        
      setConfirmModalOpen(false);
      toast.success(
        'Enrollment Confirmed',
        `Student is now authorized for batch ${enrollment.batch_code || ''}.`
      );
    } catch (err) {
      toast.error('Confirmation Failed', err?.toString() || 'Action could not be completed.');
    }
  };

  // Handle Super Admin Rejection
  const handleReject = async () => {
    try {
      await dispatch(rejectEnrollment({ id, notes: rejectReason })).unwrap();
      
      setIsLoading(true);
      const data = await dispatch(fetchEnrollmentById(id)).unwrap();
      setEnrollment(data);

      setRejectModalOpen(false);
      toast.error(
        'Enrollment Rejected',
        `Enrollment application ${enrollment.id} has been rejected.`
      );
    } catch (err) {
      toast.error('Rejection Failed', err?.toString() || 'Action could not be completed.');
    }
  };

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
          <li className="font-semibold text-slate-800 font-mono">{enrollment.id}</li>
        </ol>
      </nav>

      {/* Header and Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold font-geist text-slate-900 tracking-tight">
                Enrollment Dossier: <span className="font-mono text-[#123B66]">{enrollment.id}</span>
              </h1>
              <StatusBadge status={enrollment.status === 'ACTIVE' ? 'Confirmed' : enrollment.status === 'REJECTED' || enrollment.status === 'CANCELLED' ? 'Rejected' : 'Pending'} />
              <Badge variant="navy" size="sm" className="font-mono">
                {enrollment.batch_code || enrollment.enrollment_code || 'N/A'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Submitted on {enrollment.formatted_date || 'N/A'} • Super Admin Enrollment Review Queue
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/enrollments')}
              leftIcon={<FiArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to List
            </Button>

            {enrollment.status === 'REQUESTED' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setConfirmModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  leftIcon={<FiCheck className="w-3.5 h-3.5" />}
                >
                  Confirm Enrollment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectModalOpen(true)}
                  className="text-red-600 hover:bg-red-50 hover:border-red-300"
                  leftIcon={<FiX className="w-3.5 h-3.5" />}
                >
                  Reject
                </Button>
              </>
            )}

            {enrollment.status === 'PENDING' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setConfirmModalOpen(true)}
                className="bg-[#123B66] hover:bg-[#0B1F3A] text-white"
              >
                Authorize Request
              </Button>
            )}
          </div>
        </div>
      </div>

        {/* Workflow Component omitted for brevity, logic needs actual backend steps to function completely */}

      {/* 2-Column Dossiers Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Student, Teacher & Batch Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Dossier */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2">
                <span>Student Information</span>
                <span className="font-mono text-xs text-slate-400 font-normal">
                  ({enrollment.student?.id})
                </span>
              </h2>
              <button
                type="button"
                onClick={() => navigate(`/students/${enrollment.student?.id}`)}
                className="text-xs text-[#1D4ED8] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>View Full Student Profile</span>
                <FiExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-start gap-4">
              <img
                src={enrollment.student_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.student_name)}&background=F1F5F9&color=64748B`}
                alt={enrollment.student_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shrink-0"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 text-xs">
                <div>
                  <span className="text-slate-500 block">Full Name:</span>
                  <span className="font-semibold text-slate-900 text-sm">{enrollment.student_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Grade:</span>
                  <span className="font-medium text-slate-800">
                    {enrollment.student_grade || enrollment.student?.education_level || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location:</span>
                  <span className="text-slate-800">{enrollment.student?.city || 'N/A'}</span>
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
              <button
                type="button"
                onClick={() => navigate(`/teachers/${enrollment.batch?.teacher?.id}`)}
                className="text-xs text-[#1D4ED8] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>View Teacher Profile</span>
                <FiExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <img
                src={enrollment.teacher_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.teacher_name)}&background=F1F5F9&color=64748B`}
                alt={enrollment.teacher_name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-slate-900">{enrollment.teacher_name || 'N/A'}</h3>
                </div>
                <p className="text-xs text-slate-600">{enrollment.batch?.teacher?.qualification || 'N/A'}</p>
                <p className="text-[11px] text-slate-500">
                  Experience: {enrollment.batch?.teacher?.experience_years || 'N/A'} Years • Subject Specialist in {(enrollment.batch?.teacher?.subjects || []).join(', ')}
                </p>
              </div>
            </div>

            {/* Batch Details Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{enrollment.batch_title || 'N/A'}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                    <span>{enrollment.batch_code || 'N/A'}</span>
                    <span>•</span>
                    <span>Online</span>
                  </div>
                </div>
                <Badge variant="info" size="sm">
                  {enrollment.teacher_subject || 'N/A'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Schedule</span>
                  <span className="font-medium text-slate-800">{enrollment.batch?.start_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Timings</span>
                  <span className="font-medium text-slate-800">{enrollment.batch?.timing || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Batch Capacity</span>
                  <span className="font-medium text-slate-800">
                    {enrollment.batch?.enrolled_count || 0} / {enrollment.batch?.capacity || 0} seats
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Course Fee</span>
                  <span className="font-bold text-slate-900">{enrollment.formatted_price || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Financials, Admin Decision & Audit */}
        <div className="space-y-6">
          {/* Payment & Invoice Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FiCreditCard className="w-4 h-4 text-[#123B66]" />
              <span>Financial & Payment Details</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600 font-medium">Total Tuition Fee</span>
                <span className="text-base font-bold text-slate-900 font-geist">
                  {enrollment.formatted_price || 'N/A'}
                </span>
              </div>

              <div className="space-y-2 pt-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <StatusBadge status={enrollment.payment_status === 'PAID' ? 'Confirmed' : 'Pending'} />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Decision Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FiShield className="w-4 h-4 text-[#123B66]" />
              <span>Super Admin Decision</span>
            </h2>

            {enrollment.status === 'REQUESTED' ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Super Admin authorization confirms official seat allocation.
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setConfirmModalOpen(true)}
                    className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
                    leftIcon={<FiCheck className="w-4 h-4" />}
                  >
                    Confirm & Allocate Seat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRejectModalOpen(true)}
                    className="w-full justify-center text-red-600 hover:bg-red-50 hover:border-red-300"
                    leftIcon={<FiX className="w-4 h-4" />}
                  >
                    Reject Enrollment Request
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Current Status:</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{enrollment.status_display || enrollment.status}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  This enrollment request has been finalized. Changes require Super Admin supervisory override.
                </p>
              </div>
            )}
          </div>

          {/* Audit History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <FiClock className="w-4 h-4 text-slate-500" />
              <span>Audit History</span>
            </h2>

            <div className="space-y-3">
              {(enrollment.auditTrail || []).map((log, index) => (
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
              
              {!(enrollment.auditTrail?.length) && (
                <div className="p-4 text-center border border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
                  No audit logs available for this enrollment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Student Enrollment"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
            <p className="font-semibold text-emerald-900">Authorize Batch Enrollment</p>
            <p className="mt-1 text-emerald-700">
              Confirming will officially allocate a seat for student{' '}
              <strong className="text-emerald-950">{enrollment.student_name}</strong> in batch{' '}
              <strong className="font-mono">{enrollment.batch_code || ''}</strong>.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              leftIcon={<FiCheck className="w-3.5 h-3.5" />}
            >
              Confirm Enrollment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Enrollment Request"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold text-red-900">Administrative Rejection</p>
            <p className="mt-1 text-red-700">
              Provide a valid reason for rejecting this application. Both student and teacher will receive formal notice.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="modal-rejection-reason" className="block font-semibold text-slate-700">
              Select Rejection Reason
            </label>
            <select
              id="modal-rejection-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
            >
              <option value="Batch Capacity Exceeded">Batch Capacity Exceeded (Seats Full)</option>
              <option value="Payment Verification Failed">Payment Verification Failed / Mismatched</option>
              <option value="Course Prerequisite Not Met">Course Prerequisite / Grade Requirement Not Met</option>
              <option value="Student Schedule Conflict">Student Requested Cancellation due to Schedule Conflict</option>
              <option value="Teacher Roster Closed">Teacher Closed Batch Roster</option>
              <option value="Other Administrative Reason">Other Administrative Reason</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              leftIcon={<FiX className="w-3.5 h-3.5" />}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default EnrollmentDetails;
