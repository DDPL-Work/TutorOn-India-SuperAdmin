import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEnrollments } from '../../API/thunks/enrollmentsThunks';
import {
  FiCheckCircle,
  FiEye,
  FiCreditCard,
  FiUserCheck,
  FiBookOpen,
  FiCheck,
  FiX,
  FiAlertCircle,
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
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

export function EnrollmentsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const tableRef = useRef(null);
  const dispatch = useDispatch();
  const { data: enrollments, totalCount, pendingCount, confirmedCount, rejectedCount, isLoading } = useSelector((state) => state.enrollments);

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Derive active tab from URL query param (?tab=awaiting_confirmation) or fallback to 'all'
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam || 'all';

  const setActiveTab = (tabKey) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tabKey === 'all') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', tabKey);
    }
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let apiStatus = undefined;
    if (activeTab === 'payment_pending') apiStatus = 'PENDING';
    if (activeTab === 'confirmed') apiStatus = 'CONFIRMED';
    if (activeTab === 'rejected') apiStatus = 'REJECTED';

    dispatch(fetchEnrollments({
      page: currentPage,
      page_size: pageSize,
      search: searchQuery,
      status: apiStatus
    }));
  }, [dispatch, currentPage, pageSize, searchQuery, activeTab, paymentFilter]);

  // Tab definitions
  const tabs = [
    { key: 'all', label: 'All Enrollments', count: totalCount },
    {
      key: 'payment_pending',
      label: 'Payment Pending',
      count: pendingCount,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      count: confirmedCount,
    },
    {
      key: 'rejected',
      label: 'Rejected',
      count: rejectedCount,
    },
  ];

  // Filtering is handled by API
  const filteredEnrollments = enrollments || [];

  // Pagination calculation handled by API
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedEnrollments = filteredEnrollments;

  // Table Columns
  const columns = [
    {
      key: 'student',
      header: 'Student & ID',
      render: (row) => (
        <div className="flex items-center gap-3 whitespace-nowrap">
          <Avatar name={row.student_name || 'N/A'} src={row.student_avatar} size="sm" />
          <div>
            <p className="font-semibold text-slate-900 group-hover:text-[#123B66] transition-colors leading-tight">
              {row.student_name || 'N/A'}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-[10px]">
                {row.enrollment_code || row.id.substring(0, 8)}
              </span>
              <span>{row.student_grade || 'N/A'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch & Subject',
      render: (row) => (
        <div className="min-w-[190px] max-w-[250px]">
          <div className="text-xs font-medium text-slate-900" title={row.batch_title}>
            {row.batch_title || 'N/A'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
            <span className="font-mono text-[10px] text-slate-400">{row.batch_code || 'N/A'}</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">{row.formatted_price || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      render: (row) => (
        <div className="flex items-center gap-2.5 whitespace-nowrap min-w-[130px]">
          <Avatar name={row.teacher_name || 'N/A'} src={row.teacher_avatar} size="xs" />
          <div>
            <p className="text-xs font-medium text-slate-900">
              {row.teacher_name || 'N/A'}
            </p>
            <span className="text-[10px] text-slate-500 block">{row.teacher_subject || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'requestDate',
      header: 'Date',
      className: 'text-xs text-slate-500 font-mono whitespace-nowrap',
      render: (row) => row.requested_at ? formatDate(row.requested_at) : 'N/A',
    },
    {
      key: 'status',
      header: 'Status & Payment',
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.status === 'ACTIVE' ? 'Confirmed' : row.status === 'REJECTED' || row.status === 'CANCELLED' ? 'Rejected' : 'Pending'} />
          <div>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-medium border inline-block ${
                row.payment_status === 'PAID'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {row.payment_status === 'PAID' ? 'Paid' : 'Payment Pending'}
            </span>
          </div>
        </div>
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
            onClick={() => navigate(`/enrollments/${row.id}`)}
            leftIcon={<FiEye className="w-3.5 h-3.5" />}
            className="h-7 text-xs px-2.5"
          >
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Enrollments"
        subtitle="Review and manage student enrollment requests."

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
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#123B66] text-[#0B1F3A] font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-[#123B66] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        isFiltered={searchQuery !== '' || paymentFilter !== 'ALL' || activeTab !== 'all'}
        activeFilterCount={
          (searchQuery ? 1 : 0) + (paymentFilter !== 'ALL' ? 1 : 0) + (activeTab !== 'all' ? 1 : 0)
        }
        onReset={() => {
          setSearchQuery('');
          setPaymentFilter('ALL');
          setActiveTab('all');
          setCurrentPage(1);
        }}
        actions={
          <div className="flex items-center gap-2.5">
            {/* <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
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
            </div> */}
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
            placeholder="Search student, teacher, batch..."
            size="sm"
          />
        </div>

        <div className="w-36 sm:w-40 shrink-0">
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Payment Pending">Payment Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </FilterBar>

      {/* Enrollments Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredEnrollments.length > 0 ? (
          <>
            <DataTable
              ref={tableRef}
              columns={columns}
              data={paginatedEnrollments}
              className="border-none"
            />
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
            title="No enrollments found"
            description={
              searchQuery || paymentFilter !== 'ALL' || activeTab !== 'all'
                ? 'Try adjusting your search queries or filter selections.'
                : 'There are currently no student enrollment records in the system.'
            }
            action={
              (searchQuery || paymentFilter !== 'ALL' || activeTab !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab('all');
                    setPaymentFilter('ALL');
                    setSearchQuery('');
                  }}
                >
                  Clear all filters
                </Button>
              )
            }
          />
        )}
      </div>


    </div>
  );
}

export default EnrollmentsList;
