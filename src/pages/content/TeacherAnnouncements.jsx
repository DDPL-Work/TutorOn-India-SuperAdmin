import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSend,
  FiAlertTriangle,
  FiArchive,
  FiUsers,
  FiX,
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
import { INITIAL_TEACHER_ANNOUNCEMENTS } from '../../data/teacherAnnouncements';

export function TeacherAnnouncements() {
  const navigate = useNavigate();
  const toast = useToast();

  const [announcements, setAnnouncements] = useState(INITIAL_TEACHER_ANNOUNCEMENTS);
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

  // Tab definitions
  const tabs = [
    { key: 'all', label: 'All Announcements', count: announcements.length },
    {
      key: 'published',
      label: 'Published',
      count: announcements.filter((a) => a.status === 'Published').length,
    },
    {
      key: 'urgent',
      label: 'High Priority / Urgent',
      count: announcements.filter((a) => a.priority === 'High' || a.priority === 'Urgent').length,
    },
    {
      key: 'flagged',
      label: 'Flagged by Admin',
      count: announcements.filter((a) => a.status === 'Flagged').length,
    },
    {
      key: 'draft',
      label: 'Drafts',
      count: announcements.filter((a) => a.status === 'Draft').length,
    },
  ];

  // Filtering
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // Tab filter
      if (activeTab === 'published' && item.status !== 'Published') return false;
      if (activeTab === 'urgent' && item.priority !== 'High' && item.priority !== 'Urgent') return false;
      if (activeTab === 'flagged' && item.status !== 'Flagged') return false;
      if (activeTab === 'draft' && item.status !== 'Draft') return false;

      // Priority filter
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchMsg = item.message.toLowerCase().includes(q);
        const matchTeacher = item.teacher.name.toLowerCase().includes(q);
        const matchBatch = item.batch.name.toLowerCase().includes(q) || item.batch.code.toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchTeacher && !matchBatch) return false;
      }

      return true;
    });
  }, [announcements, activeTab, priorityFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAnnouncements.length / pageSize) || 1;
  const paginatedAnnouncements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAnnouncements.slice(start, start + pageSize);
  }, [filteredAnnouncements, currentPage, pageSize]);

  // Actions
  const handleToggleFlag = (announcement) => {
    const newStatus = announcement.status === 'Flagged' ? 'Published' : 'Flagged';
    const updated = announcements.map((a) => {
      if (a.id === announcement.id) {
        return { ...a, status: newStatus };
      }
      return a;
    });

    setAnnouncements(updated);

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

  const handleArchive = () => {
    if (!archiveModal.announcement) return;
    const updated = announcements.map((a) => {
      if (a.id === archiveModal.announcement.id) {
        return { ...a, status: 'Archived' };
      }
      return a;
    });

    setAnnouncements(updated);
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
        <div className="max-w-[300px]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDetailModal({ isOpen: true, announcement: row })}
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
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      render: (row) => (
        <div className="flex items-center gap-2">
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
            <span className="text-[10px] text-slate-400 block truncate">{row.teacher.subject}</span>
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
          <span className="font-mono text-[10px] text-slate-500">{row.batch.code}</span>
        </div>
      ),
    },
    {
      key: 'publishedDate',
      header: 'Published Date',
      className: 'text-xs text-slate-600 whitespace-nowrap',
      render: (row) => row.publishedDate,
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
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailModal({ isOpen: true, announcement: row })}
            className="h-7 text-xs px-2"
          >
            View
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleFlag(row)}
            className={`h-7 text-xs px-2 ${
              row.status === 'Flagged'
                ? 'text-emerald-700 hover:bg-emerald-50'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
            title={row.status === 'Flagged' ? 'Restore Announcement' : 'Flag Announcement'}
          >
            <FiAlertTriangle className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setArchiveModal({ isOpen: true, announcement: row })}
            className="h-7 text-xs px-2 text-slate-600 hover:bg-slate-50"
            title="Archive"
          >
            <FiArchive className="w-3.5 h-3.5" />
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
              <span>{announcements.length} Total Cohort Notices</span>
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search by announcement, message, teacher, or batch..."
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs text-slate-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#123B66] cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent Priority</option>
              <option value="High">High Priority</option>
              <option value="Normal">Normal Priority</option>
            </select>
          </div>
        </div>

        {/* Applied filters bar */}
        {(searchQuery || priorityFilter !== 'ALL' || activeTab !== 'all') && (
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
            {priorityFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                Priority: {priorityFilter}
                <button
                  type="button"
                  onClick={() => setPriorityFilter('ALL')}
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
                setPriorityFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[#1D4ED8] hover:underline text-[11px] ml-auto font-medium cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Announcements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredAnnouncements.length > 0 ? (
          <>
            <DataTable
              columns={columns}
              data={paginatedAnnouncements}
              className="border-none"
            />
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredAnnouncements.length}
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
                  This announcement was flagged for containing off-platform contact solicitations or violating classroom communication guidelines.
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
