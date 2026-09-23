import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiMapPin,
  FiStar,
  FiBookOpen,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiShield,
  FiFileText,
  FiDownload,
  FiCheck,
  FiX,
  FiLayers,
  FiExternalLink,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { INITIAL_TEACHERS } from '../../data/teachers';
import { formatDate } from '../../utils/formatters';

export function TeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [teacher, setTeacher] = useState(() => {
    return INITIAL_TEACHERS.find((t) => t.id === id) || null;
  });

  const [activeTab, setActiveTab] = useState('overview');

  // Verification Action Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: 'approve', // 'approve' | 'reject'
    notes: '',
  });

  if (!teacher) {
    return (
      <div className="py-12">
        <EmptyState
          title="Teacher Profile Not Found"
          description={`No faculty record matching reference ID "${id}" was located in TutorOn India.`}
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FiArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/teachers')}
            >
              Return to Teachers Directory
            </Button>
          }
        />
      </div>
    );
  }

  // Open Approval Confirmation
  const openApproveModal = () => {
    setActionModal({
      isOpen: true,
      type: 'approve',
      notes: 'Super Admin manual audit completed. Verified Ph.D/Master degrees, government identity proofs, and past institutional teaching records.',
    });
  };

  // Open Rejection Confirmation
  const openRejectModal = () => {
    setActionModal({
      isOpen: true,
      type: 'reject',
      notes: 'Credentials uploaded require formal university degree certificate and clear KYC scan.',
    });
  };

  // Confirm Verification Action
  const handleConfirmAction = () => {
    const { type, notes } = actionModal;
    const nextStatus = type === 'approve' ? 'Verified' : 'Rejected';

    const newAudit = {
      id: `AUD-${Date.now()}`,
      action: type === 'approve' ? 'Faculty Verified' : 'Faculty Verification Declined',
      by: 'Super Admin',
      timestamp: new Date().toISOString(),
      notes,
    };

    setTeacher((prev) => ({
      ...prev,
      verificationStatus: nextStatus,
      verificationAudit: [newAudit, ...(prev.verificationAudit || [])],
    }));

    setActionModal({ isOpen: false, type: 'approve', notes: '' });

    if (type === 'approve') {
      toast.success(
        'Teacher Certified & Verified',
        `${teacher.name} has been granted full faculty publishing credentials.`
      );
    } else {
      toast.error(
        'Verification Declined',
        `${teacher.name} status updated to Rejected. Resubmission notification dispatched.`
      );
    }
  };

  const tabs = [
    { id: 'overview', label: 'Profile Overview', icon: <FiFileText className="w-3.5 h-3.5" /> },
    { id: 'verification', label: `Verification Info (${teacher.documents?.length || 0})`, icon: <FiShield className="w-3.5 h-3.5" /> },
    { id: 'academics', label: 'Subjects & Exam Expertise', icon: <FiBookOpen className="w-3.5 h-3.5" /> },
    { id: 'batches', label: `Batches & Students (${teacher.activeBatches?.length || 0})`, icon: <FiLayers className="w-3.5 h-3.5" /> },
    { id: 'audit', label: 'Verification Audit Trail', icon: <FiClock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/teachers')}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 mt-1 sm:mt-0"
              aria-label="Back to teachers"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>

            <Avatar name={teacher.name} size="lg" status="online" />

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-geist text-slate-900">
                  {teacher.name}
                </h1>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {teacher.id}
                </span>
                <StatusBadge status={teacher.verificationStatus} />
              </div>

              <div className="flex items-center gap-3 sm:gap-4 flex-wrap mt-1 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{teacher.qualification.split(',')[0]}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <FiMapPin className="w-3.5 h-3.5 text-slate-400" />
                  {teacher.city}, {teacher.state}
                </span>
                <span>·</span>
                <span className="font-mono text-[11px]">Applied {formatDate(teacher.joinedDate)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FiDownload className="w-3.5 h-3.5" />}
              onClick={() => toast.info('Exporting Dossier', `Exporting faculty dossier for ${teacher.name}.`)}
            >
              Export
            </Button>

            {teacher.verificationStatus === 'Pending Verification' && (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<FiX className="w-3.5 h-3.5" />}
                  onClick={openRejectModal}
                >
                  Decline
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  leftIcon={<FiCheck className="w-3.5 h-3.5" />}
                  onClick={openApproveModal}
                >
                  Approve & Certify
                </Button>
              </>
            )}

            {teacher.verificationStatus === 'Verified' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FiXCircle className="w-3.5 h-3.5 text-danger" />}
                onClick={openRejectModal}
              >
                Revoke Verification
              </Button>
            )}

            {teacher.verificationStatus === 'Rejected' && (
              <Button
                variant="success"
                size="sm"
                leftIcon={<FiCheckCircle className="w-3.5 h-3.5" />}
                onClick={openApproveModal}
              >
                Re-Verify Faculty
              </Button>
            )}
          </div>
        </div>

        {/* High-Level Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Teaching Experience
            </span>
            <span className="text-sm sm:text-base font-bold font-geist text-slate-900 mt-0.5 block truncate">
              {teacher.experience}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Student Rating
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-geist text-slate-900">
                {teacher.rating.toFixed(2)}
              </span>
              <FiStar className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs text-slate-400 font-mono">({teacher.ratingCount} reviews)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Students Mentored
            </span>
            <span className="text-xl font-bold font-geist text-emerald-700 mt-0.5 block font-mono">
              {teacher.studentsTaught.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Compliance Status
            </span>
            <div className="mt-1">
              <StatusBadge status={teacher.verificationStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#123B66] text-[#0B1F3A] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Profile Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-5">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100">
              Biography & Teaching Philosophy
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-100">
              "{teacher.bio}"
            </p>

            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pt-2">
              Contact & Platform Standing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Email Address</span>
                <p className="font-medium text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-slate-400" />
                  {teacher.email}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Direct Phone</span>
                <p className="font-mono font-medium text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                  {teacher.phone}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Base Hourly Rate</span>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">
                  ₹{teacher.hourlyRate.toLocaleString('en-IN')} / hr
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Language Fluency</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {teacher.languages.join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Snapshot Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-[#123B66]" />
              Super Admin Gate
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">KYC Status</span>
                <Badge variant={teacher.verificationStatus === 'Verified' ? 'success' : 'warning'} size="sm" dot>
                  {teacher.verificationStatus}
                </Badge>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Active Batches</span>
                <span className="font-mono font-medium text-slate-800">{teacher.activeBatches?.length || 0} batches</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Total Enrolled</span>
                <span className="font-mono font-medium text-slate-800">
                  {teacher.activeBatches?.reduce((acc, b) => acc + b.studentsEnrolled, 0) || 0} students
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-[#0B1F3A]">Strict Contact Guard</p>
              <p>
                TutorOn India prevents direct exchange of tutor phone numbers until the student approves and Super Admin certifies the consultation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Verification Info & Uploaded Documents */}
      {activeTab === 'verification' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-geist">
                Uploaded Credentials & Verification Dossier
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect official degree certificates, government identity documents, and past institutional service letters.
              </p>
            </div>
            <StatusBadge status={teacher.verificationStatus} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacher.documents?.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-white shadow-2xs flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${doc.verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <FiFileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 leading-snug">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {doc.type}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600">
                        Status: <strong className={doc.verified ? 'text-emerald-700' : 'text-amber-700'}>{doc.status}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toast.info('Document Viewer', `Viewing ${doc.name} in secure sandbox.`)}
                  className="text-xs font-semibold text-[#123B66] hover:underline flex items-center gap-1 shrink-0 p-1 cursor-pointer"
                >
                  <span>Inspect</span>
                  <FiExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {teacher.verificationStatus === 'Pending Verification' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3">
                <FiClock className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Awaiting Super Admin Certification
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Verify all university marks and photo IDs before publishing teacher profile to students.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={openRejectModal}>
                  Decline
                </Button>
                <Button variant="success" size="sm" onClick={openApproveModal}>
                  Approve Faculty
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Subjects & Exam Expertise */}
      {activeTab === 'academics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100">
              Teaching Subjects
            </h2>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.map((sub, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-[#123B66] border border-blue-200"
                >
                  {sub}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 pt-2 leading-relaxed">
              Teacher is authorized to teach classes for secondary, senior secondary, and competitive coaching cohorts.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100">
              Competitive Exam Specialization
            </h2>
            <div className="flex flex-wrap gap-2">
              {teacher.examExpertise.map((exam, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {exam}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 pt-2 leading-relaxed">
              Specialized curriculum alignments certified for national competitive examinations.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Batches & Enrolled Students */}
      {activeTab === 'batches' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 font-geist">
              Live & Scheduled Coaching Batches
            </h2>
            <Badge variant="navy" size="sm">
              {teacher.activeBatches?.length || 0} Batches
            </Badge>
          </div>

          {teacher.activeBatches && teacher.activeBatches.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {teacher.activeBatches.map((batch) => (
                <div key={batch.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#123B66]">{batch.id}</span>
                      <h3 className="font-bold text-slate-900">{batch.name}</h3>
                    </div>
                    <p className="text-slate-500">
                      Capacity: <strong className="text-slate-800">{batch.studentsEnrolled} / {batch.maxCapacity} students</strong>
                    </p>
                  </div>

                  <div className="w-48">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Seat Occupancy</span>
                      <span className="font-mono font-bold text-slate-800">
                        {Math.round((batch.studentsEnrolled / batch.maxCapacity) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#123B66] rounded-full"
                        style={{ width: `${(batch.studentsEnrolled / batch.maxCapacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Active Batches"
              description="This teacher has not yet announced or scheduled any coaching batches on TutorOn India."
            />
          )}
        </div>
      )}

      {/* Tab 5: Verification Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5">
          <h2 className="text-sm font-bold text-slate-900 font-geist pb-3 border-b border-slate-100 mb-4">
            Super Admin Verification Audit History
          </h2>

          <div className="space-y-4">
            {teacher.verificationAudit?.map((audit) => (
              <div key={audit.id} className="flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#123B66] shrink-0 mt-0.5 border border-slate-200">
                  <FiClock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">{audit.action}</p>
                    <span className="text-[10px] font-mono text-slate-400">
                      {formatDate(audit.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{audit.notes}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    Audited by: {audit.by} · Reference: {audit.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Approval / Rejection Modal */}
      {actionModal.isOpen && (
        <Modal
          isOpen={actionModal.isOpen}
          onClose={() => setActionModal({ isOpen: false, type: 'approve', notes: '' })}
          title={
            actionModal.type === 'approve'
              ? `Approve & Certify Faculty — ${teacher.name}`
              : `Decline Verification — ${teacher.name}`
          }
          description={`ID: ${teacher.id} · Applied ${formatDate(teacher.joinedDate)}`}
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
                {actionModal.type === 'approve' ? 'Confirm & Certify Faculty' : 'Decline Verification'}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900 text-sm">{teacher.name}</span>
              <p className="text-slate-600 mt-1 font-medium">{teacher.qualification}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">{teacher.experience}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {actionModal.type === 'approve'
                  ? 'Verification Audit Notes (Recorded into official compliance log)'
                  : 'Rejection Reason (Dispatched to Teacher for Document Resubmission)'}
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

export default TeacherDetails;
