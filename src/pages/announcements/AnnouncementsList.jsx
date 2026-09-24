import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSend,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiTag,
  FiX,
  FiFileText,
  FiEye,
} from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import DataTable from '../../components/ui/DataTable';
import TableScrollButtons from '../../components/ui/TableScrollButtons';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { INITIAL_ANNOUNCEMENTS } from '../../data/announcements';

export function AnnouncementsList() {
  const navigate = useNavigate();
  const toast = useToast();

  const tableRef = useRef(null);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Review & Delete Modals
  const [viewModal, setViewModal] = useState({ isOpen: false, item: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  // Tab definitions
  const tabs = [
    { key: 'all', label: 'All Announcements', count: announcements.length },
    {
      key: 'published',
      label: 'Published',
      count: announcements.filter((a) => a.status === 'Published').length,
    },
    {
      key: 'scheduled',
      label: 'Scheduled',
      count: announcements.filter((a) => a.status === 'Scheduled').length,
    },
    {
      key: 'draft',
      label: 'Drafts',
      count: announcements.filter((a) => a.status === 'Draft').length,
    },
    {
      key: 'expired',
      label: 'Expired',
      count: announcements.filter((a) => a.status === 'Expired').length,
    },
  ];

  // Filtered dataset
  const filteredData = useMemo(() => {
    return announcements.filter((item) => {
      // Tab filter
      if (activeTab === 'published' && item.status !== 'Published') return false;
      if (activeTab === 'scheduled' && item.status !== 'Scheduled') return false;
      if (activeTab === 'draft' && item.status !== 'Draft') return false;
      if (activeTab === 'expired' && item.status !== 'Expired') return false;

      // Audience filter
      if (audienceFilter !== 'ALL' && item.audience !== audienceFilter) return false;

      // Type filter
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchMsg = item.message.toLowerCase().includes(q);
        const matchBy = item.createdBy.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchBy && !matchId) return false;
      }

      return true;
    });
  }, [announcements, activeTab, audienceFilter, typeFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Actions
  const handleTogglePublish = (item) => {
    const nextStatus = item.status === 'Published' ? 'Disabled' : 'Published';
    const updated = announcements.map((a) => {
      if (a.id === item.id) return { ...a, status: nextStatus };
      return a;
    });
    setAnnouncements(updated);

    if (viewModal.isOpen && viewModal.item?.id === item.id) {
      setViewModal({ ...viewModal, item: { ...viewModal.item, status: nextStatus } });
    }

    if (nextStatus === 'Published') {
      toast.success('Announcement Published', `"${item.title}" is now visible to ${item.audience}.`);
    } else {
      toast.info('Announcement Disabled', `"${item.title}" has been unpublished.`);
    }
  };

  const handleDelete = () => {
    if (!deleteModal.item) return;
    const updated = announcements.filter((a) => a.id !== deleteModal.item.id);
    setAnnouncements(updated);
    setDeleteModal({ isOpen: false, item: null });
    if (viewModal.isOpen) setViewModal({ isOpen: false, item: null });
    toast.error('Announcement Deleted', 'The platform announcement was permanently deleted.');
  };

  // Columns definition
  const columns = [
    {
      key: 'announcement',
      header: 'Announcement',
      render: (row) => (
        <div className="flex items-start gap-3 w-[300px]">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#123B66] flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
            <FiSend className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div
              onClick={() => setViewModal({ isOpen: true, item: row })}
              className="text-xs font-semibold text-slate-900 hover:text-[#123B66] hover:underline text-left block truncate cursor-pointer"
              title={row.title}
              role="button"
            >
              {row.title}
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{row.message}</p>
            <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{row.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => {
        const shortType =
          row.type === 'Important Announcement'
            ? 'Important'
            : row.type === 'Promotional Announcement'
            ? 'Promotional'
            : 'General';
        return (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
              row.type === 'Important Announcement'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : row.type === 'Promotional Announcement'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {shortType}
          </span>
        );
      },
    },
    {
      key: 'audience',
      header: 'Audience',
      render: (row) => (
        <Badge
          variant={
            row.audience === 'All Users'
              ? 'navy'
              : row.audience === 'Students'
              ? 'info'
              : 'success'
          }
          size="sm"
        >
          {row.audience}
        </Badge>
      ),
    },
    {
      key: 'schedule',
      header: 'Schedule',
      className: 'text-xs text-slate-500 font-mono whitespace-nowrap',
      render: (row) => (
        <div>
          <div>{row.startDate}</div>
          <div className="text-[10px] text-slate-400">to {row.endDate}</div>
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
          <button
            type="button"
            onClick={() => handleTogglePublish(row)}
            className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors cursor-pointer border ${
              row.status === 'Published'
                ? 'text-amber-700 bg-amber-50/70 border-amber-200 hover:bg-amber-100'
                : 'text-emerald-700 bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {row.status === 'Published' ? 'Unpublish' : 'Publish'}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewModal({ isOpen: true, item: row })}
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
        title="Announcements"
        subtitle="Manage platform-level announcements for TutorOn users."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/announcements-promotions/banners')}
              leftIcon={<FiTag className="w-4 h-4 text-purple-600" />}
            >
              Promotional Banners
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/announcements-promotions/create')}
              leftIcon={<FiPlus className="w-4 h-4" />}
            >
              Create Announcement
            </Button>
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

      {/* Toolbar: Search & Filter */}
      <FilterBar
        isFiltered={searchQuery !== '' || audienceFilter !== 'ALL' || typeFilter !== 'ALL'}
        activeFilterCount={(searchQuery !== '' ? 1 : 0) + (audienceFilter !== 'ALL' ? 1 : 0) + (typeFilter !== 'ALL' ? 1 : 0)}
        onReset={() => {
          setSearchQuery('');
          setAudienceFilter('ALL');
          setTypeFilter('ALL');
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
            placeholder="Search announcements, author..."
            size="sm"
          />
        </div>

        <div className="w-32 sm:w-36 shrink-0">
          <select
            value={audienceFilter}
            onChange={(e) => {
              setAudienceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Audiences</option>
            <option value="All Users">All Users</option>
            <option value="Students">Students Only</option>
            <option value="Teachers">Teachers Only</option>
          </select>
        </div>

        <div className="w-32 sm:w-36 shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="General Announcement">General</option>
            <option value="Important Announcement">Important</option>
            <option value="Promotional Announcement">Promotional</option>
          </select>
        </div>
      </FilterBar>

      {/* Announcements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredData.length > 0 ? (
          <>
            <DataTable ref={tableRef} columns={columns} data={paginatedData} className="border-none" />
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredData.length}
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
            title="No announcements found"
            description="Try adjusting your filters or search terms."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab('all');
                  setAudienceFilter('ALL');
                  setTypeFilter('ALL');
                  setSearchQuery('');
                }}
              >
                Clear all filters
              </Button>
            }
          />
        )}
      </div>

      {/* Detail / Preview Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, item: null })}
        title="Platform Announcement Preview"
        size="xl"
      >
        {viewModal.item && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  viewModal.item.type === 'Important Announcement'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : viewModal.item.type === 'Promotional Announcement'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {viewModal.item.type}
              </span>
              <StatusBadge status={viewModal.item.status} />
            </div>

            <div>
              <h3 className="text-base font-bold font-geist text-slate-900 leading-snug">
                {viewModal.item.title}
              </h3>
              <p className="text-slate-500 text-[11px] mt-1">
                Target Audience: <strong className="text-slate-800">{viewModal.item.audience}</strong> • Effective: {viewModal.item.startDate} to {viewModal.item.endDate}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
              {viewModal.item.message}
            </div>

            {viewModal.item.ctaLabel && (
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Call to Action:</span>
                  <span className="font-semibold text-blue-900">{viewModal.item.ctaLabel}</span>
                </div>
                <span className="text-[11px] text-blue-700 font-mono">
                  {viewModal.item.ctaDestination}
                </span>
              </div>
            )}

            {viewModal.item.attachmentName && (
              <div className="flex items-center gap-2 p-2.5 bg-slate-100 rounded-lg text-slate-700">
                <FiFileText className="w-4 h-4 text-slate-500" />
                <span className="font-medium">{viewModal.item.attachmentName}</span>
                <span className="text-slate-400 text-[10px] ml-auto">PDF Document</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTogglePublish(viewModal.item)}
              >
                {viewModal.item.status === 'Published' ? 'Unpublish Announcement' : 'Publish to Platform'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setViewModal({ isOpen: false, item: null })}
              >
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        title="Delete Announcement"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold text-red-900">Are you sure you want to delete this notice?</p>
            <p className="mt-1 text-red-700">
              This announcement will be permanently removed from all user application dashboards.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setDeleteModal({ isOpen: false, item: null })}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete} leftIcon={<FiTrash2 className="w-3.5 h-3.5" />}>
              Delete Announcement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AnnouncementsList;
