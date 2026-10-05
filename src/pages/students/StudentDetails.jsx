import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchStudentById, deactivateStudent, activateStudent } from '../../API/thunks/studentsThunks';
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiDownload,
  FiEdit3,
  FiLink,
  FiActivity,
  FiFileText,
  FiCheck,
  FiSend,
  FiUser,
  FiLayers,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatCurrency } from '../../utils/formatters';

export function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const dispatch = useDispatch();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isStatusConfirmModalOpen, setIsStatusConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    dispatch(fetchStudentById(id))
      .unwrap()
      .then((data) => {
        const studentData = data?.data || data;
        setStudent(studentData);
        if (studentData.admin_remarks && Array.isArray(studentData.admin_remarks)) {
          setNotesList(studentData.admin_remarks);
        } else {
          setNotesList([]);
        }
      })
      .catch((err) => {
        toast.error('Fetch Failed', err?.toString() || 'Could not fetch student details.');
        setStudent(null);
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

  if (!student) {
    return (
      <div className="py-12">
        <EmptyState
          title="Student Record Not Found"
          description={`No student with reference ID "${id}" was found in TutorOn India.`}
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FiArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/students')}
            >
              Return to Students Directory
            </Button>
          }
        />
      </div>
    );
  }

  const studentName =
    student.full_name ||
    `${student.first_name || ''} ${student.last_name || ''}`.trim() ||
    student.email ||
    'Student';

  const isStatusActive =
    student.is_active !== undefined
      ? Boolean(student.is_active)
      : student.status?.toLowerCase() === 'active';

  // Toggle Status Modal Opener
  const handleOpenStatusModal = () => {
    setIsStatusConfirmModalOpen(true);
  };

  // Confirm Status Toggle (Dispatches Thunk + Handles Promise)
  const handleConfirmStatusToggle = async () => {
    const studentId = student.id || id;
    if (!studentId) return;

    setIsUpdatingStatus(true);
    try {
      if (isStatusActive) {
        const res = await dispatch(deactivateStudent(studentId)).unwrap();
        const updatedData = res?.data || res;
        setStudent((prev) => ({
          ...prev,
          ...updatedData,
          is_active: false,
          status: 'Inactive',
          account_security: {
            ...(prev?.account_security || {}),
            ...(updatedData?.account_security || {}),
            account_standing: 'Suspended',
          },
        }));
        toast.success(
          'Student Deactivated',
          `Student account ${studentName} has been deactivated successfully.`
        );
      } else {
        const res = await dispatch(activateStudent(studentId)).unwrap();
        const updatedData = res?.data || res;
        setStudent((prev) => ({
          ...prev,
          ...updatedData,
          is_active: true,
          status: updatedData?.status || 'Active',
          account_security: {
            ...(prev?.account_security || {}),
            ...(updatedData?.account_security || {}),
            account_standing: 'Good Standing',
          },
        }));
        toast.success(
          'Student Activated',
          `Student account ${studentName} has been reactivated successfully.`
        );
      }
      setIsStatusConfirmModalOpen(false);

      // Re-fetch in background to ensure all related data is in sync
      dispatch(fetchStudentById(studentId))
        .unwrap()
        .then((fresh) => {
          const freshData = fresh?.data || fresh;
          if (freshData) {
            setStudent(freshData);
          }
        })
        .catch(() => {});
    } catch (err) {
      toast.error(
        `${isStatusActive ? 'Deactivation' : 'Activation'} Failed`,
        err?.toString() || 'Could not update student status.'
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open Edit Modal with current data
  const handleOpenEditModal = () => {
    setEditFormData({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      full_name: student.full_name || '',
      email: student.email || '',
      phone_number: student.phone_number || '',
      education_level: student.education_level || student.grade_display || '',
      board: student.board || '',
      school_name: student.school_name || '',
      city: student.city || '',
      state: student.state || '',
      preferred_language: student.preferred_language || '',
      bio: student.bio || '',
    });
    setIsEditModalOpen(true);
  };

  // Edit Profile Handler
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedFullName =
      `${editFormData.first_name || ''} ${editFormData.last_name || ''}`.trim() ||
      editFormData.full_name ||
      studentName;

    setStudent((prev) => ({
      ...prev,
      ...editFormData,
      full_name: updatedFullName,
    }));
    setIsEditModalOpen(false);
    toast.success('Dossier Updated', 'Student profile details updated successfully.');
  };

  // Send Notice Handler
  const handleSendNotice = (e) => {
    e.preventDefault();
    if (!noticeMessage.trim()) return;
    setIsNoticeModalOpen(false);
    toast.success(
      'Administrative Notice Dispatched',
      `Direct notification dispatched to ${studentName} (${student.phone_number || 'Registered Phone'}).`
    );
    setNoticeMessage('');
  };

  // Add Internal Note Handler
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!adminNote.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      author: 'Super Admin',
      remark: adminNote.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    setNotesList((prev) => [newNote, ...prev]);
    setAdminNote('');
    toast.success('Admin Note Saved', 'Internal remarks added to student audit dossier.');
  };

  // Export Dossier
  const handleExportDossier = () => {
    toast.info('Exporting Dossier', `Compiling complete academic & enrollment dossier for ${studentName}.`);
  };

  const batchesList = student.batches || [];
  // const contactRequestsCount = student.contact_requests_count ?? (student.connectionHistory?.length || 0);

  const tabs = [
    { id: 'profile', label: 'Profile & Basic Info', icon: <FiFileText className="w-3.5 h-3.5" /> },
    { id: 'batches', label: `Batches & Enrollments (${batchesList.length})`, icon: <FiBookOpen className="w-3.5 h-3.5" /> },
    { id: 'academics', label: 'Academic Telemetry & Remarks', icon: <FiCheckCircle className="w-3.5 h-3.5" /> },
    // { id: 'connections', label: `Contact Requests (${contactRequestsCount})`, icon: <FiLink className="w-3.5 h-3.5" /> },
    { id: 'activity', label: 'Activity Log', icon: <FiActivity className="w-3.5 h-3.5" /> },
  ];

  // Synthesize activity log if not provided directly
  const activityItems = student.activityLog || [
    ...batchesList.map((b) => ({
      id: `act-enr-${b.id}`,
      description: `Requested enrollment for "${b.title}" · Code: ${b.enrollment?.code || 'N/A'} (Payment: ${b.enrollment?.payment_status || 'PAID'})`,
      timestamp: b.enrollment?.requested_at || b.created_at || student.date_joined,
    })),
    ...notesList.map((n) => ({
      id: `act-note-${n.id}`,
      description: `Super Admin remark recorded: "${n.remark || n.note}"`,
      timestamp: n.date,
    })),
    {
      id: `act-reg-${student.id}`,
      description: `Student account created for ${studentName} (${student.education_level || student.grade_display || 'Student'})`,
      timestamp: student.date_joined || student.joined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 mt-1 sm:mt-0"
              aria-label="Back to students"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>

            <Avatar
              name={studentName}
              src={student.profile_photo}
              size="lg"
              status={isStatusActive ? 'online' : 'offline'}
            />

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-geist text-slate-900">
                  {studentName}
                </h1>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {student.student_code || student.id}
                </span>
                <StatusBadge status={student.status || 'Pending'} />
              </div>

              <div className="flex items-center gap-3 sm:gap-4 flex-wrap mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <FiBookOpen className="w-3.5 h-3.5 text-slate-400" />
                  {student.grade_display || student.education_level || student.academic_details?.class_level || 'Class 12'}
                  {student.school_name ? ` · ${student.school_name}` : ''}
                </span>
                {(student.city || student.state) && (
                  <span className="flex items-center gap-1">
                    <FiMapPin className="w-3.5 h-3.5 text-slate-400" />
                    {[student.city, student.state].filter(Boolean).join(', ')}
                  </span>
                )}
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {student.joined || (student.date_joined ? formatDate(student.date_joined) : 'N/A')}
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
              onClick={handleExportDossier}
            >
              Export
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FiSend className="w-3.5 h-3.5" />}
              onClick={() => setIsNoticeModalOpen(true)}
            >
              Notice
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FiEdit3 className="w-3.5 h-3.5" />}
              onClick={handleOpenEditModal}
            >
              Edit
            </Button>
            <Button
              variant={isStatusActive ? 'danger' : 'success'}
              size="sm"
              isLoading={isUpdatingStatus}
              onClick={handleOpenStatusModal}
            >
              {isStatusActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>

        {/* High-Level Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Batches Enrolled
            </span>
            <span className="text-xl font-bold font-geist text-slate-900 mt-0.5 block">
              {student.enrollments || `${student.enrollments_count ?? batchesList.length} Batch`}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Contact Requests
            </span>
            <span className="text-xl font-bold font-geist text-[#123B66] mt-0.5 block">
              {student.contact_requests || `${student.contact_requests_count ?? 0} Approved`}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Hours Learned
            </span>
            <span className="text-xl font-bold font-geist text-emerald-700 mt-0.5 block">
              {student.hours_learned || student.academic_details?.hours_learned || '0 hrs'}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              KYC Standing
            </span>
            <div className="mt-1">
              <Badge variant="success" size="sm" dot>
                {student.kyc_standing || student.account_security?.kyc_verification || 'Verified'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
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

      {/* Tab 1: Profile & Basic Information */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-5">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100">
              Personal & Academic Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Full Name</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{studentName}</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Student Reference ID</span>
                <p className="font-mono font-semibold text-slate-800 text-sm mt-0.5">
                  {student.student_code || student.id}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Registered Email</span>
                <p className="font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email || 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Verified Mobile Phone</span>
                <p className="font-mono font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                  {student.phone_number || 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Class / Academic Goal</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {student.grade_display || student.education_level || student.academic_details?.target_academic_goal || 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Board / Curriculum</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {student.board || student.academic_details?.curriculum || 'CBSE'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">School / Institution</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {student.school_name || student.academic_details?.school_name || 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Location</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {[student.city, student.state, 'India'].filter(Boolean).join(', ')}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Preferred Language</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {student.preferred_language || student.academic_details?.preferred_language || 'Hindi / English'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Platform Registration</span>
                <p className="font-medium text-slate-700 mt-0.5">
                  {student.joined || (student.date_joined ? formatDate(student.date_joined) : 'N/A')}
                </p>
              </div>
            </div>

            {/* Subjects of Interest */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1.5">
                Subjects of Interest
              </span>
              <div className="flex flex-wrap gap-2">
                {(student.subjects_of_interest || student.academic_details?.subjects_of_interest || []).length > 0 ? (
                  (student.subjects_of_interest || student.academic_details?.subjects_of_interest).map((subj, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-[#123B66] border border-blue-200"
                    >
                      {subj}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">None specified</span>
                )}
              </div>
            </div>

            {/* Bio / Aspirations */}
            {student.bio && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">
                  Student Bio / Notes
                </span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{student.bio}"
                </p>
              </div>
            )}
          </div>

          {/* Account Security & Standing Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-[#123B66]" />
              Account Status & Security
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Account Standing</span>
                <Badge variant={isStatusActive ? 'success' : 'danger'} size="sm">
                  {student.account_security?.account_standing || (isStatusActive ? 'Good Standing' : 'Suspended')}
                </Badge>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">KYC Verification</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <FiCheck className="w-3.5 h-3.5" />
                  {student.account_security?.kyc_verification || student.kyc_standing || 'Verified'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Total Logins</span>
                <span className="font-mono font-medium text-slate-800">
                  {student.account_security?.total_logins || '1 sessions'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Last Active</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {student.account_security?.last_active || 'Today'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Hours Learned</span>
                <span className="font-mono font-medium text-slate-800">
                  {student.hours_learned || '0 hrs'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-[#0B1F3A]">Protected Profile Shield</p>
              <p>
                Student contact details are strictly shielded under TutorOn India privacy protocol and released only upon explicit Super Admin clearance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Batches & Enrollments */}
      {activeTab === 'batches' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-geist">
                Enrolled Batches & Tutoring Cohorts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active batch enrollments, teacher details, and enrollment payment statuses.
              </p>
            </div>
            <Badge variant="navy" size="sm">
              {batchesList.length} Batches
            </Badge>
          </div>

          {batchesList.length > 0 ? (
            <div className="space-y-4">
              {batchesList.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 font-geist">
                          {batch.title}
                        </h3>
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {batch.id ? batch.id.split('-')[0].toUpperCase() : 'BATCH'}
                        </span>
                        <StatusBadge status={batch.status} />
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                        {batch.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold font-geist text-[#123B66]">
                        {batch.is_free ? 'Free' : formatCurrency(Number(batch.price))}
                      </span>
                      <span className="block text-[10px] text-slate-400">Batch Fee</span>
                    </div>
                  </div>

                  {/* Batch Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                        Assigned Faculty
                      </span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {batch.teacher?.name || 'TutorOn Faculty'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {batch.teacher?.email || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                        Schedule & Timing
                      </span>
                      <p className="font-medium text-slate-800 mt-0.5 flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5 text-slate-400" />
                        {batch.timing || 'Schedule TBA'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {batch.start_date ? formatDate(batch.start_date) : ''}
                        {batch.end_date ? ` to ${formatDate(batch.end_date)}` : ''}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                        Curriculum & Language
                      </span>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {batch.grade_level} · {batch.subject}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Medium: {batch.language}
                      </p>
                    </div>
                  </div>

                  {/* Enrollment Standing Details */}
                  {batch.enrollment && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-slate-500">
                          Code: <strong className="font-mono text-slate-800">{batch.enrollment.code}</strong>
                        </span>
                        <span>·</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Enrollment:</span>
                          <StatusBadge status={batch.enrollment.status} />
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Payment:</span>
                          <StatusBadge status={batch.enrollment.payment_status} />
                        </div>
                      </div>

                      <div className="text-slate-400 font-mono text-[11px]">
                        Requested: {batch.enrollment.requested_at ? formatDate(batch.enrollment.requested_at) : 'N/A'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Batches Enrolled"
              description="This student has not yet enrolled in any live coaching batches on TutorOn India."
            />
          )}
        </div>
      )}

      {/* Tab 3: Academic Telemetry & Remarks */}
      {activeTab === 'academics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academic Report Summary */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100">
              Academic Telemetry & Metrics
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Batch Attendance</span>
                <p className="text-lg font-bold font-geist text-emerald-700 mt-0.5">
                  {student.academic_telemetry?.batch_attendance || student.academic_details?.batch_attendance || '95%'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Homework Submissions</span>
                <p className="text-lg font-bold font-geist text-blue-700 mt-0.5">
                  {student.academic_telemetry?.homework_submissions || student.academic_details?.homework_submissions || '92%'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Cohort Standing</span>
                <p className="text-lg font-bold font-geist text-slate-800 mt-0.5">
                  {student.academic_telemetry?.cohort_standing || student.academic_details?.cohort_standing || 'Top 10%'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Super Admin Flag</span>
                <p className="text-xs font-semibold text-emerald-700 mt-2 flex items-center gap-1">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  {student.academic_telemetry?.super_admin_flag || 'Compliant Account'}
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                Faculty Remarks
              </span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic">
                "{student.academic_telemetry?.faculty_remarks || student.academic_details?.faculty_remarks || 'Consistent performance across enrolled subjects.'}"
              </p>
            </div>
          </div>



          {/* Internal Admin Remarks & Notes */}
{/* 
          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">

            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100">
              Super Admin Internal Remarks
            </h2>

            
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                placeholder="Add confidential administrative observation or audit remark..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm">
                  Save Admin Remark
                </Button>
              </div>
            </form>


          
            <div className="space-y-3 pt-2">
              {notesList.length > 0 ? (
                notesList.map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span className="font-semibold text-slate-700">{n.author || 'Super Admin'}</span>
                      <span className="font-mono">{n.date ? formatDate(n.date) : 'N/A'}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{n.remark || n.note}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
                  No internal remarks recorded for this student yet.
                </div>
              )}
            </div>

          </div> */}

        </div>
      )}

      {/* Tab 4: Teacher Connections (Protected Contact Requests) */}
      {/* {activeTab === 'connections' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-geist">
                Teacher Contact Request Audit Trail
              </h2>
              <p className="text-xs text-slate-500">
                Verified communication permissions approved by Super Admin.
              </p>
            </div>
            <Badge variant="navy" size="sm">
              {student.contact_requests || `${student.contact_requests_count ?? 0} Approved`}
            </Badge>
          </div>

          {student.connectionHistory && student.connectionHistory.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {student.connectionHistory.map((con, idx) => (
                <div
                  key={idx}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{con.connectionId}</span>
                      <StatusBadge status={con.status} />
                    </div>
                    <p className="text-slate-800 font-medium">
                      Teacher: <strong className="text-slate-900">{con.teacherName}</strong> · {con.subject}
                    </p>
                    {con.note && (
                      <p className="text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 max-w-xl">
                        "{con.note}"
                      </p>
                    )}
                  </div>

                  <div className="text-right text-slate-400 font-mono text-[11px] shrink-0">
                    <p>Requested: {formatDate(con.requestedOn)}</p>
                    {con.approvedOn && (
                      <p className="text-emerald-600 font-medium">Approved: {formatDate(con.approvedOn)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Connection Requests"
              description="No teacher contact disclosure requests have been filed by this student. Direct contact details remain protected."
            />
          )}
        </div>
      )} */}

      {/* Tab 5: Activity Log */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5">
          <h2 className="text-sm font-bold text-slate-900 font-geist pb-3 border-b border-slate-100 mb-4">
            Recent Student Activity & Audit Trail
          </h2>

          <div className="space-y-4">
            {activityItems.length > 0 ? (
              activityItems.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#123B66] shrink-0 mt-0.5">
                    <FiClock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800">{act.description}</p>
                    <span className="text-[10px] font-mono text-slate-400">
                      {act.timestamp ? formatDate(act.timestamp) : 'Recent'} · Ref: {act.id}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No activity logs available for this student.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Student Profile — ${studentName}`}
        description="Update personal and academic records for this student."
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={editFormData.first_name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
            />
            <Input
              label="Last Name"
              value={editFormData.last_name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email Address"
              value={editFormData.email || ''}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              value={editFormData.phone_number || ''}
              onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Class / Grade Level"
              value={editFormData.education_level || ''}
              onChange={(e) => setEditFormData({ ...editFormData, education_level: e.target.value })}
            />
            <Input
              label="Board / Curriculum"
              value={editFormData.board || ''}
              onChange={(e) => setEditFormData({ ...editFormData, board: e.target.value })}
            />
          </div>

          <Input
            label="School / Institution"
            value={editFormData.school_name || ''}
            onChange={(e) => setEditFormData({ ...editFormData, school_name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={editFormData.city || ''}
              onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
            />
            <Input
              label="State"
              value={editFormData.state || ''}
              onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
            />
          </div>

          <Input
            label="Preferred Language"
            value={editFormData.preferred_language || ''}
            onChange={(e) => setEditFormData({ ...editFormData, preferred_language: e.target.value })}
          />
        </form>
      </Modal>

      {/* Send Notice Modal */}
      <Modal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title={`Send Administrative Notice to ${studentName}`}
        description="This message will be dispatched to the student's registered mobile number and portal inbox."
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsNoticeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSendNotice}>
              Dispatch Notice
            </Button>
          </>
        }
      >
        <form onSubmit={handleSendNotice} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notice Content
            </label>
            <textarea
              rows={4}
              required
              placeholder="e.g. Please verify your KYC contact details to avoid batch enrollment disruption."
              value={noticeMessage}
              onChange={(e) => setNoticeMessage(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
            />
          </div>
        </form>
      </Modal>

      {/* Deactivate / Activate Confirmation Modal */}
      <Modal
        isOpen={isStatusConfirmModalOpen}
        onClose={() => !isUpdatingStatus && setIsStatusConfirmModalOpen(false)}
        title={isStatusActive ? `Deactivate Student Account` : `Activate Student Account`}
        description={
          isStatusActive
            ? `Are you sure you want to deactivate ${studentName}'s account? The student will be restricted from portal login and enrolled batches.`
            : `Are you sure you want to reactivate ${studentName}'s account? Full batch access and portal privileges will be restored.`
        }
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => setIsStatusConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={isStatusActive ? 'danger' : 'success'}
              size="sm"
              isLoading={isUpdatingStatus}
              onClick={handleConfirmStatusToggle}
            >
              {isStatusActive ? 'Confirm Deactivation' : 'Confirm Activation'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-1">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Avatar name={studentName} src={student.profile_photo} size="md" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{studentName}</p>
              <p className="text-xs text-slate-500 font-mono">
                {student.email || student.phone_number || student.student_code || student.id}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isStatusActive
              ? 'Deactivating this account will update status to "Inactive", suspend platform privileges, and log this change in the administrative records.'
              : 'Reactivating this account will restore standard standing to "Active" and re-enable student login.'}
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default StudentDetails;
