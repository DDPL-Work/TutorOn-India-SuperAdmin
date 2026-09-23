import { useState, useMemo } from 'react';
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
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
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
      key: 'id',
      header: 'Enrollment ID',
      className: 'w-36 font-mono text-xs font-semibold text-[#123B66]',
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/enrollments/${row.id}`)}
          className="hover:underline hover:text-[#1D4ED8] cursor-pointer text-left font-mono font-medium text-xs flex items-center gap-1.5"
        >
          <FiBookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {row.id}
        </button>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.student.avatar}
            alt={row.student.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(`/students/${row.student.id}`)}
              className="text-xs font-semibold text-slate-900 hover:text-[#123B66] hover:underline truncate block text-left"
            >
              {row.student.name}
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>{row.student.grade}</span>
              <span>•</span>
              <span className="font-mono text-[10px] text-slate-400">{row.student.id}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (row) => (
        <div className="max-w-[220px]">
          <div className="text-xs font-medium text-slate-900 truncate" title={row.batch.title}>
            {row.batch.title}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-mono text-[10px] text-slate-400">{row.batch.batchCode}</span>
            <span>•</span>
            <span>{row.batch.fee}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <img
            src={row.teacher.avatar}
            alt={row.teacher.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(`/teachers/${row.teacher.id}`)}
              className="text-xs font-medium text-slate-900 hover:text-[#123B66] hover:underline truncate block text-left"
            >
              {row.teacher.name}
            </button>
            <span className="text-[10px] text-slate-500 block truncate">{row.batch.subject}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'requestDate',
      header: 'Request Date',
      className: 'text-xs text-slate-600 whitespace-nowrap',
      render: (row) => row.requestDate,
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      render: (row) => <StatusBadge status={row.paymentStatus} />,
    },
    {
      key: 'status',
      header: 'Enrollment Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/enrollments/${row.id}`)}
            leftIcon={<FiEye className="w-3.5 h-3.5" />}
            className="h-7 text-xs px-2"
          >
            View
          </Button>

          {row.status === 'Awaiting Confirmation' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenConfirmModal(row)}
                className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenRejectModal(row)}
                className="h-7 text-xs px-2 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                Reject
              </Button>
            </>
          )}

          {row.status === 'Pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenConfirmModal(row)}
              className="h-7 text-xs px-2.5 text-blue-700 hover:bg-blue-50"
            >
              Authorize
            </Button>
          )}
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search by student, teacher, batch, or enrollment ID..."
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <FiCreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>Payment:</span>
            </div>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#123B66] cursor-pointer"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Applied filters indicator */}
        {(searchQuery || paymentFilter !== 'ALL' || activeTab !== 'all') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filtering by:</span>
            {activeTab !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                Tab: {tabs.find((t) => t.key === activeTab)?.label}
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {paymentFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                Payment: {paymentFilter}
                <button
                  type="button"
                  onClick={() => setPaymentFilter('ALL')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                Search: &quot;{searchQuery}&quot;
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setPaymentFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[#1D4ED8] hover:underline text-[11px] ml-auto font-medium cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Enrollments Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredEnrollments.length > 0 ? (
          <>
            <DataTable
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
