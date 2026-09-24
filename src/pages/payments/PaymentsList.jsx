import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiDollarSign,
  FiEye,
} from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import DataTable from '../../components/ui/DataTable';
import TableScrollButtons from '../../components/ui/TableScrollButtons';
import StatusBadge from '../../components/ui/StatusBadge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { INITIAL_PAYMENTS } from '../../data/payments';

export function PaymentsList() {
  const navigate = useNavigate();

  const tableRef = useRef(null);
  const [payments] = useState(INITIAL_PAYMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // High-level telemetry stats
  const totalRevenue = useMemo(() => {
    return payments
      .filter((p) => p.status === 'Successful')
      .reduce((acc, curr) => acc + curr.numericAmount, 0);
  }, [payments]);

  const successfulCount = payments.filter((p) => p.status === 'Successful').length;
  const pendingCount = payments.filter((p) => p.status === 'Pending').length;
  const failedCount = payments.filter((p) => p.status === 'Failed').length;

  // Filtered dataset
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (methodFilter !== 'ALL' && item.paymentMethod !== methodFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchStudent = item.student.name.toLowerCase().includes(q);
        const matchBatch = item.batch.name.toLowerCase().includes(q) || item.batch.code.toLowerCase().includes(q);
        const matchMethod = item.paymentMethod.toLowerCase().includes(q);
        if (!matchId && !matchStudent && !matchBatch && !matchMethod) return false;
      }

      return true;
    });
  }, [payments, statusFilter, methodFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  // Table Columns
  const columns = [
    {
      key: 'id',
      header: 'Transaction ID',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div>
          <button
            type="button"
            onClick={() => navigate(`/payments/${row.id}`)}
            className="hover:underline hover:text-[#1D4ED8] cursor-pointer text-left font-mono font-semibold text-xs text-[#123B66] flex items-center gap-1.5"
          >
            <FiCreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {row.id}
          </button>
          <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{row.date}</span>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.student.name} src={row.student.avatar} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 group-hover:text-[#123B66] transition-colors leading-tight">
              {row.student.name}
            </p>
            <span className="text-[11px] text-slate-500 block font-mono mt-0.5">{row.student.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch Details',
      render: (row) => (
        <div className="max-w-[200px]">
          <div className="text-xs font-medium text-slate-900 truncate" title={row.batch.name}>
            {row.batch.name}
          </div>
          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{row.batch.code}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount & Method',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 font-mono text-xs block">
            {row.amount}
          </span>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.2 rounded border inline-block mt-0.5 ${
              row.paymentMethod === 'UPI'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : row.paymentMethod === 'Credit Card'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : row.paymentMethod === 'Debit Card'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {row.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
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
            onClick={() => navigate(`/payments/${row.id}`)}
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
        title="Payments"
        subtitle="Review platform transactions, gateway fee collections, and payout reconciliations."
      />

      {/* 4 Telemetry Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Revenue (Sep 2026)</span>
            <FiDollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-geist text-slate-900">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">+14.2% vs previous month</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Successful Payments</span>
            <FiCheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-geist text-slate-900">{successfulCount}</div>
          <span className="text-[11px] text-slate-500 font-mono">96.4% success rate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Payments</span>
            <FiClock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-geist text-slate-900">{pendingCount}</div>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting RTGS / NetBanking</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Failed Payments</span>
            <FiAlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-geist text-slate-900">{failedCount}</div>
          <span className="text-[11px] text-red-600 font-medium">Bank timeout / declines</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        isFiltered={searchQuery !== '' || methodFilter !== 'ALL' || statusFilter !== 'ALL'}
        activeFilterCount={
          (searchQuery ? 1 : 0) + (methodFilter !== 'ALL' ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0)
        }
        onReset={() => {
          setSearchQuery('');
          setMethodFilter('ALL');
          setStatusFilter('ALL');
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
            placeholder="Search transaction ID, student, batch..."
            size="sm"
          />
        </div>

        <div className="w-32 sm:w-36 shrink-0">
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Net Banking">Net Banking</option>
          </select>
        </div>

        <div className="w-32 sm:w-36 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </FilterBar>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredPayments.length > 0 ? (
          <>
            <DataTable ref={tableRef} columns={columns} data={paginatedPayments} className="border-none" />
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredPayments.length}
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
            icon={FiCreditCard}
            title="No transactions found"
            description="No payment records match your search criteria."
          />
        )}
      </div>
    </div>
  );
}

export default PaymentsList;
