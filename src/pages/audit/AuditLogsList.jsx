import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShield,
  FiEye,
} from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { INITIAL_AUDIT_LOGS } from '../../data/auditLogs';

export function AuditLogsList() {
  const navigate = useNavigate();

  const [auditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchAction = item.action.toLowerCase().includes(q);
        const matchAdmin = item.admin.toLowerCase().includes(q);
        const matchUser = item.userId.toLowerCase().includes(q);
        const matchEntity = item.relatedEntity.toLowerCase().includes(q);
        const matchReason = item.reason.toLowerCase().includes(q);
        if (!matchId && !matchAction && !matchAdmin && !matchUser && !matchEntity && !matchReason) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, categoryFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Columns definition
  const columns = [
    {
      key: 'id',
      header: 'Log ID',
      className: 'w-32 font-mono text-xs font-semibold text-[#123B66]',
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/audit-logs/${row.id}`)}
          className="hover:underline hover:text-[#1D4ED8] cursor-pointer text-left font-mono font-medium text-xs flex items-center gap-1.5"
        >
          <FiShield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {row.id}
        </button>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-xs block">{row.action}</span>
          <Badge
            variant={
              row.category === 'Verification'
                ? 'success'
                : row.category === 'Privacy'
                ? 'navy'
                : row.category === 'Enrollment'
                ? 'info'
                : row.category === 'Safety'
                ? 'danger'
                : 'slate'
            }
            size="sm"
            className="text-[10px] mt-0.5"
          >
            {row.category}
          </Badge>
        </div>
      ),
    },
    {
      key: 'admin',
      header: 'Admin',
      className: 'text-xs text-slate-700 truncate max-w-[160px]',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 block truncate">{row.admin}</span>
          <span className="text-[10px] text-slate-400 font-mono block">{row.ipAddress}</span>
        </div>
      ),
    },
    {
      key: 'userId',
      header: 'User ID',
      className: 'font-mono text-xs font-medium text-slate-800 whitespace-nowrap',
      render: (row) => row.userId,
    },
    {
      key: 'relatedEntity',
      header: 'Related Entity',
      className: 'text-xs text-slate-700 max-w-[200px]',
      render: (row) => <span className="truncate block">{row.relatedEntity}</span>,
    },
    {
      key: 'timestamp',
      header: 'Date & Time',
      className: 'font-mono text-[11px] text-slate-600 whitespace-nowrap',
      render: (row) => row.timestamp,
    },
    {
      key: 'reason',
      header: 'Reason / Notes',
      render: (row) => (
        <p className="text-xs text-slate-600 line-clamp-2 max-w-[240px]" title={row.reason}>
          {row.reason}
        </p>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/audit-logs/${row.id}`)}
          leftIcon={<FiEye className="w-3.5 h-3.5" />}
          className="h-7 text-xs px-2"
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable supervisory audit trail of administrative approvals, verification decisions, and policy enforcement."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="navy" size="md" className="gap-1.5 py-1 px-3 font-mono">
              <FiShield className="w-3.5 h-3.5 text-[#123B66]" />
              <span>{auditLogs.length} Logged Events</span>
            </Badge>
          </div>
        }
      />

      {/* Toolbar: Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search audit ID, action, admin, user ID, or reason..."
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs text-slate-500">Action Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#123B66] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Verification">Teacher Verification</option>
              <option value="Privacy">Contact Privacy</option>
              <option value="Enrollment">Batch Enrollment</option>
              <option value="Moderation">Content & Reviews</option>
              <option value="Safety">Safety & Abuse</option>
              <option value="Communications">Platform Announcements</option>
              <option value="Marketing">Promotional Banners</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredLogs.length > 0 ? (
          <>
            <DataTable columns={columns} data={paginatedLogs} className="border-none" />
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredLogs.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </div>
          </>
        ) : (
          <EmptyState
            icon={FiShield}
            title="No audit entries found"
            description="No administrative logs match your search parameters."
          />
        )}
      </div>
    </div>
  );
}

export default AuditLogsList;
