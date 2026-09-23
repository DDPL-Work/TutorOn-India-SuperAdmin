import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { INITIAL_ENROLLMENTS } from '../../data/enrollments';

export function EnrollmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [enrollment, setEnrollment] = useState(() => {
    return INITIAL_ENROLLMENTS.find((e) => e.id === id) || null;
  });

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Batch Capacity Exceeded');

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
          icon={FiBookOpen}
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
  const handleConfirm = () => {
    const updatedSteps = enrollment.workflowSteps.map((s) => {
      if (s.step === 5) return { ...s, status: 'completed', timestamp: 'Today, Just now' };
      if (s.step === 6) return { ...s, status: 'completed', timestamp: 'Today, Just now' };
      return s;
    });

    const newAuditEntry = {
      action: 'Enrollment Confirmed by Super Admin',
      performedBy: 'Super Admin (sudhanshu@tutoron.in)',
      timestamp: 'Just now',
      notes: 'Administrative confirmation granted. Student officially registered in live batch roster.',
    };

    setEnrollment({
      ...enrollment,
      status: 'Confirmed',
      workflowSteps: updatedSteps,
      auditTrail: [newAuditEntry, ...enrollment.auditTrail],
    });

    setConfirmModalOpen(false);
    toast.success(
      'Enrollment Confirmed',
      `Student ${enrollment.student.name} is now authorized for batch ${enrollment.batch.batchCode}.`
    );
  };

  // Handle Super Admin Rejection
  const handleReject = () => {
    const updatedSteps = enrollment.workflowSteps.map((s) => {
      if (s.step === 5) return { ...s, status: 'rejected', timestamp: 'Today, Just now' };
      if (s.step === 6) return { ...s, status: 'rejected', timestamp: 'Cancelled' };
      return s;
    });

    const newAuditEntry = {
      action: 'Enrollment Rejected by Super Admin',
      performedBy: 'Super Admin (sudhanshu@tutoron.in)',
      timestamp: 'Just now',
      notes: `Reason: ${rejectReason || 'Administrative rejection'}. Refund initiated if applicable.`,
    };

    setEnrollment({
      ...enrollment,
      status: 'Rejected',
      workflowSteps: updatedSteps,
      auditTrail: [newAuditEntry, ...enrollment.auditTrail],
    });

    setRejectModalOpen(false);
    toast.error(
      'Enrollment Rejected',
      `Enrollment application ${enrollment.id} has been rejected.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center text-xs">
        <ol className="flex items-center gap-1.5 text-slate-500">
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
              <StatusBadge status={enrollment.status} />
              <Badge variant="navy" size="sm" className="font-mono">
                {enrollment.batch.batchCode}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Submitted on {enrollment.requestDate} • Super Admin Enrollment Review Queue
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

            {enrollment.status === 'Awaiting Confirmation' && (
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

            {enrollment.status === 'Pending' && (
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

      {/* 6-Step Visual Workflow Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold font-geist text-slate-900">
              Student Enrollment Lifecycle Workflow
            </h2>
            <p className="text-xs text-slate-500">
              Multi-stage validation from initial batch browsing through Super Admin confirmation.
            </p>
          </div>
          <Badge
            variant={
              enrollment.status === 'Confirmed'
                ? 'success'
                : enrollment.status === 'Rejected'
                ? 'danger'
                : 'warning'
            }
            size="sm"
          >
            Stage: {enrollment.status}
          </Badge>
        </div>

        {/* Responsive Stepper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {enrollment.workflowSteps.map((stepItem) => {
            const isCompleted = stepItem.status === 'completed';
            const isCurrent = stepItem.status === 'current';
            const isRejected = stepItem.status === 'rejected';

            let stepBg = 'bg-slate-50 border-slate-200 text-slate-500';
            let iconColor = 'text-slate-400';
            let circleBg = 'bg-slate-200 text-slate-600';

            if (isCompleted) {
              stepBg = 'bg-emerald-50/60 border-emerald-200 text-emerald-950';
              iconColor = 'text-emerald-600';
              circleBg = 'bg-emerald-600 text-white';
            } else if (isCurrent) {
              stepBg = 'bg-blue-50/70 border-blue-200 text-blue-950 ring-1 ring-blue-300';
              iconColor = 'text-[#1D4ED8]';
              circleBg = 'bg-[#1D4ED8] text-white animate-pulse';
            } else if (isRejected) {
              stepBg = 'bg-red-50/60 border-red-200 text-red-950';
              iconColor = 'text-red-600';
              circleBg = 'bg-red-600 text-white';
            }

            return (
              <div
                key={stepItem.step}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${stepBg}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${circleBg}`}
                    >
                      {stepItem.step}
                    </span>
                    {isCompleted && <FiCheckCircle className={`w-4 h-4 ${iconColor}`} />}
                    {isCurrent && <FiClock className={`w-4 h-4 ${iconColor}`} />}
                    {isRejected && <FiXCircle className={`w-4 h-4 ${iconColor}`} />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{stepItem.title}</h3>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                      {stepItem.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/50 text-[10px] font-mono text-slate-500 truncate">
                  {stepItem.timestamp}
                </div>
              </div>
            );
          })}
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
                <span className="font-mono text-xs text-slate-400 font-normal">
                  ({enrollment.student.id})
                </span>
              </h2>
              <button
                type="button"
                onClick={() => navigate(`/students/${enrollment.student.id}`)}
                className="text-xs text-[#1D4ED8] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>View Full Student Profile</span>
                <FiExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-start gap-4">
              <img
                src={enrollment.student.avatar}
                alt={enrollment.student.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shrink-0"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 text-xs">
                <div>
                  <span className="text-slate-500 block">Full Name:</span>
                  <span className="font-semibold text-slate-900 text-sm">{enrollment.student.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Grade / Target Exam:</span>
                  <span className="font-medium text-slate-800">
                    {enrollment.student.grade} • {enrollment.student.targetExam}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone:</span>
                  <span className="font-mono text-slate-800">{enrollment.student.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email Address:</span>
                  <span className="text-slate-800">{enrollment.student.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location:</span>
                  <span className="text-slate-800">{enrollment.student.city}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Parent / Guardian:</span>
                  <span className="text-slate-800">
                    {enrollment.student.parentName} ({enrollment.student.parentPhone})
                  </span>
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
                onClick={() => navigate(`/teachers/${enrollment.teacher.id}`)}
                className="text-xs text-[#1D4ED8] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>View Teacher Profile</span>
                <FiExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <img
                src={enrollment.teacher.avatar}
                alt={enrollment.teacher.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-slate-900">{enrollment.teacher.name}</h3>
                  <Badge variant="navy" size="sm" className="font-mono text-[10px]">
                    {enrollment.teacher.id}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">{enrollment.teacher.qualification}</p>
                <p className="text-[11px] text-slate-500">
                  Experience: {enrollment.teacher.experience} • Subject Specialist in {enrollment.teacher.subjects.join(', ')}
                </p>
              </div>
            </div>

            {/* Batch Details Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{enrollment.batch.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                    <span>{enrollment.batch.batchCode}</span>
                    <span>•</span>
                    <span>{enrollment.batch.mode}</span>
                  </div>
                </div>
                <Badge variant="info" size="sm">
                  {enrollment.batch.subject}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Schedule</span>
                  <span className="font-medium text-slate-800">{enrollment.batch.schedule}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Timings</span>
                  <span className="font-medium text-slate-800">{enrollment.batch.timings}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Batch Capacity</span>
                  <span className="font-medium text-slate-800">
                    {enrollment.batch.enrolledSeats} / {enrollment.batch.totalSeats} seats
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Course Fee</span>
                  <span className="font-bold text-slate-900">{enrollment.batch.fee}</span>
                </div>
              </div>
            </div>

            {/* Demo Class Feedback */}
            {enrollment.demoSession && (
              <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                    <FiCheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    Demo Class Completed
                  </span>
                  <span className="text-slate-500 text-[11px]">{enrollment.demoSession.date}</span>
                </div>
                <p className="text-slate-700">Topic: {enrollment.demoSession.topic}</p>
                <p className="text-slate-600 italic mt-0.5">&quot;{enrollment.demoSession.feedback}&quot;</p>
              </div>
            )}
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
                  {enrollment.paymentDetails.amount}
                </span>
              </div>

              <div className="space-y-2 pt-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <StatusBadge status={enrollment.paymentStatus} />
                </div>
                <div className="flex justify-between">
                  <span>Payment Gateway:</span>
                  <span className="font-medium text-slate-800">{enrollment.paymentDetails.gateway}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium text-slate-800">{enrollment.paymentDetails.method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-[11px] text-slate-800 font-medium">
                    {enrollment.paymentDetails.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Invoice Number:</span>
                  <span className="font-mono text-[11px] text-slate-800">
                    {enrollment.paymentDetails.invoiceNumber}
                  </span>
                </div>
                {enrollment.paymentDetails.paidAt && (
                  <div className="flex justify-between">
                    <span>Settlement Time:</span>
                    <span className="text-slate-800">{enrollment.paymentDetails.paidAt}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin Decision Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FiShield className="w-4 h-4 text-[#123B66]" />
              <span>Super Admin Decision</span>
            </h2>

            {enrollment.status === 'Awaiting Confirmation' ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  The student has attended the required demo class and payment has been captured. Super Admin authorization confirms official seat allocation.
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
                  <span className="font-semibold text-slate-900 mt-0.5 block">{enrollment.status}</span>
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
              {enrollment.auditTrail.map((log, index) => (
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
              Confirming will officially mark seat #{enrollment.batch.enrolledSeats + 1} for student{' '}
              <strong className="text-emerald-950">{enrollment.student.name}</strong> in batch{' '}
              <strong className="font-mono">{enrollment.batch.batchCode}</strong>.
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
