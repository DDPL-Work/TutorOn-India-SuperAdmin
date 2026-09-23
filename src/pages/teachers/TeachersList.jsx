import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiUserCheck,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiStar,
  FiUsers,
  FiCheck,
  FiX,
  FiDownload,
  FiShield,
} from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import FilterBar from '../../components/ui/FilterBar';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { INITIAL_TEACHERS } from '../../data/teachers';

export function TeachersList({ defaultTab = null }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [searchTerm, setSearchTerm] = useState('');
  
  const tabParam = defaultTab || searchParams.get('tab');
  const activeTab = tabParam === 'pending' ? 'PENDING' : tabParam === 'verified' ? 'VERIFIED' : 'ALL';

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Verification Action Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: 'approve', // 'approve' | 'reject'
    teacher: null,
    notes: '',
  });

  // Handle Tab Switch
  const handleTabChange = (tab) => {
    setCurrentPage(1);
    if (tab === 'PENDING') navigate('/teachers/pending');
    else if (tab === 'VERIFIED') navigate('/teachers/verified');
    else navigate('/teachers');
  };

  // Filtered & Searched Teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      // Tab filter
      if (activeTab === 'PENDING' && teacher.verificationStatus !== 'Pending Verification') {
        return false;
      }
      if (activeTab === 'VERIFIED' && teacher.verificationStatus !== 'Verified') {
        return false;
      }

      // Search match
      const query = searchTerm.toLowerCase().trim();
      if (!query) return true;

      const matchesName = teacher.name.toLowerCase().includes(query);
      const matchesId = teacher.id.toLowerCase().includes(query);
      const matchesQual = teacher.qualification.toLowerCase().includes(query);
      const matchesSubject = teacher.subjects.some((s) => s.toLowerCase().includes(query));
      const matchesCity = teacher.city?.toLowerCase().includes(query);

      return matchesName || matchesId || matchesQual || matchesSubject || matchesCity;
    });
  }, [teachers, activeTab, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / pageSize) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTeachers.slice(start, start + pageSize);
  }, [filteredTeachers, currentPage, pageSize]);

  // Open Approval Confirmation Modal
  const openApproveModal = (teacher) => {
    setActionModal({
      isOpen: true,
      type: 'approve',
      teacher,
      notes: 'All academic degree certificates, government KYC IDs, and background checks verified in accordance with TutorOn India quality guidelines.',
    });
  };

  // Open Rejection Confirmation Modal
  const openRejectModal = (teacher) => {
    setActionModal({
      isOpen: true,
      type: 'reject',
      teacher,
      notes: 'Submitted verification documents require certified university attestation or clearer resolution scans.',
    });
  };

  // Execute Verification Action
  const handleConfirmAction = () => {
    const { type, teacher, notes } = actionModal;
    if (!teacher) return;

    const nextStatus = type === 'approve' ? 'Verified' : 'Rejected';
    const auditEntry = {
      id: `AUD-${Date.now()}`,
      action: type === 'approve' ? 'Teacher Verified' : 'Teacher Verification Declined',
      by: 'Super Admin',
      timestamp: new Date().toISOString(),
      notes,
    };

    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === teacher.id) {
          return {
            ...t,
            verificationStatus: nextStatus,
            verificationAudit: [auditEntry, ...(t.verificationAudit || [])],
          };
        }
        return t;
      })
    );

    setActionModal({ isOpen: false, type: 'approve', teacher: null, notes: '' });

    if (type === 'approve') {
      toast.success(
        'Teacher Verified',
        `${teacher.name} has been certified and can now publish batches across TutorOn India.`
      );
    } else {
      toast.error(
        'Verification Declined',
        `${teacher.name} flagged as Rejected. Feedback sent for document resubmission.`
      );
    }
  };

  const pendingCount = teachers.filter((t) => t.verificationStatus === 'Pending Verification').length;
  const verifiedCount = teachers.filter((t) => t.verificationStatus === 'Verified').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Teachers"
        subtitle="Manage teacher profiles and verification."
        badge={
          <Badge variant="navy" size="sm">
            1,248 Registered Faculty
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiDownload className="w-3.5 h-3.5" />}
            onClick={() => toast.success('Export Initiated', 'Exporting teacher verification dossiers as CSV.')}
          >
            Export Teachers
          </Button>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Teachers
            </span>
            <p className="text-xl font-bold font-geist text-slate-900 mt-0.5">
              1,248
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-[#123B66]/10 text-[#123B66]">
            <FiUsers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Verified Faculty
            </span>
            <p className="text-xl font-bold font-geist text-emerald-700 mt-0.5">
              1,185
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <FiUserCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pending Verification
            </span>
            <p className="text-xl font-bold font-geist text-amber-700 mt-0.5">
              37
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <FiClock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Verification Pass Rate
            </span>
            <p className="text-xl font-bold font-geist text-slate-700 mt-0.5">
              94.9%
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
            <FiShield className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleTabChange('ALL')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ALL'
              ? 'border-[#123B66] text-[#0B1F3A] bg-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>All Teachers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono">
            {teachers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('PENDING')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'PENDING'
              ? 'border-[#123B66] text-[#0B1F3A] bg-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Pending Verification</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold font-mono">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('VERIFIED')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'VERIFIED'
              ? 'border-[#123B66] text-[#0B1F3A] bg-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Verified Teachers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
            {verifiedCount}
          </span>
        </button>
      </div>

      {/* Toolbar: Search & Filter */}
      <FilterBar
        isFiltered={searchTerm !== ''}
        activeFilterCount={searchTerm !== '' ? 1 : 0}
        onReset={() => setSearchTerm('')}
      >
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            onClear={() => setSearchTerm('')}
            placeholder="Search teacher, ID, qualification, subject..."
            size="sm"
          />
        </div>

        <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-500">
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
      </FilterBar>

      {/* Teachers Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-subtle overflow-hidden">
        {paginatedTeachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Teacher</th>
                  <th className="py-3 px-4">Qualification</th>
                  <th className="py-3 px-4">Subjects</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Languages</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4 text-center">Students Taught</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/teachers/${teacher.id}`)}
                  >
                    {/* Teacher Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={teacher.name} size="md" />
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-[#123B66] transition-colors leading-tight">
                            {teacher.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {teacher.id}
                            </span>
                            <span>{teacher.city}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Qualification */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <p className="font-medium text-slate-800 truncate" title={teacher.qualification}>
                        {teacher.qualification}
                      </p>
                    </td>

                    {/* Subjects */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[170px]">
                        {teacher.subjects.map((sub, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-[#123B66] border border-blue-100"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {teacher.experience}
                    </td>

                    {/* Languages */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 text-[10px] text-slate-600">
                        {teacher.languages.join(', ')}
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 font-bold text-slate-900 font-mono">
                        <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{teacher.rating.toFixed(2)}</span>
                      </div>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        ({teacher.ratingCount})
                      </span>
                    </td>

                    {/* Students Taught */}
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-800 whitespace-nowrap">
                      {teacher.studentsTaught.toLocaleString('en-IN')}
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={teacher.verificationStatus} />
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<FiEye className="w-3.5 h-3.5" />}
                          onClick={() => navigate(`/teachers/${teacher.id}`)}
                          className="h-7 text-xs px-2"
                        >
                          View
                        </Button>

                        {teacher.verificationStatus === 'Pending Verification' && (
                          <>
                            <button
                              type="button"
                              onClick={() => openApproveModal(teacher)}
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Verify Teacher"
                              aria-label="Approve and verify"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openRejectModal(teacher)}
                              className="p-1 rounded text-danger hover:bg-red-50 transition-colors cursor-pointer"
                              title="Reject Verification"
                              aria-label="Reject verification"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No teachers found"
            description="We couldn't find any teacher records matching your current filter criteria."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  handleTabChange('ALL');
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
          totalItems={filteredTeachers.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Verification Approval / Rejection Modal */}
      {actionModal.isOpen && actionModal.teacher && (
        <Modal
          isOpen={actionModal.isOpen}
          onClose={() => setActionModal({ isOpen: false, type: 'approve', teacher: null, notes: '' })}
          title={
            actionModal.type === 'approve'
              ? `Approve & Certify Faculty — ${actionModal.teacher.name}`
              : `Decline Verification — ${actionModal.teacher.name}`
          }
          description={`Teacher Reference ID: ${actionModal.teacher.id} · Applied ${actionModal.teacher.joinedDate}`}
          size="md"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActionModal({ isOpen: false, type: 'approve', teacher: null, notes: '' })}
              >
                Cancel
              </Button>
              <Button
                variant={actionModal.type === 'approve' ? 'success' : 'danger'}
                size="sm"
                onClick={handleConfirmAction}
                leftIcon={actionModal.type === 'approve' ? <FiCheckCircle className="w-4 h-4" /> : <FiXCircle className="w-4 h-4" />}
              >
                {actionModal.type === 'approve' ? 'Confirm & Certify Faculty' : 'Decline Verification'}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm">
                  {actionModal.teacher.name}
                </span>
                <span className="font-mono text-slate-500">{actionModal.teacher.id}</span>
              </div>
              <p className="text-slate-600 mt-1 font-medium">{actionModal.teacher.qualification}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">{actionModal.teacher.experience}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {actionModal.type === 'approve'
                  ? 'Super Admin Verification Audit Notes'
                  : 'Rejection Reason (Dispatched to Faculty for Resubmission)'}
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
                  ? 'This action will grant faculty verified badge, batch publishing privileges, and unlock student inquiry queues.'
                  : 'Faculty will be notified to upload amended university degree credentials.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default TeachersList;
