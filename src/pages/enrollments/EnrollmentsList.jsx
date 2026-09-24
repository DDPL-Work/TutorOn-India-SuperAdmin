import { useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { INITIAL_ENROLLMENTS } from '../../data/enrollments';

export function EnrollmentsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const tableRef = useRef(null);
  const [enrollments, setEnrollments] = useState(INITIAL_ENROLLMENTS);
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

  // Review modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    enrollment: null,
  });

  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    enrollment: null,
    reason: '',
  });

  // Tab definitions
  const tabs = [
    { key: 'all', label: 'All Enrollments', count: enrollments.length },
    {
      key: 'awaiting_confirmation',
      label: 'Awaiting Confirmation',
      count: enrollments.filter((e) => e.status === 'Awaiting Confirmation').length,
    },
    {
      key: 'payment_pending',
      label: 'Payment Pending',
      count: enrollments.filter((e) => e.status === 'Payment Pending' || e.paymentStatus === 'Payment Pending').length,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      count: enrollments.filter((e) => e.status === 'Confirmed').length,
    },
    {
      key: 'rejected',
      label: 'Rejected',
      count: enrollments.filter((e) => e.status === 'Rejected').length,
    },
  ];

  // Filtering
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((item) => {
      // Tab filter
      if (activeTab === 'awaiting_confirmation' && item.status !== 'Awaiting Confirmation') {
        return false;
      }
      if (activeTab === 'payment_pending' && item.status !== 'Payment Pending' && item.paymentStatus !== 'Payment Pending') {
        return false;
      }
      if (activeTab === 'confirmed' && item.status !== 'Confirmed') {
        return false;
      }
      if (activeTab === 'rejected' && item.status !== 'Rejected') {
        return false;
      }

      // Payment filter dropdown
      if (paymentFilter !== 'ALL' && item.paymentStatus !== paymentFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchStudent = item.student.name.toLowerCase().includes(q) || item.student.id.toLowerCase().includes(q);
        const matchTeacher = item.teacher.name.toLowerCase().includes(q);
        const matchBatch = item.batch.title.toLowerCase().includes(q) || item.batch.batchCode.toLowerCase().includes(q);
        if (!matchId && !matchStudent && !matchTeacher && !matchBatch) {
          return false;
        }
      }

      return true;
    });
  }, [enrollments, activeTab, paymentFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredEnrollments.length / pageSize) || 1;
  const paginatedEnrollments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEnrollments.slice(start, start + pageSize);
  }, [filteredEnrollments, currentPage, pageSize]);

  // Action handlers
  const handleOpenConfirmModal = (enrollment) => {
    setConfirmModal({
      isOpen: true,
      enrollment,
    });
  };

  const handleConfirmEnrollment = () => {
    const { enrollment } = confirmModal;
    if (!enrollment) return;

    const updated = enrollments.map((e) => {
      if (e.id === enrollment.id) {
        const updatedSteps = e.workflowSteps.map((s) => {
          if (s.step === 5) return { ...s, status: 'completed', timestamp: 'Today, Just now' };
          if (s.step === 6) return { ...s, status: 'completed', timestamp: 'Today, Just now' };
          return s;
        });

        const newAuditEntry = {
          action: 'Enrollment Confirmed by Super Admin',
          performedBy: 'Super Admin (sudhanshu@tutoron.in)',
          timestamp: 'Just now',
          notes: 'Administrative confirmation granted. Seat allocated in live batch roster.',
        };

        return {
          ...e,
          status: 'Confirmed',
          workflowSteps: updatedSteps,
          auditTrail: [newAuditEntry, ...e.auditTrail],
        };
      }
      return e;
    });

    setEnrollments(updated);
    setConfirmModal({ isOpen: false, enrollment: null });

    toast.success(
      'Enrollment Confirmed',
      `Student ${enrollment.student.name} is now confirmed for batch ${enrollment.batch.batchCode}.`
    );
  };

  const handleOpenRejectModal = (enrollment) => {
    setRejectModal({
      isOpen: true,
      enrollment,
      reason: 'Batch Capacity Exceeded',
    });
  };

  const handleRejectEnrollment = () => {
    const { enrollment, reason } = rejectModal;
    if (!enrollment) return;

    const updated = enrollments.map((e) => {
      if (e.id === enrollment.id) {
        const updatedSteps = e.workflowSteps.map((s) => {
          if (s.step === 5) return { ...s, status: 'rejected', timestamp: 'Today, Just now' };
          if (s.step === 6) return { ...s, status: 'rejected', timestamp: 'Cancelled' };
          return s;
        });

        const newAuditEntry = {
          action: 'Enrollment Rejected by Super Admin',
          performedBy: 'Super Admin (sudhanshu@tutoron.in)',
          timestamp: 'Just now',
          notes: `Reason: ${reason || 'Administrative rejection'}. Payment refund initiated if applicable.`,
        };

        return {
          ...e,
          status: 'Rejected',
          workflowSteps: updatedSteps,
          auditTrail: [newAuditEntry, ...e.auditTrail],
        };
      }
      return e;
    });

    setEnrollments(updated);
    setRejectModal({ isOpen: false, enrollment: null, reason: '' });

    toast.error(
      'Enrollment Rejected',
      `Enrollment ${enrollment.id} has been rejected. Student will be notified.`
    );
  };

  // Table Columns
  const columns = [
    {
      key: 'student',
      header: 'Student & ID',
      render: (row) => (
        <div className="flex items-center gap-3 whitespace-nowrap">
          <Avatar name={row.student.name} src={row.student.avatar} size="sm" />
          <div>
            <p className="font-semibold text-slate-900 group-hover:text-[#123B66] transition-colors leading-tight">
              {row.student.name}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-[10px]">
                {row.id}
              </span>
              <span>{row.student.grade}</span>
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
          <div className="text-xs font-medium text-slate-900" title={row.batch.title}>
            {row.batch.title}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
            <span className="font-mono text-[10px] text-slate-400">{row.batch.batchCode}</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">{row.batch.fee}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      render: (row) => (
        <div className="flex items-center gap-2.5 whitespace-nowrap min-w-[130px]">
          <Avatar name={row.teacher.name} src={row.teacher.avatar} size="xs" />
          <div>
            <p className="text-xs font-medium text-slate-900">
              {row.teacher.name}
            </p>
            <span className="text-[10px] text-slate-500 block">{row.batch.subject}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'requestDate',
      header: 'Date',
      className: 'text-xs text-slate-500 font-mono whitespace-nowrap',
      render: (row) => row.requestDate,
    },
    {
      key: 'status',
      header: 'Status & Payment',
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.status} />
          <div>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-medium border inline-block ${
                row.paymentStatus === 'Paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {row.paymentStatus}
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
          {row.status === 'Awaiting Confirmation' && (
            <div className="flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={() => handleOpenConfirmModal(row)}
                className="w-7 h-7 rounded-full text-emerald-600 hover:bg-emerald-50 border border-emerald-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Confirm Enrollment"
                aria-label="Confirm"
              >
                <FiCheck className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleOpenRejectModal(row)}
                className="w-7 h-7 rounded-full text-danger hover:bg-red-50 border border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Reject Enrollment"
                aria-label="Reject"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
        action={
          <div className="flex items-center gap-2">
            <Badge variant="navy" size="md" className="gap-1.5 py-1 px-3">
              <FiUserCheck className="w-3.5 h-3.5 text-[#123B66]" />
              <span>{enrollments.filter((e) => e.status === 'Awaiting Confirmation').length} Awaiting Confirmation</span>
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
                totalItems={filteredEnrollments.length}
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
            icon={FiBookOpen}
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, enrollment: null })}
        title="Confirm Student Enrollment"
        size="xl"
      >
        {confirmModal.enrollment && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
              <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900">Authorizing Batch Enrollment</p>
                <p className="mt-0.5 text-emerald-700">
                  Confirming this request will immediately allocate an official seat in the teacher&apos;s batch roster and unlock class links in the student portal.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Enrollment ID:</span>
                <span className="font-mono font-semibold text-slate-800">{confirmModal.enrollment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-medium text-slate-800">{confirmModal.enrollment.student.name} ({confirmModal.enrollment.student.grade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch Code:</span>
                <span className="font-mono font-medium text-slate-800">{confirmModal.enrollment.batch.batchCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teacher:</span>
                <span className="font-medium text-slate-800">{confirmModal.enrollment.teacher.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Paid:</span>
                <span className="font-semibold text-slate-900">{confirmModal.enrollment.paymentDetails.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono text-slate-600">{confirmModal.enrollment.paymentDetails.transactionId}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmModal({ isOpen: false, enrollment: null })}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmEnrollment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                leftIcon={<FiCheck className="w-3.5 h-3.5" />}
              >
                Confirm & Allocate Seat
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, enrollment: null, reason: '' })}
        title="Reject Enrollment Request"
        size="xl"
      >
        {rejectModal.enrollment && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
              <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Rejecting Enrollment</p>
                <p className="mt-0.5 text-red-700">
                  Rejecting this enrollment request will notify the student and teacher. If the student has already paid, a refund authorization workflow will be created.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rejection-reason" className="block text-xs font-semibold text-slate-700">
                Reason for Rejection
              </label>
              <select
                id="rejection-reason"
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
              >
                <option value="Batch Capacity Exceeded">Batch Capacity Exceeded (Seats Full)</option>
                <option value="Payment Verification Failed">Payment Verification Failed / Mismatched</option>
                <option value="Course Prerequisite Not Met">Course Prerequisite / Grade Requirement Not Met</option>
                <option value="Student Schedule Conflict">Student Requested Cancellation due to Schedule Conflict</option>
                <option value="Teacher Roster Closed">Teacher Closed Batch Roster</option>
                <option value="Other Administrative Reason">Other Administrative Reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModal({ isOpen: false, enrollment: null, reason: '' })}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRejectEnrollment}
                leftIcon={<FiX className="w-3.5 h-3.5" />}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default EnrollmentsList;
