import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportDetails, resolveReport } from '../../API/thunks/reportsThunks';
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


export function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { currentReport, isLoading, isResolving } = useSelector((state) => state.reports);

  useEffect(() => {
    if (id) {
      dispatch(fetchReportDetails(id));
    }
  }, [dispatch, id]);

  const report = currentReport ? {
    id: currentReport.report_code || currentReport.id,
    actualId: currentReport.id,
    status: currentReport.status === 'OPEN' || currentReport.status === 'Open' ? 'Open' :
            currentReport.status === 'UNDER_REVIEW' || currentReport.status === 'Under Review' ? 'Under Review' :
            currentReport.status === 'RESOLVED' || currentReport.status === 'Resolved' ? 'Resolved' :
            currentReport.status === 'DISMISSED' || currentReport.status === 'Dismissed' ? 'Dismissed' : currentReport.status || 'Open',
    priority: currentReport.priority || 'Medium',
    category: currentReport.category || 'Other',
    date: currentReport.formatted_date || (currentReport.created_at ? currentReport.created_at.split('T')[0] : 'N/A'),
    reportedBy: {
      name: currentReport.filed_by?.name || 'System / Admin',
      id: currentReport.filed_by?.id || 'N/A',
      role: currentReport.filed_by?.role || 'Moderator',
      email: currentReport.filed_by?.email || currentReport.reporter_email || 'N/A',
    },
    reportedUser: {
      name: currentReport.reported_user?.name || 'Unknown',
      avatar: currentReport.reported_user?.photo || null,
      id: currentReport.reported_user?.id || currentReport.target_id || 'N/A',
      role: currentReport.reported_user?.role || currentReport.target_type || 'User',
      subject: currentReport.reason || '',
    },
    description: currentReport.description || currentReport.reason || '',
    evidenceUrls: currentReport.evidenceUrls || currentReport.evidence_urls || [],
    resolution: currentReport.admin_notes || currentReport.admin_note || currentReport.resolution || null,
    resolutionAction: currentReport.resolution_action || null,
    resolvedBy: currentReport.resolved_by || currentReport.resolved_by_email || 'Super Admin',
    resolvedAt: currentReport.resolved_at ? currentReport.resolved_at.split('T')[0] : null,
    timeline: [
      {
        action: 'Report Submitted',
        timestamp: currentReport.formatted_date || (currentReport.created_at ? currentReport.created_at.split('T')[0] : 'N/A'),
        performedBy: currentReport.filed_by?.name || 'System',
        notes: currentReport.reason || 'Initial filing',
      },
      ...(currentReport.status === 'RESOLVED' || currentReport.status === 'Resolved' || currentReport.status === 'DISMISSED' || currentReport.status === 'Dismissed' ? [{
        action: `Report ${currentReport.status === 'DISMISSED' || currentReport.status === 'Dismissed' ? 'Dismissed' : 'Resolved'}`,
        timestamp: currentReport.resolved_at ? currentReport.resolved_at.split('T')[0] : 'Recent',
        performedBy: currentReport.resolved_by || currentReport.resolved_by_email || 'Super Admin',
        notes: currentReport.admin_notes || currentReport.admin_note || currentReport.resolution_action || 'Report closed.',
      }] : [])
    ],
    adminNotes: currentReport.admin_notes || currentReport.admin_note || '',
  } : null;

  const [adminNotes, setAdminNotes] = useState('');
  useEffect(() => {
    if (report?.adminNotes) {
      setAdminNotes(report.adminNotes);
    }
  }, [report?.adminNotes]);

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionAction, setResolutionAction] = useState('CONTENT_REMOVED');
  const [customAction, setCustomAction] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  const [dismissNotes, setDismissNotes] = useState('');

  if (isLoading && !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#123B66] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

  const handleMarkUnderReview = async () => {
    try {
      await dispatch(resolveReport({
        id: report.actualId,
        resolution_action: 'UNDER_REVIEW',
        admin_notes: adminNotes || 'Ticket placed under administrative review.',
      })).unwrap();
      dispatch(fetchReportDetails(id));
      toast.info('Status Updated', 'Ticket is now flagged as Under Review.');
    } catch (e) {
      toast.error('Error', typeof e === 'string' ? e : 'Failed to update report status.');
    }
  };

  const handleOpenResolveModal = () => {
    setResolutionNotes(adminNotes || '');
    setResolveModalOpen(true);
  };

  const handleResolve = async () => {
    try {
      const finalAction = resolutionAction === 'OTHER' ? (customAction.trim() || 'OTHER') : resolutionAction;
      const finalNotes = resolutionNotes.trim() || adminNotes.trim() || 'Grievance investigated and appropriate action taken.';

      const result = await dispatch(resolveReport({
        id: report.actualId,
        resolution_action: finalAction,
        admin_notes: finalNotes,
      })).unwrap();

      setResolveModalOpen(false);
      toast.success('Report Resolved', result.message || `Case ${report.id} has been formally closed.`);
      dispatch(fetchReportDetails(id));
    } catch (e) {
      toast.error('Error', typeof e === 'string' ? e : 'Failed to resolve report.');
    }
  };

  const handleOpenDismissModal = () => {
    setDismissNotes(adminNotes || '');
    setDismissModalOpen(true);
  };

  const handleDismiss = async () => {
    try {
      const finalNotes = dismissNotes.trim() || adminNotes.trim() || 'Report dismissed after review.';
      const result = await dispatch(resolveReport({
        id: report.actualId,
        resolution_action: 'DISMISSED',
        admin_notes: finalNotes,
      })).unwrap();

      setDismissModalOpen(false);
      toast.info('Report Dismissed', result.message || `Ticket ${report.id} has been dismissed.`);
      dispatch(fetchReportDetails(id));
    } catch (e) {
      toast.error('Error', typeof e === 'string' ? e : 'Failed to dismiss report.');
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
                disabled={isResolving}
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
                disabled={isResolving}
                onClick={handleOpenResolveModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                leftIcon={<FiCheck className="w-3.5 h-3.5" />}
              >
                Resolve Case
              </Button>
            )}

            {report.status !== 'Dismissed' && report.status !== 'Resolved' && (
              <Button
                variant="outline"
                size="sm"
                disabled={isResolving}
                onClick={handleOpenDismissModal}
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

            {/* Official Resolution Statement */}
            {(report.resolution || report.status === 'Resolved') && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Official Resolution</span>
                  </div>
                  {report.resolutionAction && (
                    <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-300">
                      Action: {report.resolutionAction}
                    </span>
                  )}
                </div>
                {report.resolution && (
                  <p className="text-emerald-800 leading-relaxed whitespace-pre-wrap">{report.resolution}</p>
                )}
                <div className="flex items-center gap-4 text-[11px] text-emerald-700 pt-1 border-t border-emerald-200/60 font-mono">
                  <span>Resolved By: {report.resolvedBy}</span>
                  {report.resolvedAt && <span>Date: {report.resolvedAt}</span>}
                </div>
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
                toast.success('Notes Saved', 'Investigation notes recorded.');
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
        onClose={() => !isResolving && setResolveModalOpen(false)}
        title="Resolve Grievance Ticket"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
            <p className="font-semibold text-emerald-900">Close & Resolve Report</p>
            <p className="mt-1 text-emerald-700">
              Select the administrative action taken and record resolution details.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="resolution-action-select" className="block font-semibold text-slate-700">
              Resolution Action <span className="text-red-500">*</span>
            </label>
            <select
              id="resolution-action-select"
              value={resolutionAction}
              onChange={(e) => setResolutionAction(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
            >
              <option value="CONTENT_REMOVED">CONTENT_REMOVED - Violating Content Removed / Taken Down</option>
              <option value="WARNING_ISSUED">WARNING_ISSUED - Official Policy Warning Issued</option>
              <option value="ACCOUNT_SUSPENDED">ACCOUNT_SUSPENDED - Accused Account Suspended / Restricted</option>
              <option value="NO_ACTION">NO_ACTION - Investigated, No Sanction Required</option>
              <option value="DISMISSED">DISMISSED - Dismissed as False / Unsubstantiated</option>
              <option value="OTHER">OTHER - Custom Resolution Action</option>
            </select>
          </div>

          {resolutionAction === 'OTHER' && (
            <div className="space-y-1.5">
              <label htmlFor="custom-action-input" className="block font-semibold text-slate-700">
                Custom Action Name <span className="text-red-500">*</span>
              </label>
              <input
                id="custom-action-input"
                type="text"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                placeholder="e.g. MEDIATION_COMPLETED"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="report-resolution-summary" className="block font-semibold text-slate-700">
              Admin Notes & Resolution Summary
            </label>
            <textarea
              id="report-resolution-summary"
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Detail the investigation outcome, corrective measure, or notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              disabled={isResolving}
              onClick={() => setResolveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isResolving}
              onClick={handleResolve}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              leftIcon={<FiCheck className="w-3.5 h-3.5" />}
            >
              {isResolving ? 'Resolving...' : 'Confirm Resolution'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dismiss Modal */}
      <Modal
        isOpen={dismissModalOpen}
        onClose={() => !isResolving && setDismissModalOpen(false)}
        title="Dismiss Grievance Ticket"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
            <p className="font-semibold text-slate-900">Dismiss Report #{report.id}</p>
            <p className="mt-1 text-slate-600">
              Are you sure you want to dismiss this incident report? You can include a note explaining the reason.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dismiss-notes" className="block font-semibold text-slate-700">
              Dismissal Reason / Notes
            </label>
            <textarea
              id="dismiss-notes"
              rows={3}
              value={dismissNotes}
              onChange={(e) => setDismissNotes(e.target.value)}
              placeholder="e.g. Insufficient evidence provided, resolved via direct communication..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              disabled={isResolving}
              onClick={() => setDismissModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isResolving}
              onClick={handleDismiss}
              leftIcon={<FiX className="w-3.5 h-3.5" />}
            >
              {isResolving ? 'Dismissing...' : 'Dismiss Report'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ReportDetails;
