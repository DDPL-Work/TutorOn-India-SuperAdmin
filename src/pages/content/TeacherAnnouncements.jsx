import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeacherAnnouncements, fetchTeacherAnnouncementDetails } from '../../API/thunks/teacherAnnouncementsThunks';
import {
  FiSend,
  FiAlertTriangle,
  FiArchive,
  FiUsers,
  FiX,
  FiEye,
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


export function TeacherAnnouncements() {
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useDispatch();

  const tableRef = useRef(null);
  const { data: allAnnouncements, totalCount, publishedCount, urgentCount, flaggedCount, draftCount, isLoading } = useSelector((state) => state.teacherAnnouncements);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Review modal
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    announcement: null,
  });

  // Archive modal
  const [archiveModal, setArchiveModal] = useState({
    isOpen: false,
    announcement: null,
  });

  // Fetch data
  useEffect(() => {
    dispatch(fetchTeacherAnnouncements({
      page: currentPage,
      page_size: pageSize,
      search: searchQuery,
      tab: activeTab === 'all' ? undefined : activeTab,
      priority: priorityFilter === 'ALL' ? undefined : priorityFilter.toUpperCase()
    }));
  }, [dispatch, currentPage, pageSize, searchQuery, activeTab, priorityFilter]);

  // Map data
  const announcements = (allAnnouncements || []).map(r => ({
    id: r.code || r.id,
    actualId: r.id,
    title: r.title || 'Untitled',
    message: r.message || '',
    priority: r.priority_badge || (r.priority === 'URGENT' ? 'Urgent' : r.priority === 'HIGH' ? 'High' : 'Normal'),
    status: r.status_display || r.status || 'Draft',
    teacher: {
      id: r.faculty?.id || r.faculty || '',
      name: r.faculty?.name || r.faculty_name || 'Unknown Faculty',
      subject: r.faculty?.subject || r.faculty_subject || '',
      avatar: r.faculty?.avatar || r.faculty_avatar || null,
    },
    batch: {
      name: r.batch_info?.title || r.batch_title || 'Unknown Batch',
      code: r.batch_info?.code || r.batch_code || '',
    },
    publishedDate: r.published || (r.published_at ? r.published_at.split('T')[0] : 'N/A'),
    viewsCount: r.viewsCount || 0,
    acknowledgmentsCount: r.acknowledgmentsCount || 0,
    flagReason: r.flag_reason || '',
    adminNotes: r.admin_notes || '',
  }));

  // Tab definitions
  const tabs = [
    { key: 'all', label: 'All Announcements', count: totalCount },
    {
      key: 'published',
      label: 'Published',
      count: publishedCount,
    },
    {
      key: 'urgent',
      label: 'High Priority / Urgent',
      count: urgentCount,
    },
    {
      key: 'flagged',
      label: 'Flagged by Admin',
      count: flaggedCount,
    },
    {
      key: 'draft',
      label: 'Drafts',
      count: draftCount,
    },
  ];

  // API handles filtering and pagination
  const filteredAnnouncements = announcements;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedAnnouncements = filteredAnnouncements;

  const handleOpenReview = async (row) => {
    // Open optimistically using list data
    setDetailModal({ isOpen: true, announcement: row });
    try {
      const details = await dispatch(fetchTeacherAnnouncementDetails(row.actualId)).unwrap();
      
      // Merge full details
      setDetailModal((prev) => ({
        isOpen: true,
        announcement: {
          ...prev.announcement,
          id: details.code || details.id,
          actualId: details.id,
          title: details.title || 'Untitled',
          message: details.message || '',
          priority: details.priority_badge || (details.priority === 'URGENT' ? 'Urgent' : details.priority === 'HIGH' ? 'High' : 'Normal'),
          status: details.status_display || details.status || 'Draft',
          teacher: {
            id: details.faculty?.id || details.faculty || '',
            name: details.faculty?.name || details.faculty_name || 'Unknown Faculty',
            subject: details.faculty?.subject || details.faculty_subject || '',
            avatar: details.faculty?.avatar || details.faculty_avatar || null,
          },
          batch: {
            name: details.batch_info?.title || details.batch_title || 'Unknown Batch',
            code: details.batch_info?.code || details.batch_code || '',
          },
          publishedDate: details.published || (details.published_at ? details.published_at.split('T')[0] : 'N/A'),
          viewsCount: details.viewsCount || 0,
          acknowledgmentsCount: details.acknowledgmentsCount || 0,
          flagReason: details.flag_reason || '',
          adminNotes: details.admin_notes || '',
        }
      }));
    } catch (err) {
      toast.error('Failed to load full announcement details', err.toString());
    }
  };

  const handleToggleFlag = async (announcement) => {
    const newStatus = announcement.status === 'Flagged' ? 'Published' : 'Flagged';
    
    // In a real app, you'd dispatch an update action here:
    // await dispatch(updateAnnouncementStatus({ id: announcement.actualId, status: newStatus })).unwrap();
    // dispatch(fetchTeacherAnnouncements({...}));

    if (detailModal.isOpen && detailModal.announcement?.id === announcement.id) {
      setDetailModal({
        ...detailModal,
        announcement: { ...detailModal.announcement, status: newStatus },
      });
    }

    if (newStatus === 'Flagged') {
      toast.error('Announcement Flagged', 'The notice has been hidden from student view pending review.');
    } else {
      toast.success('Flag Cleared', 'The notice has been restored to active published status.');
    }
  };

  const handleArchive = async () => {
    if (!archiveModal.announcement) return;
    
    // In a real app, you'd dispatch a delete/archive action here
    // await dispatch(deleteAnnouncement(archiveModal.announcement.actualId)).unwrap();
    // dispatch(fetchTeacherAnnouncements({...}));
    
    setArchiveModal({ isOpen: false, announcement: null });
    if (detailModal.isOpen) {
      setDetailModal({ isOpen: false, announcement: null });
    }
    toast.info('Announcement Archived', 'The classroom announcement was moved to the archive.');
  };

  // Table Columns
  const columns = [
    {
      key: 'announcement',
      header: 'Announcement',
      render: (row) => (
        <div className="flex items-start gap-3 max-w-[280px]">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#123B66] flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
            <FiSend className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenReview(row)}
                className="text-xs font-semibold text-slate-900 hover:text-[#123B66] hover:underline text-left block truncate cursor-pointer"
                title={row.title}
              >
                {row.title}
              </button>
              {row.priority === 'Urgent' && (
                <Badge variant="danger" size="sm" className="text-[10px] py-0 px-1.5 shrink-0">
                  Urgent
                </Badge>
              )}
              {row.priority === 'High' && (
                <Badge variant="warning" size="sm" className="text-[10px] py-0 px-1.5 shrink-0">
                  High
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{row.message}</p>
            <span className="font-mono text-[10px] text-slate-400 mt-0.5 block">{row.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Faculty',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.teacher.name} src={row.teacher.avatar} size="xs" />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(`/teachers/${row.teacher.id}`)}
              className="text-xs font-medium text-slate-900 hover:text-[#123B66] hover:underline truncate block text-left"
            >
              {row.teacher.name}
            </button>
            <span className="text-[10px] text-slate-400 block truncate">{row.teacher.subject}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (row) => (
        <div className="max-w-[180px]">
          <div className="text-xs font-medium text-slate-900 truncate" title={row.batch.name}>
            {row.batch.name}
          </div>
          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{row.batch.code}</span>
        </div>
      ),
    },
    {
      key: 'publishedDate',
      header: 'Published',
      className: 'text-xs text-slate-500 font-mono whitespace-nowrap',
      render: (row) => row.publishedDate,
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
          <button
            type="button"
            onClick={() => handleToggleFlag(row)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
              row.status === 'Flagged'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                : 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
            }`}
            title={row.status === 'Flagged' ? 'Restore Announcement' : 'Flag Notice'}
            aria-label="Toggle flag"
          >
            <FiAlertTriangle className="w-3.5 h-3.5" />
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenReview(row)}
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
      {/* Header */}
      <PageHeader
        title="Teacher Announcements"
        subtitle="Manage and moderate classroom broadcast notices created by teachers for their cohorts."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="navy" size="md" className="gap-1.5 py-1 px-3">
              <FiSend className="w-3.5 h-3.5 text-[#123B66]" />
              <span>{totalCount} Total Cohort Notices</span>
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

      {/* Filters and Search Bar */}
      <FilterBar
        isFiltered={searchQuery !== '' || priorityFilter !== 'ALL' || activeTab !== 'all'}
        activeFilterCount={
          (searchQuery ? 1 : 0) + (priorityFilter !== 'ALL' ? 1 : 0) + (activeTab !== 'all' ? 1 : 0)
        }
        onReset={() => {
          setSearchQuery('');
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
            placeholder="Search by announcement, message, teacher, or batch..."
            size="sm"
          />
        </div>

        <div className="w-36 sm:w-40 shrink-0">
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent Priority</option>
            <option value="High">High Priority</option>
            <option value="Normal">Normal Priority</option>
          </select>
        </div>
      </FilterBar>

      {/* Announcements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredAnnouncements.length > 0 ? (
          <>
            <DataTable
              ref={tableRef}
              columns={columns}
              data={paginatedAnnouncements}
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
            icon={FiSend}
            title="No teacher announcements found"
            description="No batch notices correspond to the selected criteria."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab('all');
                  setPriorityFilter('ALL');
                  setSearchQuery('');
                }}
              >
                Clear all filters
              </Button>
            }
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, announcement: null })}
        title="Teacher Announcement Details"
        size="xl"
      >
        {detailModal.announcement && (
          <div className="space-y-4 text-xs">
            {detailModal.announcement.status === 'Flagged' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-red-900">
                  <FiAlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Administrative Policy Flag</span>
                </div>
                <p className="text-red-700">
                  {detailModal.announcement.flagReason || 'This announcement was flagged for containing off-platform contact solicitations or violating classroom communication guidelines.'}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">{detailModal.announcement.title}</h3>
                <Badge
                  variant={
                    detailModal.announcement.priority === 'Urgent'
                      ? 'danger'
                      : detailModal.announcement.priority === 'High'
                      ? 'warning'
                      : 'slate'
                  }
                  size="sm"
                >
                  {detailModal.announcement.priority} Priority
                </Badge>
              </div>
              <p className="text-slate-500 text-[11px]">
                Broadcast on {detailModal.announcement.publishedDate}
              </p>
            </div>

            {/* Message Body */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-sans text-xs whitespace-pre-wrap">
              {detailModal.announcement.message}
            </div>

            {/* Batch & Teacher Context */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <div>
                <span className="text-slate-500 text-[11px] block">Faculty In-charge:</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {detailModal.announcement.teacher.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {detailModal.announcement.teacher.subject}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Target Cohort:</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {detailModal.announcement.batch.name}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {detailModal.announcement.batch.code}
                </span>
              </div>
            </div>

            {/* Student Engagement */}
            <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
              <div className="flex items-center gap-2">
                <FiUsers className="w-4 h-4 text-[#123B66]" />
                <span className="font-medium text-slate-800">Student Engagement:</span>
              </div>
              <div className="flex items-center gap-4 text-slate-700">
                <span>{detailModal.announcement.viewsCount} views</span>
                <span>•</span>
                <span>{detailModal.announcement.acknowledgmentsCount} acknowledged</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleFlag(detailModal.announcement)}
                className={`text-xs ${
                  detailModal.announcement.status === 'Flagged'
                    ? 'text-emerald-700 hover:bg-emerald-50'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                {detailModal.announcement.status === 'Flagged' ? 'Restore Announcement' : 'Flag as Violation'}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailModal({ isOpen: false, announcement: null })}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const ann = detailModal.announcement;
                    setDetailModal({ isOpen: false, announcement: null });
                    setArchiveModal({ isOpen: true, announcement: ann });
                  }}
                  leftIcon={<FiArchive className="w-3.5 h-3.5" />}
                >
                  Archive
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Archive Modal */}
      <Modal
        isOpen={archiveModal.isOpen}
        onClose={() => setArchiveModal({ isOpen: false, announcement: null })}
        title="Archive Classroom Announcement"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
            <p className="font-semibold text-slate-900">Archive Notice?</p>
            <p className="mt-1 text-slate-600">
              This notice will be archived and removed from active classroom feeds.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setArchiveModal({ isOpen: false, announcement: null })}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleArchive}>
              Confirm Archive
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TeacherAnnouncements;
