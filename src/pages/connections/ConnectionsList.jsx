import { useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiLock,
  FiUnlock,
  FiShield,
  FiClock,
  FiEye,
  FiCheck,
  FiX,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import FilterBar from '../../components/ui/FilterBar';
import TableScrollButtons from '../../components/ui/TableScrollButtons';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { INITIAL_CONNECTIONS } from '../../data/connections';
import { formatDate } from '../../utils/formatters';

export function ConnectionsList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tableRef = useRef(null);
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  
  const tabParam = searchParams.get('tab');
  const statusFilter =
    tabParam === 'pending_admin'
      ? 'Pending Admin Verification'
      : tabParam === 'pending_student'
      ? 'Pending Student Approval'
      : tabParam === 'approved'
      ? 'Approved'
      : tabParam === 'rejected'
      ? 'Rejected'
      : 'ALL';

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Approval/Rejection Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: 'approve', // 'approve' | 'reject'
    connection: null,
    notes: '',
  });

  const handleFilterChange = (status) => {
    setCurrentPage(1);
    if (status === 'Pending Admin Verification') setSearchParams({ tab: 'pending_admin' });
    else if (status === 'Pending Student Approval') setSearchParams({ tab: 'pending_student' });
    else if (status === 'Approved') setSearchParams({ tab: 'approved' });
    else if (status === 'Rejected') setSearchParams({ tab: 'rejected' });
    else setSearchParams({});
  };

  // Filtered & Searched Connections
  const filteredConnections = useMemo(() => {
    return connections.filter((conn) => {
      // Status match
      if (statusFilter !== 'ALL' && conn.status !== statusFilter) {
        return false;
      }

      // Search match
      const query = searchTerm.toLowerCase().trim();
      if (!query) return true;

      const matchesId = conn.id.toLowerCase().includes(query);
      const matchesTeacher = conn.teacher.name.toLowerCase().includes(query) || conn.teacher.subject.toLowerCase().includes(query);
      const matchesStudent = conn.student.name.toLowerCase().includes(query) || conn.student.grade.toLowerCase().includes(query);
      const matchesReason = conn.reason.toLowerCase().includes(query);

      return matchesId || matchesTeacher || matchesStudent || matchesReason;
    });
  }, [connections, statusFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredConnections.length / pageSize) || 1;
  const paginatedConnections = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredConnections.slice(start, start + pageSize);
  }, [filteredConnections, currentPage, pageSize]);

  // Open Approval Modal
  const openApproveModal = (conn) => {
    setActionModal({
      isOpen: true,
      type: 'approve',
      connection: conn,
      notes: 'Super Admin verified legitimate academic mentoring inquiry. Contact disclosure authorized.',
    });
  };

  // Open Reject Modal
  const openRejectModal = (conn) => {
    setActionModal({
      isOpen: true,
      type: 'reject',
      connection: conn,
      notes: 'Request does not satisfy verified batch enrollment prerequisites or was flagged by student guardian.',
    });
  };

  // Confirm Action
  const handleConfirmAction = () => {
    const { type, connection, notes } = actionModal;
    if (!connection) return;

    const nextStatus = type === 'approve' ? 'Approved' : 'Rejected';
    const nextAdminVerif = type === 'approve' ? 'Verified' : 'Rejected';

    const auditEntry = {
      id: `AUD-CON-${Date.now()}`,
      action: type === 'approve' ? 'Admin Approved Disclosure' : 'Admin Declined Contact Sharing',
      by: 'Super Admin',
      timestamp: new Date().toISOString(),
      notes,
    };

    setConnections((prev) =>
      prev.map((c) => {
        if (c.id === connection.id) {
          const updatedTimeline = c.workflowTimeline.map((step) => {
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
                note: type === 'approve' ? 'Unlocked contact numbers between both parties' : 'Contact remains locked and shielded',
              };
            }
            return step;
          });

          return {
            ...c,
            status: nextStatus,
            adminVerification: nextAdminVerif,
            workflowTimeline: updatedTimeline,
            auditLog: [auditEntry, ...(c.auditLog || [])],
          };
        }
        return c;
      })
    );

    setActionModal({ isOpen: false, type: 'approve', connection: null, notes: '' });

    if (type === 'approve') {
      toast.success(
        'Contact Sharing Authorized',
        `Connection ${connection.id} approved. Contact details unlocked between ${connection.teacher.name} and ${connection.student.name}.`
      );
    } else {
      toast.error(
        'Contact Request Declined',
        `Connection ${connection.id} rejected. Phone numbers remain shielded.`
      );
    }
  };

  const pendingAdminCount = connections.filter((c) => c.status === 'Pending Admin Verification').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Connections"
        subtitle="Manage contact-sharing approval."
        badge={
          <Badge variant="navy" size="sm">
            Protected Privacy Gate
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiDownload className="w-3.5 h-3.5" />}
            onClick={() => toast.success('Export Dispatched', 'Exporting contact-sharing audit log as CSV.')}
          >
            Export Log
          </Button>
        }
      />

      {/* 4-Step Exact Workflow Explainer Banner */}
      <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiShield className="w-4 h-4 text-[#123B66]" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-geist">
              TutorOn India Mandatory Contact Disclosure Workflow
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
            Zero Unsolicited Calls
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#123B66] text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-800">Teacher Requests</p>
              <p className="text-[11px] text-slate-500">Files reason & batch</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-800">Student Approves</p>
              <p className="text-[11px] text-slate-500">Parent/Student consent</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
              3
            </div>
            <div>
              <p className="font-semibold text-amber-900">Admin Verifies</p>
              <p className="text-[11px] text-amber-700">Super Admin clearance</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
              4
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Contact Unlocks</p>
              <p className="text-[11px] text-emerald-700">Protected channel open</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {[
          { id: 'ALL', label: 'All Requests', count: connections.length },
          { id: 'Pending Admin Verification', label: 'Pending Admin Verification', count: pendingAdminCount, isAlert: pendingAdminCount > 0 },
          { id: 'Pending Student Approval', label: 'Pending Student Approval', count: connections.filter((c) => c.status === 'Pending Student Approval').length },
          { id: 'Approved', label: 'Approved & Unlocked', count: connections.filter((c) => c.status === 'Approved').length },
          { id: 'Rejected', label: 'Rejected / Blocked', count: connections.filter((c) => c.status === 'Rejected').length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleFilterChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === tab.id
                ? 'border-[#123B66] text-[#0B1F3A] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                tab.isAlert ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar: Search */}
      <FilterBar
        isFiltered={searchTerm !== ''}
        activeFilterCount={searchTerm !== '' ? 1 : 0}
        onReset={() => setSearchTerm('')}
        actions={
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <TableScrollButtons targetRef={tableRef} />
          </div>
        }
      >
        <div className="w-48 sm:w-60 md:w-72 flex-1 min-w-[140px] max-w-sm">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            onClear={() => setSearchTerm('')}
            placeholder="Search request ID, teacher, student, reason..."
            size="sm"
          />
        </div>
      </FilterBar>

      {/* Connections Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-subtle overflow-hidden">
        {paginatedConnections.length > 0 ? (
          <div ref={tableRef} className="overflow-x-auto scroll-smooth">
            <table className="w-full min-w-[1060px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3.5 min-w-[105px] whitespace-nowrap">Request ID</th>
                  <th className="py-3 px-3.5 min-w-[200px] whitespace-nowrap">Teacher</th>
                  <th className="py-3 px-3.5 min-w-[190px] whitespace-nowrap">Student</th>
                  <th className="py-3 px-3.5 min-w-[100px] whitespace-nowrap">Date</th>
                  <th className="py-3 px-3.5 min-w-[170px] text-center whitespace-nowrap">Approvals Track</th>
                  <th className="py-3 px-3.5 min-w-[160px] whitespace-nowrap">Status</th>
                  <th className="py-3 px-3.5 min-w-[135px] text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedConnections.map((conn) => (
                  <tr
                    key={conn.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/connections/${conn.id}`)}
                  >
                    {/* Request ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {conn.id}
                      </span>
                    </td>

                    {/* Teacher with Circular Avatar */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={conn.teacher.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-[#123B66] transition-colors leading-tight">
                            {conn.teacher.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {conn.teacher.subject} · <span className="font-mono">{conn.teacher.id}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Student with Circular Avatar */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={conn.student.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {conn.student.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {conn.student.grade} · <span className="font-mono">{conn.student.id}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Request Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(conn.requestDate)}
                    </td>

                    {/* Approvals Track (Student + Admin) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-full font-medium ${
                            conn.studentApproval === 'Approved'
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                              : conn.studentApproval === 'Pending'
                              ? 'text-amber-700 bg-amber-50 border border-amber-100'
                              : 'text-danger bg-red-50 border border-red-100'
                          }`}
                        >
                          {conn.studentApproval === 'Approved' ? <FiCheck className="w-2.5 h-2.5" /> : conn.studentApproval === 'Pending' ? <FiClock className="w-2.5 h-2.5" /> : <FiX className="w-2.5 h-2.5" />}
                          Student: {conn.studentApproval}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-full font-medium ${
                            conn.adminVerification === 'Verified'
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                              : conn.adminVerification === 'Pending'
                              ? 'text-amber-700 bg-amber-50 border border-amber-100'
                              : 'text-danger bg-red-50 border border-red-100'
                          }`}
                        >
                          <FiShield className="w-2.5 h-2.5" /> Admin: {conn.adminVerification}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {conn.status === 'Approved' ? (
                          <FiUnlock className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <FiLock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <StatusBadge status={conn.status} />
                      </div>
                    </td>

                    {/* Actions & Buttons */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        {conn.status === 'Pending Admin Verification' && (
                          <div className="flex items-center gap-1 mr-1">
                            <button
                              type="button"
                              onClick={() => openApproveModal(conn)}
                              className="w-7 h-7 rounded-full text-emerald-600 hover:bg-emerald-50 border border-emerald-200 flex items-center justify-center transition-colors cursor-pointer"
                              title="Verify & Unlock Contact"
                              aria-label="Approve connection"
                            >
                              <FiCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openRejectModal(conn)}
                              className="w-7 h-7 rounded-full text-danger hover:bg-red-50 border border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                              title="Reject & Block Contact"
                              aria-label="Reject connection"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/connections/${conn.id}`)}
                          leftIcon={<FiEye className="w-3.5 h-3.5" />}
                          className="h-7 text-xs px-2.5 whitespace-nowrap"
                        >
                          View Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No connection requests found"
            description="No contact disclosure records match your current filter selection."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  handleFilterChange('ALL');
                }}
              >
                Reset Filters
              </Button>
            }
          />
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredConnections.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Action Approval / Rejection Modal */}
      {actionModal.isOpen && actionModal.connection && (
        <Modal
          isOpen={actionModal.isOpen}
          onClose={() => setActionModal({ isOpen: false, type: 'approve', connection: null, notes: '' })}
          title={
            actionModal.type === 'approve'
              ? `Authorize Contact Disclosure — ${actionModal.connection.id}`
              : `Decline Contact Request — ${actionModal.connection.id}`
          }
          description={`Between ${actionModal.connection.teacher.name} and ${actionModal.connection.student.name}`}
          size="md"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActionModal({ isOpen: false, type: 'approve', connection: null, notes: '' })}
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
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{actionModal.connection.id}</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {formatDate(actionModal.connection.requestDate)}
                </span>
              </div>
              <p className="text-slate-700">
                Reason: <em>"{actionModal.connection.reason}"</em>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {actionModal.type === 'approve'
                  ? 'Administrative Verification Audit Remarks'
                  : 'Rejection Reason (Recorded for privacy audit)'}
              </label>
              <textarea
                rows={3}
                required
                value={actionModal.notes}
                onChange={(e) => setActionModal({ ...actionModal, notes: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {actionModal.type === 'approve'
                  ? 'Authorizing will decrypt and unlock mutual phone number access on student and teacher portals.'
                  : 'Declining keeps all phone numbers securely masked and shielded.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ConnectionsList;
