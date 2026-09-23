import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { INITIAL_STUDENTS } from '../../data/students';
import { formatDate, formatCurrency } from '../../utils/formatters';

export function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Find student record from mock database
  const [student, setStudent] = useState(() => {
    return INITIAL_STUDENTS.find((s) => s.id === id) || null;
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(student ? { ...student } : {});
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [notesList, setNotesList] = useState([
    {
      id: 1,
      author: 'Super Admin',
      note: 'Verified parent KYC contact details via phone audit. All credentials valid.',
      date: '2026-08-10',
    },
  ]);

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

  // Toggle Status Handler
  const handleToggleStatus = () => {
    const nextStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    setStudent((prev) => ({ ...prev, status: nextStatus }));
    toast.success('Status Updated', `Student ${student.name} is now ${nextStatus}.`);
  };

  // Edit Profile Handler
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setStudent({ ...editFormData });
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
      `Direct notification sent to ${student.name} (${student.phone}).`
    );
    setNoticeMessage('');
  };

  // Add Internal Note Handler
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!adminNote.trim()) return;
    setNotesList((prev) => [
      {
        id: Date.now(),
        author: 'Super Admin',
        note: adminNote.trim(),
        date: new Date().toISOString().split('T')[0],
      },
      ...prev,
    ]);
    setAdminNote('');
    toast.success('Admin Note Saved', 'Internal remarks added to student audit dossier.');
  };

  // Export Dossier
  const handleExportDossier = () => {
    toast.info('Exporting Dossier', `Compiling complete academic & enrollment dossier for ${student.name}.`);
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Basic Info', icon: <FiFileText className="w-3.5 h-3.5" /> },
    { id: 'enrollments', label: `Enrollments (${student.enrollmentHistory?.length || 0})`, icon: <FiBookOpen className="w-3.5 h-3.5" /> },
    { id: 'connections', label: `Connections (${student.connectionHistory?.length || 0})`, icon: <FiLink className="w-3.5 h-3.5" /> },
    { id: 'activity', label: 'Activity Log', icon: <FiActivity className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'Academic Reports & Notes', icon: <FiCheckCircle className="w-3.5 h-3.5" /> },
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

            <Avatar name={student.name} size="lg" status={student.status === 'Active' ? 'online' : 'offline'} />

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-geist text-slate-900">
                  {student.name}
                </h1>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {student.id}
                </span>
                <StatusBadge status={student.status} />
              </div>

              <div className="flex items-center gap-3 sm:gap-4 flex-wrap mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FiBookOpen className="w-3.5 h-3.5 text-slate-400" />
                  {student.grade} · {student.board}
                </span>
                <span className="flex items-center gap-1">
                  <FiMapPin className="w-3.5 h-3.5 text-slate-400" />
                  {student.city}, {student.state}
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {formatDate(student.joinedDate)}
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
              onClick={() => {
                setEditFormData({ ...student });
                setIsEditModalOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant={student.status === 'Active' ? 'danger' : 'success'}
              size="sm"
              onClick={handleToggleStatus}
            >
              {student.status === 'Active' ? 'Deactivate' : 'Activate'}
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
              {student.enrollmentHistory?.length || 0}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Contact Requests
            </span>
            <span className="text-xl font-bold font-geist text-[#123B66] mt-0.5 block">
              {student.connectionHistory?.length || 0} Approved
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Hours Learned
            </span>
            <span className="text-xl font-bold font-geist text-emerald-700 mt-0.5 block">
              {student.accountDetails?.totalHoursLearned || 0} hrs
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              KYC Standing
            </span>
            <div className="mt-1">
              <Badge variant="success" size="sm" dot>
                {student.accountDetails?.kycStatus || 'Verified'}
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
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{student.name}</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Student Reference ID</span>
                <p className="font-mono font-semibold text-slate-800 text-sm mt-0.5">{student.id}</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Registered Email</span>
                <p className="font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Verified Mobile Phone</span>
                <p className="font-mono font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                  {student.phone}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Class / Target Academic Goal</span>
                <p className="font-medium text-slate-800 mt-0.5">{student.grade}</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">School / Board Curriculum</span>
                <p className="font-medium text-slate-800 mt-0.5">{student.school} ({student.board})</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Location</span>
                <p className="font-medium text-slate-800 mt-0.5">{student.city}, {student.state}, India</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Platform Registration</span>
                <p className="font-medium text-slate-700 mt-0.5">{formatDate(student.joinedDate)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Parent / Legal Guardian Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Guardian Name</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{student.guardianName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Relationship</span>
                  <p className="font-medium text-slate-700 mt-0.5">{student.guardianRelation || 'Father'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Emergency Contact</span>
                  <p className="font-mono font-medium text-slate-700 mt-0.5">{student.guardianPhone || student.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security & Telemetry Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-[#123B66]" />
              Account Status & Security
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Account Standing</span>
                <Badge variant="success" size="sm">
                  {student.accountDetails?.accountStanding || 'Good Standing'}
                </Badge>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">KYC Verification</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <FiCheck className="w-3.5 h-3.5" />
                  {student.accountDetails?.kycStatus || 'Verified'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Total Logins</span>
                <span className="font-mono font-medium text-slate-800">
                  {student.accountDetails?.loginCount || 1} sessions
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Last Active</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {student.accountDetails?.lastLogin ? formatDate(student.accountDetails.lastLogin) : 'Today'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-[#0B1F3A]">Protected Profile Shield</p>
              <p>
                Student's direct contact details are shielded and require Super Admin approval prior to disclosure to teachers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Enrollment History */}
      {activeTab === 'enrollments' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 font-geist">
              Enrolled Batches & Tutoring Classes
            </h2>
            <Badge variant="navy" size="sm">
              {student.enrollmentHistory?.length || 0} Enrolled
            </Badge>
          </div>

          {student.enrollmentHistory && student.enrollmentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-4">Batch Name</th>
                    <th className="py-3 px-4">Teacher</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Fee Paid</th>
                    <th className="py-3 px-4">Enrolled On</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {student.enrollmentHistory.map((batch, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {batch.batchId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {batch.batchName}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {batch.teacherName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {batch.schedule}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {formatCurrency(batch.feePaid)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(batch.enrolledOn)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={batch.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No Batches Enrolled"
              description="This student has not yet enrolled in any live coaching batches on TutorOn India."
            />
          )}
        </div>
      )}

      {/* Tab 3: Connection History (Protected Contact Requests) */}
      {activeTab === 'connections' && (
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
              Protected Flow
            </Badge>
          </div>

          {student.connectionHistory && student.connectionHistory.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {student.connectionHistory.map((con, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{con.connectionId}</span>
                      <StatusBadge status={con.status} />
                    </div>
                    <p className="text-slate-800 font-medium">
                      Teacher: <strong className="text-slate-900">{con.teacherName}</strong> · {con.subject}
                    </p>
                    <p className="text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 max-w-xl">
                      "{con.note}"
                    </p>
                  </div>

                  <div className="text-right text-slate-400 font-mono text-[11px] shrink-0">
                    <p>Requested: {formatDate(con.requestedOn)}</p>
                    {con.approvedOn && <p className="text-emerald-600 font-medium">Approved: {formatDate(con.approvedOn)}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Connection Requests"
              description="No teacher contact disclosure requests have been filed by this student."
            />
          )}
        </div>
      )}

      {/* Tab 4: Activity Log */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5">
          <h2 className="text-sm font-bold text-slate-900 font-geist pb-3 border-b border-slate-100 mb-4">
            Recent Student Activity & Audit Trail
          </h2>

          <div className="space-y-4">
            {student.activityLog && student.activityLog.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#123B66] shrink-0 mt-0.5">
                  <FiClock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800">{act.description}</p>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatDate(act.timestamp)} · Event ID: {act.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Reports & Academic Notes */}
      {activeTab === 'reports' && (
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
                  {student.reports?.attendanceRate || '95%'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Homework Submissions</span>
                <p className="text-lg font-bold font-geist text-blue-700 mt-0.5">
                  {student.reports?.homeworkSubmissionRate || '92%'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Cohort Standing</span>
                <p className="text-lg font-bold font-geist text-slate-800 mt-0.5">
                  {student.reports?.academicRankInBatches || 'Top 10%'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Super Admin Flag</span>
                <p className="text-xs font-semibold text-emerald-700 mt-2">
                  Compliant Account
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                Faculty Remarks
              </span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic">
                "{student.reports?.adminRemarks || 'Consistent performance across enrolled subjects.'}"
              </p>
            </div>
          </div>

          {/* Internal Admin Remarks & Notes */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-geist pb-2 border-b border-slate-100">
              Super Admin Internal Remarks
            </h2>

            {/* Add note input */}
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

            {/* Notes history */}
            <div className="space-y-3 pt-2">
              {notesList.map((n) => (
                <div key={n.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="font-semibold text-slate-700">{n.author}</span>
                    <span className="font-mono">{n.date}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{n.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Student Profile — ${student.name}`}
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
              label="Full Name"
              value={editFormData.name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            />
            <Input
              label="Email Address"
              value={editFormData.email || ''}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={editFormData.phone || ''}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            />
            <Input
              label="Class / Grade"
              value={editFormData.grade || ''}
              onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Board"
              value={editFormData.board || ''}
              onChange={(e) => setEditFormData({ ...editFormData, board: e.target.value })}
            />
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
            label="School / Institution"
            value={editFormData.school || ''}
            onChange={(e) => setEditFormData({ ...editFormData, school: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Guardian Name"
              value={editFormData.guardianName || ''}
              onChange={(e) => setEditFormData({ ...editFormData, guardianName: e.target.value })}
            />
            <Input
              label="Guardian Phone"
              value={editFormData.guardianPhone || ''}
              onChange={(e) => setEditFormData({ ...editFormData, guardianPhone: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Send Notice Modal */}
      <Modal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title={`Send Administrative Notice to ${student.name}`}
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
              placeholder="e.g. Please verify your parent Aadhaar details to avoid batch enrollment disruption."
              value={noticeMessage}
              onChange={(e) => setNoticeMessage(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default StudentDetails;
