import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchDashboardActivity } from '../../API/thunks/dashboardThunks';
import { fetchTeachers, approveTeacher, rejectTeacher } from '../../API/thunks/teachersThunks';
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

  const dispatch = useDispatch();
  const { stats, activity, isLoadingStats, isLoadingActivity } = useSelector((state) => state.dashboard);

  const [pendingVerifications, setPendingVerifications] = useState([]);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchDashboardActivity());
    // Fetch pending teachers for the approvals table
    // URL: /admin/teachers/?verification_status=PENDING_VERIFICATION&page=1&page_size=10
    dispatch(fetchTeachers({ verification_status: 'PENDING_VERIFICATION', page: 1, page_size: 10 })).unwrap()
      .then((res) => {
        // fetchTeachers returns the full response object; data is in res.data
        const teachers = res?.data || (Array.isArray(res) ? res : []);
        setPendingVerifications(teachers);
      })
      .catch(() => setPendingVerifications([]));
  }, [dispatch]);

  // Safely extract from actual API response shape:
  // data.primary_kpis = array, data.secondary_metrics = array, data.admin_user = object
  const primaryKpis = stats?.primary_kpis || [];
  const secondaryMetrics = stats?.secondary_metrics || [];
  const operator = stats?.admin_user || { name: 'Super Admin' };

  // Convert primary_kpis array to a lookup map by id for easy access
  const kpi = Object.fromEntries(primaryKpis.map((k) => [k.id, k]));
  // Convert secondary_metrics array to a lookup map by id
  const sec = Object.fromEntries(secondaryMetrics.map((s) => [s.id, s]));

  // Six Primary Metric KPI Cards — mapped from API primary_kpis array
  const kpiMetrics = [
    {
      id: 'total_students',
      title: 'Total Students',
      value: kpi.total_students?.formatted_value || '0',
      change: kpi.total_students?.badge?.text || 'No data',
      isPositive: kpi.total_students?.badge?.variant !== 'danger',
      icon: <FiUsers className="w-5 h-5 text-[#123B66]" />,
      badge: kpi.total_students?.subtitle || 'Learners',
      onClick: () => navigate('/students'),
    },
    {
      id: 'total_teachers',
      title: 'Total Teachers',
      value: kpi.total_teachers?.formatted_value || '0',
      change: kpi.total_teachers?.badge?.text || 'No data',
      isPositive: kpi.total_teachers?.badge?.variant !== 'danger',
      icon: <FiUserCheck className="w-5 h-5 text-emerald-600" />,
      badge: kpi.total_teachers?.subtitle || 'Faculty',
      onClick: () => navigate('/teachers'),
    },
    {
      id: 'pending_verification',
      title: 'Pending Teacher Verification',
      value: kpi.pending_teacher_verification?.formatted_value || '0',
      change: kpi.pending_teacher_verification?.badge?.text || 'Needs attention',
      isAlert: true,
      icon: <FiClock className="w-5 h-5 text-amber-600" />,
      badge: kpi.pending_teacher_verification?.subtitle || 'Action Required',
      onClick: () => navigate('/teachers?tab=pending'),
    },
    {
      id: 'pending_enrollments',
      title: 'Pending Enrollments',
      value: kpi.pending_enrollments?.formatted_value || '0',
      change: kpi.pending_enrollments?.badge?.text || 'Requires confirmation',
      isAlert: true,
      icon: <FiBookOpen className="w-5 h-5 text-[#1D4ED8]" />,
      badge: kpi.pending_enrollments?.subtitle || 'Batches',
      onClick: () => navigate('/enrollments?tab=awaiting_confirmation'),
    },
    {
      id: 'active_batches',
      title: 'Active Batches',
      value: sec.active_batches?.formatted_value || '0',
      change: sec.active_batches?.subtext || 'Live across India',
      isPositive: true,
      icon: <FiLayers className="w-5 h-5 text-[#1D4ED8]" />,
      badge: 'Batches',
      onClick: () => navigate('/enrollments'),
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: kpi.revenue?.formatted_value || '₹0',
      change: kpi.revenue?.badge?.text || 'This month',
      isPositive: true,
      icon: <FiCreditCard className="w-5 h-5 text-emerald-700" />,
      badge: kpi.revenue?.subtitle || 'Gross Fees',
      onClick: () => navigate('/payments'),
    },
  ];

  // Secondary Snapshot Cards mapped from API secondary_metrics array
  const platformSnapshots = [];

  // Pending Approvals — from /admin/teachers/?verification_status=PENDING_VERIFICATION
  // Teacher shape: { id, display_name, email, phone, headline, subjects, verification_status, ... }
  const approvals = pendingVerifications.map((t) => ({
    id: t.id,
    type: 'Teacher Verification',
    request: `${t.display_name || 'Unknown Teacher'}${t.subjects?.length ? ' — ' + t.subjects.join(', ') : ''}`,
    submittedBy: t.email || '—',
    date: t.date_joined || t.created_at || new Date().toISOString(),
    status: 'Pending',
    details: {
      'Headline': t.headline || '—',
      'Subjects': t.subjects?.join(', ') || '—',
      'Hourly Rate': t.hourly_rate ? `₹${t.hourly_rate}` : '—',
      'Phone': t.phone || '—',
    },
  }));

  // Approve handler — calls real API
  const handleApprove = async (approvalId) => {
    try {
      await dispatch(approveTeacher({ id: approvalId, admin_notes: 'Approved by Super Admin.' })).unwrap();
      setPendingVerifications((prev) => prev.filter((v) => v.id !== approvalId));
      setSelectedApproval(null);
      toast.success('Teacher Verified', 'The teacher has been approved and is now verified.');
    } catch (e) {
      toast.error('Action Failed', e?.toString() || 'Could not approve verification.');
    }
  };

  // Reject handler — calls real API
  const handleReject = async (approvalId) => {
    try {
      await dispatch(rejectTeacher({ id: approvalId, rejection_reason: 'Rejected by Super Admin.', admin_note: '' })).unwrap();
      setPendingVerifications((prev) => prev.filter((v) => v.id !== approvalId));
      setSelectedApproval(null);
      toast.error('Verification Rejected', 'The teacher verification has been declined.');
    } catch (e) {
      toast.error('Action Failed', e?.toString() || 'Could not reject verification.');
    }
  };

  // Recent Activity Feed — from stats.recent_activity (same dashboard API response)
  const getCategoryIcon = (action) => {
    const a = (action || '').toUpperCase();
    if (a.includes('TEACHER') || a.includes('VERIFIED')) return <FiUserCheck className="w-4 h-4 text-[#123B66]" />;
    if (a.includes('ENROLLMENT') || a.includes('BATCH')) return <FiBookOpen className="w-4 h-4 text-[#1D4ED8]" />;
    if (a.includes('CONNECTION')) return <FiLink className="w-4 h-4 text-purple-600" />;
    if (a.includes('REVIEW')) return <FiStar className="w-4 h-4 text-amber-600" />;
    if (a.includes('ANNOUNCEMENT') || a.includes('BANNER')) return <FiSend className="w-4 h-4 text-blue-600" />;
    return <FiBell className="w-4 h-4 text-slate-600" />;
  };

  // Guard: ensure rawActivity is always an array regardless of API shape
  const rawActivity = Array.isArray(stats?.recent_activity)
    ? stats.recent_activity
    : Array.isArray(activity)
      ? activity
      : [];
  const recentActivities = rawActivity.map((item) => ({
    id: item.id,
    icon: getCategoryIcon(item.action || item.event_type),
    description: item.description,
    timestamp: new Date(item.created_at || item.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    category: item.action || item.event_type,
    actor: item.actor,
  }));

  // ─── Platform Activity Chart ─────────────────────────────────────────────
  // Source: stats.platform_activity.timeline (already inside dashboard API response)
  const rawTimeline = Array.isArray(stats?.platform_activity?.timeline)
    ? stats.platform_activity.timeline
    : [];

  // Filter timeline entries by the selected range button
  const filteredTimeline = (() => {
    if (activeChartRange === '7d') return rawTimeline.slice(-7);
    if (activeChartRange === '6m') return rawTimeline; // full set
    return rawTimeline.slice(-30); // default 30d
  })();

  // SVG coordinate helpers
  const C_W = 800; // viewBox width
  const C_TOP = 20; // chart top padding
  const C_BOT = 220; // chart baseline
  const C_H = C_BOT - C_TOP; // drawable height

  const chartSeriesKeys = ['student_registrations', 'teacher_registrations', 'batch_enrollments', 'protected_connections'];
  const chartMax = Math.max(1, ...filteredTimeline.flatMap((d) => chartSeriesKeys.map((k) => d[k] || 0)));

  const cX = (i) => (filteredTimeline.length <= 1 ? C_W / 2 : (i / (filteredTimeline.length - 1)) * C_W);
  const cY = (val) => C_BOT - (val / chartMax) * C_H;

  const makeLinePath = (key) => {
    if (!filteredTimeline.length) return '';
    return filteredTimeline.map((d, i) => `${i === 0 ? 'M' : 'L'} ${cX(i).toFixed(1)},${cY(d[key] || 0).toFixed(1)}`).join(' ');
  };

  const makeAreaPath = (key) => {
    if (!filteredTimeline.length) return '';
    const n = filteredTimeline.length;
    const line = filteredTimeline.map((d, i) => `${cX(i).toFixed(1)},${cY(d[key] || 0).toFixed(1)}`).join(' L ');
    return `M ${line} L ${cX(n - 1).toFixed(1)},${C_BOT} L ${cX(0).toFixed(1)},${C_BOT} Z`;
  };

  // X-axis: pick up to 6 evenly-spaced labels
  const xLabels = (() => {
    if (filteredTimeline.length <= 6) return filteredTimeline.map((d, i) => ({ label: d.label, i }));
    const step = (filteredTimeline.length - 1) / 5;
    return [0, 1, 2, 3, 4, 5].map((s) => {
      const idx = Math.round(s * step);
      return { label: filteredTimeline[idx]?.label, i: idx };
    });
  })();

  // Non-zero data points to highlight on chart
  const makeDataPoints = (key, color) =>
    filteredTimeline
      .map((d, i) => ({ x: cX(i), y: cY(d[key] || 0), val: d[key] || 0 }))
      .filter((p) => p.val > 0);
  // ─────────────────────────────────────────────────────────────────────────

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
            Quick Action
            </Button>
          }
          items={[
            {
              label: 'Verify Teacher',
              icon: <FiUserCheck className="text-emerald-600" />,
              onClick: () => navigate('/teachers?tab=pending'),
            },
            // {
            //   label: 'Review Connection',
            //   icon: <FiLink className="text-purple-600" />,
            //   onClick: () => navigate('/connections?tab=pending_admin'),
            // },
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
              Good morning, {operator.name}
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

        {/* Dynamic SVG Chart — driven by stats.platform_activity.timeline */}
        <div className="h-64 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 800 240" preserveAspectRatio="none">
            <defs>
              <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#123B66" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#123B66" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[30, 80, 130, 180].map((y) => (
              <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            <line x1="0" y1="220" x2="800" y2="220" stroke="#e2e8f0" strokeWidth="1" />

            {/* Area Fills */}
            {filteredTimeline.length > 0 && (
              <>
                <path d={makeAreaPath('student_registrations')} fill="url(#studentGradient)" />
                <path d={makeAreaPath('batch_enrollments')} fill="url(#enrollmentGradient)" />
              </>
            )}

            {/* Series Lines */}
            {filteredTimeline.length > 0 ? (
              <>
                <path d={makeLinePath('student_registrations')} fill="none" stroke="#123B66" strokeWidth="2.5" strokeLinejoin="round" />
                <path d={makeLinePath('teacher_registrations')} fill="none" stroke="#16A34A" strokeWidth="2" strokeDasharray="4 3" strokeLinejoin="round" />
                <path d={makeLinePath('batch_enrollments')} fill="none" stroke="#1D4ED8" strokeWidth="2.5" strokeLinejoin="round" />
                <path d={makeLinePath('protected_connections')} fill="none" stroke="#9333EA" strokeWidth="2" strokeLinejoin="round" />
              </>
            ) : (
              // No data placeholder line at baseline
              <text x="400" y="130" textAnchor="middle" fill="#94a3b8" fontSize="12">No activity data for this range</text>
            )}

            {/* Data Point Circles — only on non-zero values */}
            {makeDataPoints('student_registrations', '#123B66').map((p, i) => (
              <circle key={`sr-${i}`} cx={p.x} cy={p.y} r="4" fill="#123B66" stroke="#FFFFFF" strokeWidth="2" />
            ))}
            {makeDataPoints('batch_enrollments', '#1D4ED8').map((p, i) => (
              <circle key={`be-${i}`} cx={p.x} cy={p.y} r="4" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2" />
            ))}
            {makeDataPoints('teacher_registrations', '#16A34A').map((p, i) => (
              <circle key={`tr-${i}`} cx={p.x} cy={p.y} r="3.5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
            ))}
            {makeDataPoints('protected_connections', '#9333EA').map((p, i) => (
              <circle key={`pc-${i}`} cx={p.x} cy={p.y} r="3.5" fill="#9333EA" stroke="#FFFFFF" strokeWidth="2" />
            ))}
          </svg>

          {/* Dynamic X Axis Labels */}
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
            {xLabels.map((l, idx) => (
              <span key={idx}>{l.label}</span>
            ))}
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
