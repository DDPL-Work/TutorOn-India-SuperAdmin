import { useState, useMemo } from 'react';
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
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { INITIAL_PAYMENTS } from '../../data/payments';

export function PaymentsList() {
  const navigate = useNavigate();

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
      className: 'w-36 font-mono text-xs font-semibold text-[#123B66]',
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/payments/${row.id}`)}
          className="hover:underline hover:text-[#1D4ED8] cursor-pointer text-left font-mono font-medium text-xs flex items-center gap-1.5"
        >
          <FiCreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {row.id}
        </button>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <img
            src={row.student.avatar}
            alt={row.student.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(`/students/${row.student.id}`)}
              className="text-xs font-semibold text-slate-900 hover:text-[#123B66] hover:underline truncate block text-left"
            >
              {row.student.name}
            </button>
            <span className="text-[10px] text-slate-400 block font-mono">{row.student.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (row) => (
        <div className="max-w-[200px]">
          <div className="text-xs font-medium text-slate-900 truncate" title={row.batch.name}>
            {row.batch.name}
          </div>
          <span className="font-mono text-[10px] text-slate-400">{row.batch.code}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'font-semibold text-slate-900 font-mono text-xs',
      render: (row) => row.amount,
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      render: (row) => (
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
            row.paymentMethod === 'UPI'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : row.paymentMethod === 'Credit Card'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : row.paymentMethod === 'Debit Card'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {row.paymentMethod}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      className: 'text-xs text-slate-600 whitespace-nowrap',
      render: (row) => row.date,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/payments/${row.id}`)}
          leftIcon={<FiEye className="w-3.5 h-3.5" />}
          className="h-7 text-xs px-2"
        >
          View Dossier
        </Button>
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search transaction ID, student, batch, or method..."
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs text-slate-500">Payment Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#123B66] cursor-pointer"
            >
              <option value="ALL">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
            </select>

            <span className="text-xs text-slate-500 ml-2">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#123B66] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredPayments.length > 0 ? (
          <>
            <DataTable columns={columns} data={paginatedPayments} className="border-none" />
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
