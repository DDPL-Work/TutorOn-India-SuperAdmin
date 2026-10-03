import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchTeacherById, approveTeacher, rejectTeacher } from '../../API/thunks/teachersThunks';
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
  FiVideo,
  FiAward,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatCurrency } from '../../utils/formatters';

export function TeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const dispatch = useDispatch();
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    dispatch(fetchTeacherById(id))
      .unwrap()
      .then((data) => {
        setTeacher(data?.data || data);
      })
      .catch((err) => {
        toast.error('Fetch Failed', err?.toString() || 'Could not fetch teacher details.');
        setTeacher(null);
      })
      .finally(() => setIsLoading(false));
  }, [dispatch, id]);

  const [activeTab, setActiveTab] = useState('overview');

  // Verification Action Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: 'approve', // 'approve' | 'reject'
    notes: '',
  });

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#123B66]"></div>
      </div>
    );
  }

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

  const teacherName =
    teacher.display_name ||
    teacher.full_name ||
    `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() ||
    'Teacher';

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
  const handleConfirmAction = async () => {
    const { type, notes } = actionModal;
    const verificationId = teacher.verification?.id || teacher.verification_id || id;

    try {
      if (type === 'approve') {
        await dispatch(approveTeacher({ id: verificationId, admin_notes: notes })).unwrap();
        toast.success(
          'Teacher Certified & Verified',
          `${teacherName} has been granted full faculty publishing credentials.`
        );
      } else {
        await dispatch(rejectTeacher({ id: verificationId, rejection_reason: notes, admin_note: 'Rejected via dashboard' })).unwrap();
        toast.error(
          'Verification Declined',
          `${teacherName} status updated to Rejected. Resubmission notification dispatched.`
        );
      }

      // Re-fetch to get updated status and audit logs
      setIsLoading(true);
      dispatch(fetchTeacherById(id))
        .unwrap()
        .then((data) => setTeacher(data?.data || data))
        .finally(() => setIsLoading(false));
    } catch (err) {
      toast.error(`${type === 'approve' ? 'Approval' : 'Rejection'} Failed`, err?.toString() || 'Action could not be completed.');
    } finally {
      setActionModal({ isOpen: false, type: 'approve', notes: '' });
    }
  };

  const batchesList = teacher.batches || [];
  const totalEnrolledAcrossBatches = batchesList.reduce(
    (acc, b) => acc + (b.student_summary?.enrolled_students ?? b.students?.length ?? 0),
    0
  );

  const tabs = [
    { id: 'overview', label: 'Profile Overview', icon: <FiFileText className="w-3.5 h-3.5" /> },
    { id: 'batches', label: `Batches & Students (${batchesList.length})`, icon: <FiLayers className="w-3.5 h-3.5" /> },
    { id: 'academics', label: 'Subjects & Exam Expertise', icon: <FiBookOpen className="w-3.5 h-3.5" /> },
    { id: 'verification', label: `Verification Info${teacher.documents?.length ? ` (${teacher.documents.length})` : ''}`, icon: <FiShield className="w-3.5 h-3.5" /> },
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

            <Avatar
              name={teacherName}
              src={teacher.profile_photo}
              size="lg"
              status={teacher.verification_status === 'VERIFIED' ? 'online' : 'away'}
            />

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-geist text-slate-900">
                  {teacherName}
                </h1>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {teacher.id}
                </span>
                <StatusBadge status={teacher.verification_status || teacher.current_status} />
                {teacher.is_featured && (
                  <Badge variant="warning" size="sm" className="bg-amber-50 text-amber-800 border-amber-200">
                    <FiStar className="w-3 h-3 fill-amber-500 text-amber-500 mr-1" />
                    Featured Faculty
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 sm:gap-4 flex-wrap mt-1 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{teacher.qualification || 'Faculty Member'}</span>
                {teacher.experience_years && (
                  <>
                    <span>·</span>
                    <span>{teacher.experience_years} Years Experience</span>
                  </>
                )}
                {(teacher.city || teacher.state) && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <FiMapPin className="w-3.5 h-3.5 text-slate-400" />
                      {[teacher.city, teacher.state].filter(Boolean).join(', ')}
                    </span>
                  </>
                )}
                <span>·</span>
                <span className="font-mono text-[11px]">
                  Applied {teacher.created_at ? formatDate(teacher.created_at) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FiDownload className="w-3.5 h-3.5" />}
              onClick={() => toast.info('Exporting Dossier', `Exporting faculty dossier for ${teacherName}.`)}
            >
              Export
            </Button>

            {teacher.verification_status === 'PENDING_VERIFICATION' && (
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

            {teacher.verification_status === 'VERIFIED' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FiXCircle className="w-3.5 h-3.5 text-danger" />}
                onClick={openRejectModal}
              >
                Revoke Verification
              </Button>
            )}

            {teacher.verification_status === 'REJECTED' && (
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
              {teacher.experience_years ? `${teacher.experience_years} Years` : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Student Rating
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-geist text-slate-900">
                {teacher.average_rating ? parseFloat(teacher.average_rating).toFixed(2) : '0.00'}
              </span>
              <FiStar className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs text-slate-400 font-mono">
                ({teacher.total_reviews ?? 0} reviews)
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Students Mentored
            </span>
            <span className="text-xl font-bold font-geist text-emerald-700 mt-0.5 block font-mono">
              {(teacher.total_students ?? 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Compliance Status
            </span>
            <div className="mt-1">
              <StatusBadge status={teacher.verification_status || teacher.current_status} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
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
              "{teacher.bio || 'No biography provided yet.'}"
            </p>

            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pt-2">
              Contact & Platform Standing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Email Address</span>
                <p className="font-medium text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-slate-400" />
                  {teacher.email || 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Direct Phone</span>
                <p className="font-mono font-medium text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                  {teacher.phone_number || 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Base Hourly Rate</span>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">
                  {teacher.hourly_rate ? `${formatCurrency(Number(teacher.hourly_rate))} / hr` : 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Language Fluency</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {(teacher.teaching_languages || []).length > 0
                    ? teacher.teaching_languages.join(', ')
                    : 'Not specified'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Intro / Demo Video</span>
                {teacher.demo_video_url ? (
                  <a
                    href={teacher.demo_video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#123B66] text-xs mt-0.5 flex items-center gap-1.5 hover:underline"
                  >
                    <FiVideo className="w-3.5 h-3.5 text-blue-600" />
                    <span>Watch Demo Video</span>
                    <FiExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ) : (
                  <p className="font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <FiVideo className="w-3.5 h-3.5 text-slate-400" />
                    <span>No demo video provided</span>
                  </p>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Registration Date</span>
                <p className="font-mono text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <FiClock className="w-3.5 h-3.5 text-slate-400" />
                  {teacher.created_at ? formatDate(teacher.created_at) : 'N/A'}
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
                <span className="text-slate-500">Verification Status</span>
                <StatusBadge status={teacher.verification_status || teacher.current_status} />
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Account Standing</span>
                <StatusBadge status={teacher.current_status} />
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Active Batches</span>
                <span className="font-mono font-medium text-slate-800">{batchesList.length} batches</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Total Enrolled</span>
                <span className="font-mono font-medium text-slate-800">
                  {totalEnrolledAcrossBatches || (teacher.total_students ?? 0)} students
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Featured Faculty</span>
                <span className="font-semibold text-slate-800">
                  {teacher.is_featured ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-medium">
                      <FiCheckCircle className="w-3.5 h-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
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

      {/* Tab 2: Batches & Enrolled Students */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-geist">
                Live & Scheduled Coaching Batches
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of published batches, student rosters, and batch capacity utilization.
              </p>
            </div>
            <Badge variant="navy" size="sm">
              {batchesList.length} Batches
            </Badge>
          </div>

          {batchesList.length > 0 ? (
            <div className="space-y-5">
              {batchesList.map((batch) => {
                const enrolledCount =
                  batch.student_summary?.enrolled_students ?? batch.students?.length ?? 0;
                const capacity = batch.capacity || 0;
                const occupancyPercent =
                  capacity > 0 ? Math.min(100, Math.round((enrolledCount / capacity) * 100)) : 0;
                const availableSeats =
                  batch.student_summary?.available_seats ?? Math.max(0, capacity - enrolledCount);

                return (
                  <div
                    key={batch.id}
                    className="bg-white border border-slate-200 rounded-xl shadow-subtle overflow-hidden"
                  >
                    {/* Batch Summary Header */}
                    <div className="p-5 border-b border-slate-100 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-slate-900 font-geist">
                              {batch.title}
                            </h3>
                            <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {batch.id ? batch.id.split('-')[0].toUpperCase() : 'BATCH'}
                            </span>
                            <StatusBadge status={batch.status} />
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                            {batch.description}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-base font-bold font-geist text-[#123B66]">
                            {batch.is_free ? 'Free' : formatCurrency(Number(batch.price))}
                          </span>
                          <span className="block text-[10px] text-slate-400">Course Fee</span>
                        </div>
                      </div>

                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#123B66] font-semibold border border-blue-100">
                          {batch.subject}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                          {batch.grade_level}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                          Language: {batch.language}
                        </span>
                        {batch.timing && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                            <FiClock className="w-3.5 h-3.5 text-slate-400" />
                            {batch.timing}
                          </span>
                        )}
                        {batch.start_date && (
                          <span className="text-slate-500 font-mono text-[11px] ml-auto">
                            Start Date: {formatDate(batch.start_date)}
                          </span>
                        )}
                      </div>

                      {/* Occupancy Bar */}
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                          <span>
                            Seats Filled: <strong className="text-slate-900">{enrolledCount}</strong> / {capacity}
                            <span className="text-slate-400 text-[11px] ml-2 font-mono">
                              ({availableSeats} available)
                            </span>
                          </span>
                          <span className="font-mono font-bold text-slate-800">{occupancyPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#123B66] rounded-full transition-all duration-300"
                            style={{ width: `${occupancyPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Enrolled Students Roster */}
                    <div className="p-5 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Enrolled Students Roster
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-700 font-mono">
                            {batch.students?.length || 0}
                          </span>
                        </div>
                      </div>

                      {batch.students && batch.students.length > 0 ? (
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                  <th className="py-2.5 px-3 whitespace-nowrap">Student</th>
                                  <th className="py-2.5 px-3 whitespace-nowrap">School & Grade</th>
                                  <th className="py-2.5 px-3 whitespace-nowrap">Location & Language</th>
                                  <th className="py-2.5 px-3 whitespace-nowrap">Interested Subjects</th>
                                  <th className="py-2.5 px-3 whitespace-nowrap">Payment</th>
                                  <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {batch.students.map((student) => (
                                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <Avatar name={student.name} size="xs" />
                                        <div>
                                          <p className="font-semibold text-slate-900">{student.name}</p>
                                          <span className="font-mono text-[10px] text-slate-400">
                                            {student.enrollment_code}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <p className="font-medium text-slate-800">{student.grade || 'N/A'}</p>
                                      <p
                                        className="text-[11px] text-slate-500 truncate max-w-[180px]"
                                        title={student.school_name}
                                      >
                                        {student.school_name || 'N/A'}
                                      </p>
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <p className="text-slate-700">
                                        {student.city ? `${student.city}, ${student.state}` : 'N/A'}
                                      </p>
                                      <p className="text-[10px] text-slate-400">{student.preferred_language}</p>
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {(student.subjects_of_interest || []).map((sub, idx) => (
                                          <span
                                            key={idx}
                                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200"
                                          >
                                            {sub}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <StatusBadge status={student.payment_status} />
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <StatusBadge status={student.status} />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-white border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                          No students currently enrolled in this batch.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No Active Batches"
              description="This teacher has not yet announced or scheduled any coaching batches on TutorOn India."
            />
          )}
        </div>
      )}

      {/* Tab 3: Subjects & Exam Expertise */}
      {activeTab === 'academics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100 flex items-center gap-2">
              <FiBookOpen className="w-4 h-4 text-[#123B66]" />
              Teaching Subjects
            </h2>
            <div className="flex flex-wrap gap-2">
              {(teacher.subjects || []).length > 0 ? (
                (teacher.subjects || []).map((sub, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-[#123B66] border border-blue-200"
                  >
                    {typeof sub === 'string' ? sub : (sub.name || 'Subject')}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No subjects specified</span>
              )}
            </div>
            <p className="text-xs text-slate-500 pt-2 leading-relaxed">
              Teacher is authorized to teach classes for secondary, senior secondary, and competitive coaching cohorts.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100 flex items-center gap-2">
              <FiAward className="w-4 h-4 text-emerald-700" />
              Competitive Exam Specialization
            </h2>
            <div className="flex flex-wrap gap-2">
              {(teacher.exam_expertise || teacher.examExpertise || []).length > 0 ? (
                (teacher.exam_expertise || teacher.examExpertise || []).map((exam, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    {exam}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No competitive exam specialties listed</span>
              )}
            </div>
            <p className="text-xs text-slate-500 pt-2 leading-relaxed">
              Specialized curriculum alignments certified for national competitive examinations.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100 flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 text-blue-600" />
              Medium of Instruction
            </h2>
            <div className="flex flex-wrap gap-2">
              {(teacher.teaching_languages || []).length > 0 ? (
                (teacher.teaching_languages || []).map((lang, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {lang}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No languages listed</span>
              )}
            </div>
            <p className="text-xs text-slate-500 pt-2 leading-relaxed">
              Verified languages in which the teacher conducts live batches and one-on-one sessions.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Verification Info & Uploaded Documents */}
      {activeTab === 'verification' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-geist">
                Uploaded Credentials & Verification Dossier
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official degree certificates, government identity documents, and verification standing.
              </p>
            </div>
            <StatusBadge status={teacher.verification_status || teacher.current_status} />
          </div>

          {teacher.documents && teacher.documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacher.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-white shadow-2xs flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        doc.verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      <FiFileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 leading-snug">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {doc.type}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600">
                          Status:{' '}
                          <strong className={doc.verified ? 'text-emerald-700' : 'text-amber-700'}>
                            {doc.status}
                          </strong>
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
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-900">Faculty Qualification Certified</span>
                <StatusBadge status={teacher.verification_status || teacher.current_status} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Declared Qualification</span>
                  <span className="font-medium text-slate-800">{teacher.qualification || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Teaching Experience</span>
                  <span className="font-medium text-slate-800">
                    {teacher.experience_years ? `${teacher.experience_years} Years` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Verification Reference</span>
                  <span className="font-mono text-slate-700">{teacher.id}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Application Record</span>
                  <span className="text-slate-700">{teacher.created_at ? formatDate(teacher.created_at) : 'N/A'}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Faculty verification status is certified. All underlying KYC and degree documents are safely stored in TutorOn India compliance repository.
              </p>
            </div>
          )}

          {teacher.verification_status === 'PENDING_VERIFICATION' && (
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

      {/* Tab 5: Verification Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5">
          <h2 className="text-sm font-bold text-slate-900 font-geist pb-3 border-b border-slate-100 mb-4">
            Super Admin Verification Audit History
          </h2>

          <div className="space-y-4">
            {teacher.verificationAudit && teacher.verificationAudit.length > 0 ? (
              teacher.verificationAudit.map((audit) => (
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
              ))
            ) : (
              <div className="flex items-start gap-3 text-xs p-3.5 bg-slate-50/80 rounded-lg border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 border border-emerald-200">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">
                      {teacher.verification_status === 'VERIFIED'
                        ? 'Faculty Verified & Certified'
                        : 'Registration Logged'}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">
                      {formatDate(teacher.created_at)}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {teacher.verification_status === 'VERIFIED'
                      ? 'Credentials, subject authorizations, and background profile certified by Super Admin.'
                      : 'Initial profile registration submitted.'}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    Reference: {teacher.id} · Compliance Status: {teacher.verification_status || teacher.current_status}
                  </span>
                </div>
              </div>
            )}
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
              ? `Approve & Certify Faculty — ${teacherName}`
              : `Decline Verification — ${teacherName}`
          }
          description={`ID: ${teacher.id} · Applied ${teacher.created_at ? formatDate(teacher.created_at) : 'N/A'}`}
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
                leftIcon={
                  actionModal.type === 'approve' ? (
                    <FiCheckCircle className="w-4 h-4" />
                  ) : (
                    <FiXCircle className="w-4 h-4" />
                  )
                }
              >
                {actionModal.type === 'approve' ? 'Confirm & Certify Faculty' : 'Decline Verification'}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900 text-sm">{teacherName}</span>
              <p className="text-slate-600 mt-1 font-medium">{teacher.qualification || 'N/A'}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {teacher.experience_years ? `${teacher.experience_years} Years Experience` : ''}
              </p>
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
