import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiEye,
  FiX,
} from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import DataTable from '../../components/ui/DataTable';
import TableScrollButtons from '../../components/ui/TableScrollButtons';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { INITIAL_REPORTS } from '../../data/reports';

export function ReportsList() {
  const navigate = useNavigate();
  const toast = useToast();

  const tableRef = useRef(null);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Tabs
  const tabs = [
    { key: 'all', label: 'All Reports', count: reports.length },
    {
      key: 'open',
      label: 'Open',
      count: reports.filter((r) => r.status === 'Open').length,
    },
    {
      key: 'under_review',
      label: 'Under Review',
      count: reports.filter((r) => r.status === 'Under Review').length,
    },
    {
      key: 'resolved',
      label: 'Resolved',
      count: reports.filter((r) => r.status === 'Resolved').length,
    },
    {
      key: 'dismissed',
      label: 'Dismissed',
      count: reports.filter((r) => r.status === 'Dismissed').length,
    },
  ];

  // Filtering
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // Tab filter
      if (activeTab === 'open' && item.status !== 'Open') return false;
      if (activeTab === 'under_review' && item.status !== 'Under Review') return false;
      if (activeTab === 'resolved' && item.status !== 'Resolved') return false;
      if (activeTab === 'dismissed' && item.status !== 'Dismissed') return false;

      // Category filter
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;

      // Priority filter
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchReporter = item.reportedBy.name.toLowerCase().includes(q);
        const matchReported = item.reportedUser.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchId && !matchReporter && !matchReported && !matchDesc) return false;
      }

      return true;
    });
  }, [reports, activeTab, categoryFilter, priorityFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, currentPage, pageSize]);

  // Quick Resolve Action
  const handleQuickResolve = (item, e) => {
    e.stopPropagation();
    const updated = reports.map((r) => {
      if (r.id === item.id) {
        return {
          ...r,
          status: 'Resolved',
          resolution: 'Quick resolved by Super Admin.',
        };
      }
      return r;
    });
    setReports(updated);
    toast.success('Report Resolved', `Grievance ticket ${item.id} marked as resolved.`);
  };

  // Columns definition
  const columns = [
    {
      key: 'reportedUser',
      header: 'Reported User & ID',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.reportedUser.name} src={row.reportedUser.avatar} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 group-hover:text-[#123B66] transition-colors leading-tight truncate">
              {row.reportedUser.name}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-[10px]">
                {row.id}
              </span>
              <span>{row.reportedUser.role}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'reportedBy',
      header: 'Filed By',
      render: (row) => (
        <div className="text-xs text-slate-700">
          <span className="font-medium text-slate-900 block">{row.reportedBy.name}</span>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
            {row.reportedBy.role}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category & Priority',
      render: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
              row.category === 'Privacy'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : row.category === 'Abuse'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : row.category === 'Harassment'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {row.category}
          </span>
          <Badge
            variant={
              row.priority === 'Critical' || row.priority === 'High'
                ? 'danger'
                : row.priority === 'Medium'
                ? 'warning'
                : 'slate'
            }
            size="sm"
          >
            {row.priority}
          </Badge>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      className: 'text-xs text-slate-500 font-mono whitespace-nowrap',
      render: (row) => row.date,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right whitespace-nowrap',
      render: (row) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {row.status === 'Open' && (
            <button
              type="button"
              onClick={(e) => handleQuickResolve(row, e)}
              className="text-[11px] font-medium px-2 py-1 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Resolve
            </button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/reports/${row.id}`)}
            leftIcon={<FiEye className="w-3.5 h-3.5" />}
            className="h-7 text-xs px-2.5"
          >
            Investigate
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Reports & Abuse"
        subtitle="Manage student and faculty safety grievances, harassment reports, and policy compliance investigations."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="danger" size="md" className="gap-1.5 py-1 px-3">
              <FiAlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>{reports.filter((r) => r.status === 'Open').length} Open Reports</span>
            </Badge>
          </div>
        }
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#123B66] text-[#0B1F3A] font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-[#123B66] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Toolbar: Search and Filter Bar */}
      <FilterBar
        isFiltered={
          searchQuery !== '' ||
          categoryFilter !== 'ALL' ||
          priorityFilter !== 'ALL' ||
          activeTab !== 'all'
        }
        activeFilterCount={
          (searchQuery ? 1 : 0) +
          (categoryFilter !== 'ALL' ? 1 : 0) +
          (priorityFilter !== 'ALL' ? 1 : 0) +
          (activeTab !== 'all' ? 1 : 0)
        }
        onReset={() => {
          setSearchQuery('');
          setCategoryFilter('ALL');
          setPriorityFilter('ALL');
          setActiveTab('all');
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
            placeholder="Search report ID, user, text..."
            size="sm"
          />
        </div>

        <div className="w-32 sm:w-36 shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Privacy">Privacy</option>
            <option value="Abuse">Abuse & Vulgarity</option>
            <option value="Harassment">Harassment</option>
            <option value="Spam">Spam</option>
            <option value="Other">Other Dispute</option>
          </select>
        </div>

        <div className="w-32 sm:w-36 shrink-0">
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </FilterBar>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredReports.length > 0 ? (
          <>
            <DataTable ref={tableRef} columns={columns} data={paginatedReports} className="border-none" />
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredReports.length}
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
            icon={FiAlertTriangle}
            title="No abuse reports found"
            description="No grievances match the applied filter criteria."
          />
        )}
      </div>
    </div>
  );
}

export default ReportsList;
