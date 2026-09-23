import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiLock,
  FiUnlock,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiMail,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { INITIAL_CONNECTIONS } from '../../data/connections';
import { formatDate } from '../../utils/formatters';

export function ConnectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [connection, setConnection] = useState(() => {
    return INITIAL_CONNECTIONS.find((c) => c.id === id) || null;
  });

  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: 'approve', // 'approve' | 'reject'
    notes: '',
  });

  if (!connection) {
    return (
      <div className="py-12">
        <EmptyState
          title="Connection Request Not Found"
          description={`No contact disclosure authorization with ID "${id}" was located.`}
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FiArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/connections')}
            >
              Return to Connections Queue
            </Button>
          }
        />
      </div>
    );
  }

  // Open Approval Modal
  const openApproveModal = () => {
    setActionModal({
      isOpen: true,
      type: 'approve',
      notes: 'Super Admin compliance audit passed. Verified student-parent consent and legitimate batch coaching inquiry.',
    });
  };

  // Open Rejection Modal
  const openRejectModal = () => {
    setActionModal({
      isOpen: true,
      type: 'reject',
      notes: 'Declined by Super Admin due to non-compliance with student protection standards or guardian objection.',
    });
  };

  // Confirm Verification Action
  const handleConfirmAction = () => {
    const { type, notes } = actionModal;
    const nextStatus = type === 'approve' ? 'Approved' : 'Rejected';
    const nextAdminVerif = type === 'approve' ? 'Verified' : 'Rejected';

    const auditEntry = {
      id: `AUD-CON-${Date.now()}`,
      action: type === 'approve' ? 'Super Admin Authorized Disclosure' : 'Super Admin Declined Contact Request',
      by: 'Super Admin',
      timestamp: new Date().toISOString(),
      notes,
    };

    const updatedTimeline = connection.workflowTimeline.map((step) => {
      if (step.step === 3) {
        return {
          ...step,
          status: type === 'approve' ? 'completed' : 'rejected',
          timestamp: new Date().toISOString(),
          note: notes,
        };
      }
      if (step.step === 4) {
        return {
          ...step,
          status: type === 'approve' ? 'completed' : 'rejected',
          timestamp: type === 'approve' ? new Date().toISOString() : null,
          note: type === 'approve' ? 'Contact details unlocked on portal' : 'Contact remains permanently masked',
        };
      }
      return step;
    });

    setConnection((prev) => ({
      ...prev,
      status: nextStatus,
      adminVerification: nextAdminVerif,
      workflowTimeline: updatedTimeline,
      auditLog: [auditEntry, ...(prev.auditLog || [])],
    }));

    setActionModal({ isOpen: false, type: 'approve', notes: '' });

    if (type === 'approve') {
      toast.success(
        'Connection Approved & Unlocked',
        `Mutual telephone contact details have been decrypted and shared between ${connection.teacher.name} and ${connection.student.name}.`
      );
    } else {
      toast.error(
        'Connection Declined',
        `Contact disclosure declined. Phone numbers remain securely locked.`
      );
    }
  };

  const isUnlocked = connection.status === 'Approved';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/connections')}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 mt-1 sm:mt-0"
              aria-label="Back to connections"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-geist text-slate-900">
                  Connection Request
                </h1>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {connection.id}
                </span>
                <StatusBadge status={connection.status} />
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span>Requested on {formatDate(connection.requestDate)}</span>
                <span>·</span>
                <span className="font-medium text-slate-700">
                  {connection.teacher.name} ↔ {connection.student.name}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {connection.status === 'Pending Admin Verification' && (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<FiX className="w-3.5 h-3.5" />}
                  onClick={openRejectModal}
                >
                  Decline Request
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  leftIcon={<FiCheck className="w-3.5 h-3.5" />}
                  onClick={openApproveModal}
                >
                  Authorize & Unlock Contact
                </Button>
              </>
            )}

            {connection.status === 'Approved' && (
              <Badge variant="success" size="lg" dot>
                Contact Channel Unlocked
              </Badge>
            )}

            {connection.status === 'Rejected' && (
              <Badge variant="danger" size="lg" dot>
                Contact Blocked & Shielded
              </Badge>
            )}
          </div>
        </div>

        {/* High-Level Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Student Consent
            </span>
            <span className={`text-sm font-bold font-geist mt-1 flex items-center gap-1 ${
              connection.studentApproval === 'Approved' ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {connection.studentApproval === 'Approved' ? <FiCheckCircle className="w-4 h-4" /> : <FiClock className="w-4 h-4" />}
              {connection.studentApproval}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Super Admin Gate
            </span>
            <span className={`text-sm font-bold font-geist mt-1 flex items-center gap-1 ${
              connection.adminVerification === 'Verified' ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              <FiShield className="w-4 h-4" />
              {connection.adminVerification}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Privacy Status
            </span>
            <span className={`text-sm font-bold font-geist mt-1 flex items-center gap-1 ${
              isUnlocked ? 'text-emerald-700' : 'text-amber-800'
            }`}>
              {isUnlocked ? <FiUnlock className="w-4 h-4 text-emerald-600" /> : <FiLock className="w-4 h-4 text-amber-600" />}
              {isUnlocked ? 'Unlocked & Shared' : 'Protected / Masked'}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Current Stage
            </span>
            <span className="text-sm font-bold font-geist text-slate-900 mt-1 block">
              Step {connection.status === 'Approved' ? '4/4' : connection.status === 'Pending Admin Verification' ? '3/4' : '2/4'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Workflow Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100 flex items-center gap-2">
          <FiClock className="w-4 h-4 text-[#123B66]" />
          4-Step Contact Disclosure Workflow Timeline
        </h2>

        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {connection.workflowTimeline?.map((item) => {
            const isCompleted = item.status === 'completed';
            const isCurrent = item.status === 'current';
            const isRejected = item.status === 'rejected';

            return (
              <div key={item.step} className="relative group text-xs">
                {/* Milestone Node */}
                <div
                  className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono ring-4 ring-white ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#123B66] text-white animate-pulse'
                      : isRejected
                      ? 'bg-danger text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <FiCheck className="w-3.5 h-3.5" /> : isRejected ? <FiX className="w-3.5 h-3.5" /> : item.step}
                </div>

                {/* Milestone Content */}
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.timestamp ? formatDate(item.timestamp) : 'Pending Action'}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed font-medium">
                    {item.note}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                    <span>Actor: <strong className="text-slate-700 font-semibold">{item.actor}</strong></span>
                    <span>·</span>
                    <span className={`font-semibold ${
                      isCompleted ? 'text-emerald-700' : isCurrent ? 'text-amber-700' : isRejected ? 'text-danger' : 'text-slate-400'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Teacher & Student Profiles with Privacy Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teacher Dossier Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 font-geist">
              Teacher Information
            </h2>
            <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              {connection.teacher.id}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Faculty Name</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{connection.teacher.name}</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Subject Specialization</span>
              <p className="font-medium text-slate-800 mt-0.5">{connection.teacher.subject} · {connection.teacher.qualification}</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Registered Email</span>
              <p className="font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                <FiMail className="w-3.5 h-3.5 text-slate-400" />
                {connection.teacher.email}
              </p>
            </div>

            {/* Privacy Visualization for Phone */}
            <div className={`p-3 rounded-lg border text-xs space-y-1 ${
              isUnlocked ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                  {isUnlocked ? <FiUnlock className="text-emerald-700 w-3.5 h-3.5" /> : <FiLock className="text-amber-700 w-3.5 h-3.5" />}
                  Phone Contact Standing
                </span>
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                  isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isUnlocked ? 'UNLOCKED' : 'SHIELDED'}
                </span>
              </div>
              <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                {isUnlocked ? connection.teacher.phone : connection.teacher.maskedPhone}
              </p>
              <p className="text-[10px] text-slate-500">
                {isUnlocked
                  ? 'Contact disclosed to student following Super Admin verification.'
                  : 'Number hidden to prevent unsolicited marketing.'}
              </p>
            </div>
          </div>
        </div>

        {/* Student Dossier Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 font-geist">
              Student Information
            </h2>
            <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              {connection.student.id}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Student Name</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{connection.student.name}</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Class / Institution</span>
              <p className="font-medium text-slate-800 mt-0.5">{connection.student.grade} · {connection.student.school}</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Parent / Guardian</span>
              <p className="font-medium text-slate-800 mt-0.5">{connection.student.guardianName || 'Guardian Verified'}</p>
            </div>

            {/* Privacy Visualization for Phone */}
            <div className={`p-3 rounded-lg border text-xs space-y-1 ${
              isUnlocked ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                  {isUnlocked ? <FiUnlock className="text-emerald-700 w-3.5 h-3.5" /> : <FiLock className="text-amber-700 w-3.5 h-3.5" />}
                  Student Phone Standing
                </span>
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                  isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isUnlocked ? 'UNLOCKED' : 'SHIELDED'}
                </span>
              </div>
              <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                {isUnlocked ? connection.student.phone : connection.student.maskedPhone}
              </p>
              <p className="text-[10px] text-slate-500">
                {isUnlocked
                  ? 'Student telephone unveiled to certified faculty.'
                  : 'Student and guardian numbers shielded under strict privacy SOP.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Reason & Audit Remarks */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100">
          Stated Purpose & Audit History
        </h2>

        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Official Consultation Request Reason</span>
          <p className="text-slate-800 font-medium italic">
            "{connection.reason}"
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Super Admin Audit Trail
          </h3>
          <div className="divide-y divide-slate-100">
            {connection.auditLog?.map((audit) => (
              <div key={audit.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{audit.action}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{audit.notes}</p>
                  <span className="text-[10px] font-mono text-slate-400">By: {audit.by}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                  {formatDate(audit.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approval / Rejection Modal */}
      {actionModal.isOpen && (
        <Modal
          isOpen={actionModal.isOpen}
          onClose={() => setActionModal({ isOpen: false, type: 'approve', notes: '' })}
          title={
            actionModal.type === 'approve'
              ? `Authorize Contact Disclosure — ${connection.id}`
              : `Decline Contact Request — ${connection.id}`
          }
          description={`Between ${connection.teacher.name} and ${connection.student.name}`}
          size="md"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActionModal({ isOpen: false, type: 'approve', notes: '' })}
              >
                Cancel
              </Button>
              <Button
                variant={actionModal.type === 'approve' ? 'success' : 'danger'}
                size="sm"
                onClick={handleConfirmAction}
                leftIcon={actionModal.type === 'approve' ? <FiCheckCircle className="w-4 h-4" /> : <FiXCircle className="w-4 h-4" />}
              >
                {actionModal.type === 'approve' ? 'Authorize & Unlock Contact' : 'Decline Request'}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900">{connection.id}</span>
              <p className="text-slate-600 mt-1">Reason: "{connection.reason}"</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {actionModal.type === 'approve'
                  ? 'Verification Audit Notes'
                  : 'Rejection Reason (Logged for compliance)'}
              </label>
              <textarea
                rows={3}
                required
                value={actionModal.notes}
                onChange={(e) => setActionModal({ ...actionModal, notes: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ConnectionDetails;
