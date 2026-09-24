import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiBookOpen,
  FiLink,
  FiCreditCard,
  FiEye,
  FiCheck,
  FiX,
  FiPlus,
  FiLayers,
  FiBell,
  FiStar,
  FiSend,
  FiImage,
  FiChevronRight,
  FiArrowRight,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';
import TableScrollButtons from '../../components/ui/TableScrollButtons';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

export function DashboardOverview() {
  const navigate = useNavigate();
  const toast = useToast();

  const approvalsTableRef = useRef(null);
  const [activeChartRange, setActiveChartRange] = useState('30d');
  const [selectedApproval, setSelectedApproval] = useState(null);

  // Six Prompt-Specific KPI Cards
  const kpiMetrics = [
    {
      id: 'total_students',
      title: 'Total Students',
      value: '8,452',
      change: '+8.4% this month',
      isPositive: true,
      icon: <FiUsers className="w-5 h-5 text-[#123B66]" />,
      badge: 'Learners',
      onClick: () => navigate('/students'),
    },
    {
      id: 'total_teachers',
      title: 'Total Teachers',
      value: '1,248',
      change: '+5.2% this month',
      isPositive: true,
      icon: <FiUserCheck className="w-5 h-5 text-emerald-600" />,
      badge: 'Faculty',
      onClick: () => navigate('/teachers'),
    },
    {
      id: 'pending_verification',
      title: 'Pending Teacher Verification',
      value: '37',
      change: 'Needs attention',
      isAlert: true,
      icon: <FiClock className="w-5 h-5 text-amber-600" />,
      badge: 'Action Required',
      onClick: () => navigate('/teachers?tab=pending'),
    },
    {
      id: 'pending_connections',
      title: 'Pending Connections',
      value: '24',
      change: 'Awaiting admin review',
      isAlert: true,
      icon: <FiLink className="w-5 h-5 text-purple-600" />,
      badge: 'Protected Flow',
      onClick: () => navigate('/connections?tab=pending_admin'),
    },
    {
      id: 'pending_enrollments',
      title: 'Pending Enrollments',
      value: '18',
      change: 'Requires confirmation',
      isAlert: true,
      icon: <FiBookOpen className="w-5 h-5 text-[#1D4ED8]" />,
      badge: 'Batches',
      onClick: () => navigate('/enrollments?tab=awaiting_confirmation'),
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: '₹4,85,240',
      change: 'This month',
      isPositive: true,
      icon: <FiCreditCard className="w-5 h-5 text-emerald-700" />,
      badge: 'Gross Fees',
      onClick: () => navigate('/payments'),
    },
  ];

  // Secondary Snapshot Cards
  const platformSnapshots = [
    { title: 'Active Students', value: '7,890', subtext: '93.3% engagement rate', icon: <FiUsers className="w-4 h-4 text-[#123B66]" />, path: '/students' },
    { title: 'Verified Teachers', value: '1,185', subtext: '94.9% verification pass', icon: <FiUserCheck className="w-4 h-4 text-emerald-600" />, path: '/teachers/verified' },
    { title: 'Active Batches', value: '342', subtext: 'Live across India', icon: <FiLayers className="w-4 h-4 text-[#1D4ED8]" />, path: '/enrollments' },
    { title: 'Active Connections', value: '1,520', subtext: 'Protected communications', icon: <FiLink className="w-4 h-4 text-purple-600" />, path: '/connections' },
  ];

  // Pending Approvals Queue
  const [approvals, setApprovals] = useState([
    {
      id: 'APP-TCH-101',
      type: 'Teacher Verification',
      request: 'Dr. Ramesh Chandra Gupta (Physics · Class XII / JEE)',
      submittedBy: 'dr.gupta.physics@gmail.com',
      date: '2026-09-23T09:30:00Z',
      status: 'Pending',
      details: {
        experience: '14 Years (Ex-Faculty, FIITJEE)',
        degrees: 'Ph.D Physics (IIT Delhi), M.Sc Physics',
        targetSubject: 'Physics & Advanced Mechanics',
        phone: '+91 98765 43210',
      },
    },
    {
      id: 'APP-CON-204',
      type: 'Connection Approval',
      request: 'Aarav Malhotra requested contact for Dr. Ramesh Chandra Gupta',
      submittedBy: 'Aarav Malhotra (Class XII PCM)',
      date: '2026-09-23T08:15:00Z',
      status: 'Pending',
      details: {
        reason: 'Parent requested 1-on-1 weekend consultation prior to batch payment.',
        studentId: 'STU-10021',
        teacherPhone: '+91 98765 43210',
      },
    },
    {
      id: 'APP-ENR-305',
      type: 'Enrollment Confirmation',
      request: 'Diya Patel requested seat in NEET Chemistry Rapid Batch',
      submittedBy: 'Diya Patel (Ahmedabad)',
      date: '2026-09-23T07:45:00Z',
      status: 'Pending',
      details: {
        batchId: 'BAT-CHM-090',
        fee: '₹14,000',
        teacher: 'Prof. Arvind Nambiar',
        seatNumber: 'Seat #24/25',
      },
    },
    {
      id: 'APP-TCH-102',
      type: 'Teacher Verification',
      request: 'Sunita Venkatesh (Mathematics · Class X & XII)',
      submittedBy: 'sunita.maths@outlook.com',
      date: '2026-09-22T18:20:00Z',
      status: 'Pending',
      details: {
        experience: '9 Years (DU Gold Medalist, B.Ed)',
        degrees: 'M.Sc Mathematics (Delhi University)',
        targetSubject: 'Calculus, Geometry, Olympiads',
        phone: '+91 94421 88902',
      },
    },
    {
      id: 'APP-CON-205',
      type: 'Connection Approval',
      request: 'Meera Deshmukh requested contact for Sunita Venkatesh',
      submittedBy: 'Meera Deshmukh (Class X CBSE)',
      date: '2026-09-22T16:10:00Z',
      status: 'Pending',
      details: {
        reason: 'Inquiring about morning batch timings and doubt clearing sessions.',
        studentId: 'STU-10022',
        teacherPhone: '+91 94421 88902',
      },
    },
  ]);

  // Recent Activity Feed
  const recentActivities = [
    {
      id: 'act-1',
      icon: <FiUserCheck className="w-4 h-4 text-[#123B66]" />,
      description: 'Teacher profile submitted for verification by Dr. Ramesh Chandra Gupta',
      timestamp: '15m ago',
      category: 'Teacher',
    },
    {
      id: 'act-2',
      icon: <FiLink className="w-4 h-4 text-purple-600" />,
      description: 'Connection request awaiting admin review: Aarav Malhotra → Dr. Ramesh Gupta',
      timestamp: '42m ago',
      category: 'Connection',
    },
    {
      id: 'act-3',
      icon: <FiBookOpen className="w-4 h-4 text-[#1D4ED8]" />,
      description: 'Student requested batch enrollment: Diya Patel → NEET Chemistry Batch',
      timestamp: '1h ago',
      category: 'Enrollment',
    },
    {
      id: 'act-4',
      icon: <FiStar className="w-4 h-4 text-amber-500" />,
      description: 'New review reported for moderation: "Inappropriate review on Physics Batch B-101"',
      timestamp: '2h ago',
      category: 'Review',
    },
    {
      id: 'act-5',
      icon: <FiBell className="w-4 h-4 text-emerald-600" />,
      description: 'New enrollment request confirmed: Kabir Mehta enrolled in ICSE English Literature',
      timestamp: '3h ago',
      category: 'Enrollment',
    },
  ];

  // Approval Handlers
  const handleApprove = (approvalId) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === approvalId ? { ...a, status: 'Approved' } : a))
    );
    setSelectedApproval(null);
    toast.success('Request Approved', `Approval ${approvalId} confirmed.`);
  };

  const handleReject = (approvalId) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === approvalId ? { ...a, status: 'Rejected' } : a))
    );
    setSelectedApproval(null);
    toast.error('Request Rejected', `Approval ${approvalId} has been declined.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Greeting & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-geist text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor TutorOn India's platform activity, approvals, users and content.
          </p>
        </div>

        {/* Quick Action Button Dropdown */}
        <Dropdown
          align="right"
          width="w-56"
          trigger={
            <Button
              variant="primary"
              size="md"
              leftIcon={<FiPlus className="w-4 h-4" />}
            >
              + Quick Action
            </Button>
          }
          items={[
            {
              label: 'Verify Teacher',
              icon: <FiUserCheck className="text-emerald-600" />,
              onClick: () => navigate('/teachers?tab=pending'),
            },
            {
              label: 'Review Connection',
              icon: <FiLink className="text-purple-600" />,
              onClick: () => navigate('/connections?tab=pending_admin'),
            },
            {
              label: 'Review Enrollment',
              icon: <FiBookOpen className="text-[#1D4ED8]" />,
              onClick: () => navigate('/enrollments?tab=awaiting_confirmation'),
            },
            {
              label: 'Create Announcement',
              icon: <FiSend className="text-blue-600" />,
              onClick: () => navigate('/announcements-promotions/create'),
            },
            {
              label: 'Create Promotional Banner',
              icon: <FiImage className="text-amber-600" />,
              onClick: () => navigate('/announcements-promotions/banners'),
            },
          ]}
        />
      </div>

      {/* Greeting Banner */}
      <div className="p-4 sm:p-5 bg-linear-to-r from-[#0B1F3A] to-[#123B66] text-white rounded-xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#0B1F3A]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold font-geist">
              Good morning, Super Admin
            </h2>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Here's what's happening across TutorOn India.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/students')}
            className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-none"
          >
            Manage Students
          </Button>
          <div className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-mono text-emerald-300 border border-white/15">
            Phase 2: Active
          </div>
        </div>
      </div>

      {/* Six Primary Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiMetrics.map((item) => (
          <div
            key={item.id}
            onClick={item.onClick}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-subtle hover:border-slate-300 hover:shadow-card-hover transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">
                {item.title}
              </span>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-[#123B66]/10 transition-colors">
                {item.icon}
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="text-2xl font-bold text-slate-900 font-geist tracking-tight group-hover:text-[#123B66] transition-colors">
                {item.value}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  item.isAlert
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {item.change}
              </span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono text-slate-400">{item.badge}</span>
              <span className="text-[#123B66] font-medium flex items-center gap-1 group-hover:underline">
                View Details &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Snapshot Secondary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {platformSnapshots.map((snap, idx) => (
          <div
            key={idx}
            onClick={() => navigate(snap.path)}
            className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 hover:shadow-subtle transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {snap.title}
              </span>
              <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                {snap.icon}
              </div>
            </div>
            <p className="text-xl font-bold font-geist text-slate-900 mt-1">
              {snap.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {snap.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Platform Activity Chart */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-subtle p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-geist">
              Platform Activity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative volume trends across student registrations, teacher verification intake, enrollments, and protected connections.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveChartRange('7d')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeChartRange === '7d' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setActiveChartRange('30d')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeChartRange === '30d' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setActiveChartRange('6m')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeChartRange === '6m' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                6 Months
              </button>
            </div>
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#123B66]" />
            <span className="font-medium">Student Registrations</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-emerald-600" />
            <span className="font-medium">Teacher Registrations</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#1D4ED8]" />
            <span className="font-medium">Batch Enrollments</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-purple-600" />
            <span className="font-medium">Protected Connections</span>
          </div>
        </div>

        {/* Lightweight SVG Vector Chart */}
        <div className="h-64 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 800 240" preserveAspectRatio="none">
            <defs>
              <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#123B66" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#123B66" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            <line x1="0" y1="30" x2="800" y2="30" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="80" x2="800" y2="80" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="130" x2="800" y2="130" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="180" x2="800" y2="180" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="230" x2="800" y2="230" stroke="#e2e8f0" strokeWidth="1" />

            {/* Area Fills */}
            <path
              d="M 0,160 Q 120,120 240,140 T 480,90 T 720,60 L 800,45 L 800,230 L 0,230 Z"
              fill="url(#studentGradient)"
            />
            <path
              d="M 0,190 Q 140,170 280,160 T 560,120 T 800,90 L 800,230 L 0,230 Z"
              fill="url(#enrollmentGradient)"
            />

            {/* Series 1: Student Registrations (Navy) */}
            <path
              d="M 0,160 Q 120,120 240,140 T 480,90 T 720,60 L 800,45"
              fill="none"
              stroke="#123B66"
              strokeWidth="2.5"
            />
            {/* Series 2: Teacher Registrations (Emerald) */}
            <path
              d="M 0,205 Q 160,195 320,185 T 640,160 L 800,150"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            {/* Series 3: Batch Enrollments (Blue Accent) */}
            <path
              d="M 0,190 Q 140,170 280,160 T 560,120 T 800,90"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="2.5"
            />
            {/* Series 4: Protected Connections (Purple) */}
            <path
              d="M 0,215 Q 180,200 360,195 T 720,175 L 800,168"
              fill="none"
              stroke="#9333EA"
              strokeWidth="2"
            />

            {/* Interactive Data Points */}
            <circle cx="240" cy="140" r="4" fill="#123B66" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="480" cy="90" r="4" fill="#123B66" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="720" cy="60" r="4" fill="#123B66" stroke="#FFFFFF" strokeWidth="2" />

            <circle cx="280" cy="160" r="4" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="560" cy="120" r="4" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2" />
          </svg>

          {/* X Axis Labels */}
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
            <span>Sep 01</span>
            <span>Sep 06</span>
            <span>Sep 11</span>
            <span>Sep 16</span>
            <span>Sep 21</span>
            <span>Today (Sep 23)</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Pending Approvals (Table) & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Approvals Table (8 cols) */}
        <div id="pending-approvals-table" className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-subtle flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-geist">
                Pending Approvals
              </h2>
              <p className="text-xs text-slate-500">
                Teacher credential audits, student-teacher connection authorizations, and enrollment confirmations.
              </p>
            </div>
            <div className="flex items-center gap-2 w-85">
              <Badge variant="warning" size="sm">
                {approvals.filter((a) => a.status === 'Pending').length} Pending Review
              </Badge>
              <TableScrollButtons targetRef={approvalsTableRef} />
            </div>
          </div>

          <div ref={approvalsTableRef} className="overflow-x-auto flex-1 scroll-smooth">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Type & ID</th>
                  <th className="py-3 px-4">Request Details</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvals.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedApproval(item)}
                  >
                    {/* Type & ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 text-[11px] block">
                        {item.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 inline-block mt-0.5">
                        {item.id}
                      </span>
                    </td>

                    {/* Request Details */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-900 text-[11px] leading-tight line-clamp-2 max-w-[200px]">
                        {item.request}
                      </p>
                    </td>

                    {/* Submitted By */}
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                      <span className="truncate max-w-[140px] block" title={item.submittedBy}>
                        {item.submittedBy}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'Pending' && (
                          <div className="flex items-center gap-1 mr-1">
                            <button
                              type="button"
                              onClick={() => handleApprove(item.id)}
                              className="w-7 h-7 rounded-full text-emerald-600 hover:bg-emerald-50 border border-emerald-200 flex items-center justify-center transition-colors cursor-pointer"
                              title="Approve"
                              aria-label="Approve"
                            >
                              <FiCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(item.id)}
                              className="w-7 h-7 rounded-full text-danger hover:bg-red-50 border border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                              title="Reject"
                              aria-label="Reject"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApproval(item)}
                          leftIcon={<FiEye className="w-3.5 h-3.5" />}
                          className="h-7 text-xs px-2"
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <span>Critical gate for student privacy & tutor quality governance.</span>
            <button
              type="button"
              onClick={() => navigate('/teachers?tab=pending')}
              className="inline-flex items-center gap-1.5 font-semibold text-[#123B66] hover:text-[#1D4ED8] transition-colors cursor-pointer"
            >
              <span>View Full Audit Log</span>
              <span className="w-5 h-5 rounded-full bg-blue-50 text-[#123B66] flex items-center justify-center text-[10px]">
                →
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Recent Activity (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-subtle p-4 flex flex-col">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 font-geist">
              Recent Activity
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Live Pulse</span>
          </div>

          <div className="space-y-4 flex-1">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 leading-snug">
                    {act.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      {act.timestamp}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] text-slate-500 font-medium">
                      {act.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={() => toast.info('Activity Logs', 'Audit logging trail planned for Phase 6 release.')}
              className="text-xs text-[#123B66] font-medium hover:underline block text-center w-full cursor-pointer"
            >
              View Full Audit Log &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Approval Details Modal */}
      {selectedApproval && (
        <Modal
          isOpen={Boolean(selectedApproval)}
          onClose={() => setSelectedApproval(null)}
          title={`Review Approval — ${selectedApproval.type}`}
          description={`Reference ID: ${selectedApproval.id} · Submitted ${formatDate(selectedApproval.date)}`}
          size="md"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedApproval(null)}
              >
                Close
              </Button>
              {selectedApproval.status === 'Pending' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(selectedApproval.id)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(selectedApproval.id)}
                  >
                    Approve
                  </Button>
                </>
              )}
            </>
          }
        >
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{selectedApproval.request}</span>
                <StatusBadge status={selectedApproval.status} />
              </div>
              <p className="text-slate-500">
                Submitted by: <strong className="text-slate-700">{selectedApproval.submittedBy}</strong>
              </p>
            </div>

            {selectedApproval.details && (
              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Request Metadata & Documentation
                </h4>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  {Object.entries(selectedApproval.details).map(([key, val]) => (
                    <div key={key} className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <p className="font-medium text-slate-800">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default DashboardOverview;
