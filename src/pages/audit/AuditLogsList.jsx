import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs } from '../../API/thunks/auditThunks';
import {
  FiShield,
  FiEye,
} from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import DataTable from '../../components/ui/DataTable';
import TableScrollButtons from '../../components/ui/TableScrollButtons';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';


export function AuditLogsList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tableRef = useRef(null);
  
  const { data: allLogs, totalCount, isLoading } = useSelector((state) => state.audit);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch data
  useEffect(() => {
    dispatch(fetchAuditLogs({
      page: currentPage,
      page_size: pageSize,
      search: searchQuery,
      category: categoryFilter === 'ALL' ? undefined : categoryFilter
    }));
  }, [dispatch, currentPage, pageSize, searchQuery, categoryFilter]);

  // Map data
  const auditLogs = (allLogs || []).map(r => ({
    id: r.audit_code || r.id,
    actualId: r.id,
    action: r.action || 'Unknown Action',
    category: r.category || 'Other',
    admin: r.actor_name || r.actor_email || 'System',
    ipAddress: r.ip_address || 'N/A',
    relatedEntity: r.description || r.target_entity || 'N/A',
    userId: r.object_id || r.object_type || '',
    timestamp: r.timestamp || (r.created_at ? r.created_at.split('T')[0] : 'N/A'),
    reason: r.notes || r.action || '',
  }));

  const filteredLogs = auditLogs;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedLogs = filteredLogs;

  // Columns definition
  const columns = [
    {
      key: 'action',
      header: 'Action & Category',
      render: (row) => (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-[#123B66] flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
            <FiShield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 text-xs block group-hover:text-[#123B66] transition-colors">{row.action}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">{row.id}</span>
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
                className="text-[10px]"
              >
                {row.category}
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'admin',
      header: 'Admin Operator',
      className: 'text-xs text-slate-700 whitespace-nowrap',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 block">{row.admin}</span>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{row.ipAddress}</span>
        </div>
      ),
    },
    {
      key: 'relatedEntity',
      header: 'Target Entity & User',
      render: (row) => (
        <div className="max-w-[200px]">
          <span className="text-xs font-medium text-slate-900 block truncate" title={row.relatedEntity}>{row.relatedEntity}</span>
          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{row.userId}</span>
        </div>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      className: 'font-mono text-xs text-slate-500 whitespace-nowrap',
      render: (row) => row.timestamp,
    },
    {
      key: 'reason',
      header: 'Notes & Compliance',
      render: (row) => (
        <p className="text-xs text-slate-600 line-clamp-1 max-w-[220px]" title={row.reason}>
          {row.reason}
        </p>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right whitespace-nowrap',
      render: (row) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/audit-logs/${row.actualId}`)}
            leftIcon={<FiEye className="w-3.5 h-3.5" />}
            className="h-7 text-xs px-2.5"
          >
            Inspect
          </Button>
        </div>
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
              <span>{totalCount} Logged Events</span>
            </Badge>
          </div>
        }
      />

      {/* Toolbar: Search and Filter Bar */}
      <FilterBar
        isFiltered={searchQuery !== '' || categoryFilter !== 'ALL'}
        activeFilterCount={(searchQuery ? 1 : 0) + (categoryFilter !== 'ALL' ? 1 : 0)}
        onReset={() => {
          setSearchQuery('');
          setCategoryFilter('ALL');
          setCurrentPage(1);
        }}
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
        <div className="w-48 sm:w-60 md:w-64 flex-1 min-w-[140px] max-w-xs">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            onClear={() => setSearchQuery('')}
            placeholder="Search audit ID, action, admin..."
            size="sm"
          />
        </div>

        <div className="w-36 sm:w-40 shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Verification">Teacher Verification</option>
            <option value="Privacy">Contact Privacy</option>
            <option value="Enrollment">Batch Enrollment</option>
            <option value="Moderation">Content & Reviews</option>
            <option value="Safety">Safety & Abuse</option>
            <option value="Communications">Announcements</option>
            <option value="Marketing">Promotional Banners</option>
          </select>
        </div>
      </FilterBar>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredLogs.length > 0 ? (
          <>
            <DataTable ref={tableRef} columns={columns} data={paginatedLogs} className="border-none" />
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
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
