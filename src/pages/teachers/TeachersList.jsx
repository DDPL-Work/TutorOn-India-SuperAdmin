import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeachers, approveTeacher, rejectTeacher } from '../../API/thunks/teachersThunks';
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
import TableScrollButtons from '../../components/ui/TableScrollButtons';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';


export function TeachersList({ defaultTab = null }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const tableRef = useRef(null);
  const dispatch = useDispatch();
  const { data: teachers, totalCount, verifiedCount, pendingCount, isLoading } = useSelector((state) => state.teachers);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const tabParam = defaultTab || searchParams.get('tab');
  const activeTab = tabParam === 'pending' ? 'PENDING' : tabParam === 'verified' ? 'VERIFIED' : 'ALL';

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let verification_status = undefined;
    if (activeTab === 'PENDING') verification_status = 'PENDING_VERIFICATION';
    else if (activeTab === 'VERIFIED') verification_status = 'VERIFIED';
    
    dispatch(fetchTeachers({
      page: currentPage,
      page_size: pageSize,
      search: searchTerm,
      verification_status
    }));
  }, [dispatch, activeTab, currentPage, pageSize, searchTerm]);

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

  // The API returns paginated data, so filteredTeachers is directly teachers array
  const filteredTeachers = teachers || [];

  // Pagination is handled by API
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedTeachers = filteredTeachers;

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
  const handleConfirmAction = async () => {
    const { type, teacher, notes } = actionModal;
    if (!teacher) return;

    const verificationId = teacher.verification?.id || teacher.verification_id || teacher.id;

    try {
      if (type === 'approve') {
        await dispatch(approveTeacher({ id: verificationId, admin_notes: notes })).unwrap();
        toast.success(
          'Teacher Verified',
          `${teacher.display_name || teacher.full_name} has been certified and can now publish batches across TutorOn India.`
        );
      } else {
        await dispatch(rejectTeacher({ id: verificationId, rejection_reason: notes, admin_note: notes })).unwrap();
        toast.error(
          'Verification Declined',
          `${teacher.display_name || teacher.full_name} flagged as Rejected. Feedback sent for document resubmission.`
        );
      }
      // Refresh the list after action
      let verification_status = undefined;
      if (activeTab === 'PENDING') verification_status = 'PENDING_VERIFICATION';
      else if (activeTab === 'VERIFIED') verification_status = 'VERIFIED';
      dispatch(fetchTeachers({ page: currentPage, page_size: pageSize, search: searchTerm, verification_status }));
    } catch (e) {
      toast.error('Action Failed', e.toString());
    } finally {
      setActionModal({ isOpen: false, type: 'approve', teacher: null, notes: '' });
    }
  };

  const handleExportCSV = () => {
    if (!paginatedTeachers || paginatedTeachers.length === 0) {
      toast.error('No Data', 'There are no teachers to export matching the current criteria.');
      return;
    }

    const passRate = totalCount > 0 ? ((verifiedCount / totalCount) * 100).toFixed(1) + '%' : '0%';

    const metaRows = [
      ['Report: Teacher Verification Statistics'],
      ['Total Teachers', totalCount],
      ['Verified Faculty', verifiedCount],
      ['Pending Verification', pendingCount],
      ['Verification Pass Rate', passRate],
      [], // Empty row for spacing
    ];

    const headers = ['Teacher ID', 'Full Name', 'Email', 'Verification Status', 'Average Rating', 'Experience (Years)', 'Subjects', 'Languages', 'Applied Date'];
    const dataRows = paginatedTeachers.map((t) => [
      t.teacher_code || (t.id ? t.id.split('-')[0].toUpperCase() : ''),
      `"${t.full_name || t.name || ''}"`,
      t.email || '',
      t.verification_status || 'PENDING_VERIFICATION',
      t.average_rating || 0,
      t.experience_years || 0,
      `"${(t.subjects || []).map(s => typeof s === 'string' ? s : s.name).join(' | ')}"`,
      `"${(t.teaching_languages || []).join(' | ')}"`,
      t.created_at ? t.created_at.split('T')[0] : 'N/A'
    ]);

    const allRows = [...metaRows, headers, ...dataRows];
    const csvContent = 'data:text/csv;charset=utf-8,' + allRows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tutoron_teachers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Teachers Exported', `Exported stats and ${paginatedTeachers.length} teacher records as CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Teachers"
        subtitle="Manage teacher profiles and verification."
        badge={
          <Badge variant="navy" size="sm">
            {totalCount.toLocaleString()} Registered Faculty
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiDownload className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
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
              {totalCount.toLocaleString()}
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
              {verifiedCount.toLocaleString()}
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
              {pendingCount.toLocaleString()}
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
              {totalCount > 0 ? ((verifiedCount / totalCount) * 100).toFixed(1) : 0}%
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
            {totalCount.toLocaleString()}
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
        actions={
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              {/* <span>Rows:</span>
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
              </select> */}
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
            placeholder="Search teacher, ID, qualification, subject..."
            size="sm"
          />
        </div>
      </FilterBar>

      {/* Teachers Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-subtle overflow-hidden">
        {paginatedTeachers.length > 0 ? (
          <div ref={tableRef} className="overflow-x-auto scroll-smooth">
            <table className="w-full min-w-[980px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 whitespace-nowrap">Teacher</th>
                  <th className="py-3 px-4 whitespace-nowrap">Qualification & Subjects</th>
                  <th className="py-3 px-4 whitespace-nowrap">Experience & Languages</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Rating & Learners</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/teachers/${teacher.id}`)}
                  >
                    {/* Teacher Info with Circular Avatar */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar name={teacher.full_name} size="sm" src={teacher.profile_photo} />
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-[#123B66] transition-colors leading-tight">
                            {teacher.display_name || teacher.full_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {teacher.teacher_code || (teacher.id ? teacher.id.split('-')[0].toUpperCase() : '')}
                            </span>
                            <span>{teacher.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Qualification & Subjects */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-[200px] max-w-[260px]">
                        <p className="font-medium text-slate-800 text-[11px]" title={teacher.headline || teacher.qualification}>
                          {teacher.headline || teacher.qualification}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(teacher.subjects || []).slice(0, 2).map((sub, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-[#123B66] border border-blue-100 whitespace-nowrap"
                            >
                              {typeof sub === 'string' ? sub : (sub.name || 'Unknown')}
                            </span>
                          ))}
                          {(teacher.subjects || []).length > 2 && (
                            <span className="px-1 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                              +{(teacher.subjects || []).length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Experience & Languages */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="min-w-[180px] max-w-[240px]">
                        <p className="font-medium text-slate-800 text-[11px]" title={teacher.experience || `${teacher.experience_years} Years`}>
                          {teacher.experience || (teacher.experience_years ? `${teacher.experience_years} Years` : '0 Years')}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5" title={(teacher.teaching_languages || []).join(', ')}>
                          {(teacher.teaching_languages || []).length > 0 ? teacher.teaching_languages.join(', ') : 'No languages listed'}
                        </p>
                      </div>
                    </td>

                    {/* Rating & Students */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 font-bold text-slate-900 font-mono text-[11px]">
                        <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{parseFloat(teacher.average_rating || 0).toFixed(2)}</span>
                      </div>
                      <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                        {(teacher.total_students || teacher.studentsTaught || 0).toLocaleString('en-IN')} learners
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={teacher.verification_status === 'VERIFIED' ? 'Verified' : teacher.verification_status === 'PENDING_VERIFICATION' ? 'Pending Verification' : 'Rejected'} />
                    </td>

                    {/* Actions & Buttons */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        {teacher.verification_status === 'PENDING_VERIFICATION' && (
                          <div className="flex items-center gap-1 mr-1">
                            <button
                              type="button"
                              onClick={() => openApproveModal(teacher)}
                              className="w-7 h-7 rounded-full text-emerald-600 hover:bg-emerald-50 border border-emerald-200 flex items-center justify-center transition-colors cursor-pointer"
                              title="Verify Teacher"
                              aria-label="Approve and verify"
                            >
                              <FiCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openRejectModal(teacher)}
                              className="w-7 h-7 rounded-full text-danger hover:bg-red-50 border border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                              title="Reject Verification"
                              aria-label="Reject verification"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/teachers/${teacher.id}`)}
                          leftIcon={<FiEye className="w-3.5 h-3.5" />}
                          className="h-7 text-xs px-2.5"
                        >
                          View Dossier
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
          totalItems={totalCount}
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
              ? `Approve & Certify Faculty — ${actionModal.teacher.full_name}`
              : `Decline Verification — ${actionModal.teacher.full_name}`
          }
          description={`Teacher Reference ID: ${actionModal.teacher.id} · Applied ${actionModal.teacher.created_at ? actionModal.teacher.created_at.split('T')[0] : 'N/A'}`}
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
                  {actionModal.teacher.display_name || actionModal.teacher.full_name}
                </span>
                <span className="font-mono text-slate-500">{actionModal.teacher.id}</span>
              </div>
              <p className="text-slate-600 mt-1 font-medium">{actionModal.teacher.headline || actionModal.teacher.qualification}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">{actionModal.teacher.experience || (actionModal.teacher.experience_years ? `${actionModal.teacher.experience_years} Years` : 'N/A')}</p>
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
