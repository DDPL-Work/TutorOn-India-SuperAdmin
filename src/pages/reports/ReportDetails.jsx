import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { INITIAL_REPORTS } from '../../data/reports';

export function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [report, setReport] = useState(() => {
    return INITIAL_REPORTS.find((r) => r.id === id) || null;
  });

  const [adminNotes, setAdminNotes] = useState(report?.adminNotes || '');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionText, setResolutionText] = useState('Grievance investigated and appropriate action taken.');

  if (!report) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/reports')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Reports
        </button>
        <EmptyState
          icon={FiAlertTriangle}
          title="Report Ticket Not Found"
          description={`No incident report matches ticket ID ${id}.`}
          action={
            <Button variant="primary" size="sm" onClick={() => navigate('/reports')}>
              Return to Reports Directory
            </Button>
          }
        />
      </div>
    );
  }

  // Handle Mark Under Review
  const handleMarkUnderReview = () => {
    const updatedTimeline = [
      ...report.timeline,
      {
        action: 'Case Placed Under Review',
        timestamp: 'Today, Just now',
        performedBy: 'Super Admin (sudhanshu@tutoron.in)',
        notes: 'Assigned for formal review.',
      },
    ];

    setReport({
      ...report,
      status: 'Under Review',
      timeline: updatedTimeline,
    });
    toast.info('Status Updated', 'Ticket is now flagged as Under Review.');
  };

  // Handle Resolve
  const handleResolve = () => {
    const updatedTimeline = [
      ...report.timeline,
      {
        action: 'Grievance Resolved by Super Admin',
        timestamp: 'Today, Just now',
        performedBy: 'Super Admin (sudhanshu@tutoron.in)',
        notes: resolutionText,
      },
    ];

    setReport({
      ...report,
      status: 'Resolved',
      resolution: resolutionText,
      timeline: updatedTimeline,
      adminNotes: adminNotes,
    });
    setResolveModalOpen(false);
    toast.success('Report Resolved', `Case ${report.id} has been formally closed.`);
  };

  // Handle Dismiss
  const handleDismiss = () => {
    const updatedTimeline = [
      ...report.timeline,
      {
        action: 'Report Dismissed',
        timestamp: 'Today, Just now',
        performedBy: 'Super Admin (sudhanshu@tutoron.in)',
        notes: 'Dismissed after review of platform guidelines.',
      },
    ];

    setReport({
      ...report,
      status: 'Dismissed',
      resolution: 'Dismissed per standard platform arbitration.',
      timeline: updatedTimeline,
    });
    toast.error('Report Dismissed', `Ticket ${report.id} has been dismissed.`);
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
            <Link to="/reports" className="hover:text-[#123B66] hover:underline font-medium">
              Reports
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li className="font-semibold text-slate-800 font-mono">{report.id}</li>
        </ol>
      </nav>

      {/* Header and Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold font-geist text-slate-900 tracking-tight">
                Case Dossier: <span className="font-mono text-[#123B66]">{report.id}</span>
              </h1>
              <StatusBadge status={report.status} />
              <Badge
                variant={
                  report.priority === 'Critical' || report.priority === 'High'
                    ? 'danger'
                    : 'warning'
                }
                size="sm"
              >
                Priority: {report.priority}
              </Badge>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {report.category}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Submitted on {report.date} • Super Admin Grievance Desk
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/reports')}
              leftIcon={<FiArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to List
            </Button>

            {report.status === 'Open' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkUnderReview}
                className="text-blue-700 hover:bg-blue-50"
              >
                Mark Under Review
              </Button>
            )}

            {report.status !== 'Resolved' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setResolveModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                leftIcon={<FiCheck className="w-3.5 h-3.5" />}
              >
                Resolve Case
              </Button>
            )}

            {report.status !== 'Dismissed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="text-slate-600 hover:bg-slate-100"
                leftIcon={<FiX className="w-3.5 h-3.5" />}
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Parties & Grievance Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reporter & Reported User Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Complainant Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Complainant (Reporting Party)
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{report.reportedBy.name}</h3>
                <span className="font-mono text-xs text-slate-500">
                  {report.reportedBy.id} • {report.reportedBy.role}
                </span>
                <p className="text-xs text-slate-600 mt-1">{report.reportedBy.email}</p>
              </div>
            </div>

            {/* Reported User Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 font-bold block">
                Reported User (Accused Party)
              </span>
              <div className="flex items-center gap-3">
                <img
                  src={report.reportedUser.avatar}
                  alt={report.reportedUser.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{report.reportedUser.name}</h3>
                  <span className="font-mono text-xs text-slate-500">
                    {report.reportedUser.id} • {report.reportedUser.role}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{report.reportedUser.subject}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grievance Statement */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FiAlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Full Grievance Statement</span>
            </h2>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
              {report.description}
            </div>

            {/* Evidence Attachments */}
            {report.evidenceUrls && report.evidenceUrls.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="font-semibold text-slate-800 text-xs">Submitted Evidence Screenshot</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-w-md">
                  <img
                    src={report.evidenceUrls[0]}
                    alt="Evidence Screenshot"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2 bg-slate-50 text-[10px] text-slate-500 text-center font-mono">
                    Screenshot_Chat_Log_Batch101.png
                  </div>
                </div>
              </div>
            )}

            {/* Resolution Statement */}
            {report.resolution && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Official Resolution</span>
                </div>
                <p className="text-emerald-800">{report.resolution}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Admin Notes & Incident Timeline */}
        <div className="space-y-6">
          {/* Admin Investigation Notepad */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-[#123B66]" />
              <span>Admin Investigation Notes</span>
            </h2>

            <p className="text-slate-500 text-[11px]">
              Internal notes visible only to Super Admin personnel:
            </p>

            <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#123B66] resize-none"
              placeholder="Record investigative findings, call notes with parents or faculty..."
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReport({ ...report, adminNotes });
                toast.success('Notes Saved', 'Investigation notes updated.');
              }}
              className="w-full justify-center text-xs"
            >
              Save Internal Notes
            </Button>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FiClock className="w-4 h-4 text-slate-500" />
              <span>Incident Timeline</span>
            </h2>

            <div className="space-y-3">
              {report.timeline.map((event, idx) => (
                <div key={idx} className="text-xs pl-3 border-l-2 border-slate-200 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{event.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{event.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{event.performedBy}</p>
                  {event.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded mt-0.5">
                      {event.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Grievance Ticket"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
            <p className="font-semibold text-emerald-900">Close & Resolve Report</p>
            <p className="mt-1 text-emerald-700">
              Document the formal corrective measure or mediation outcome before concluding this ticket.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="report-resolution-summary" className="block font-semibold text-slate-700">
              Resolution Summary
            </label>
            <textarea
              id="report-resolution-summary"
              rows={3}
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleResolve}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              leftIcon={<FiCheck className="w-3.5 h-3.5" />}
            >
              Confirm Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ReportDetails;
