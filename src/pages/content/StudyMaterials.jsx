import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiTrash2,
  FiBookmark,
  FiFolder,
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
import { INITIAL_MATERIALS } from '../../data/materials';

export function StudyMaterials() {
  const navigate = useNavigate();
  const toast = useToast();

  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Material inspection modal
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    material: null,
  });

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    material: null,
  });

  // Tab definitions
  const tabs = [
    { key: 'all', label: 'All Materials', count: materials.length },
    {
      key: 'published',
      label: 'Published',
      count: materials.filter((m) => m.status === 'Published').length,
    },
    {
      key: 'reported',
      label: 'Reported / Flagged',
      count: materials.filter((m) => m.status === 'Reported').length,
    },
    {
      key: 'draft',
      label: 'Drafts',
      count: materials.filter((m) => m.status === 'Draft').length,
    },
    {
      key: 'hidden',
      label: 'Hidden by Admin',
      count: materials.filter((m) => m.status === 'Hidden').length,
    },
  ];

  // Filtered dataset
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      // Tab filter
      if (activeTab === 'published' && item.status !== 'Published') return false;
      if (activeTab === 'reported' && item.status !== 'Reported') return false;
      if (activeTab === 'draft' && item.status !== 'Draft') return false;
      if (activeTab === 'hidden' && item.status !== 'Hidden') return false;

      // File type filter
      if (fileTypeFilter !== 'ALL' && item.fileType !== fileTypeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchTeacher = item.teacher.name.toLowerCase().includes(q);
        const matchBatch = item.batch.name.toLowerCase().includes(q) || item.batch.code.toLowerCase().includes(q);
        const matchFile = item.fileName.toLowerCase().includes(q);
        if (!matchTitle && !matchTeacher && !matchBatch && !matchFile) return false;
      }

      return true;
    });
  }, [materials, activeTab, fileTypeFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMaterials.length / pageSize) || 1;
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMaterials.slice(start, start + pageSize);
  }, [filteredMaterials, currentPage, pageSize]);

  // Actions
  const handleToggleVisibility = (material) => {
    const newStatus = material.status === 'Hidden' ? 'Published' : 'Hidden';
    const updated = materials.map((m) => {
      if (m.id === material.id) {
        return {
          ...m,
          status: newStatus,
          visibility: newStatus === 'Published' ? 'Public to Batch' : 'Restricted',
        };
      }
      return m;
    });

    setMaterials(updated);

    if (detailModal.isOpen && detailModal.material?.id === material.id) {
      setDetailModal({
        ...detailModal,
        material: {
          ...detailModal.material,
          status: newStatus,
          visibility: newStatus === 'Published' ? 'Public to Batch' : 'Restricted',
        },
      });
    }

    if (newStatus === 'Published') {
      toast.success('Material Published', `"${material.title}" is now accessible to students.`);
    } else {
      toast.info('Material Hidden', `"${material.title}" is hidden from student view.`);
    }
  };

  const handleResolveReport = (material) => {
    const updated = materials.map((m) => {
      if (m.id === material.id) {
        return {
          ...m,
          status: 'Published',
          reportReason: null,
        };
      }
      return m;
    });

    setMaterials(updated);

    if (detailModal.isOpen && detailModal.material?.id === material.id) {
      setDetailModal({
        ...detailModal,
        material: { ...detailModal.material, status: 'Published', reportReason: null },
      });
    }

    toast.success('Report Cleared', 'Copyright/content safety flag resolved.');
  };

  const handleDeleteMaterial = () => {
    if (!deleteModal.material) return;
    const updated = materials.filter((m) => m.id !== deleteModal.material.id);
    setMaterials(updated);
    setDeleteModal({ isOpen: false, material: null });
    if (detailModal.isOpen) {
      setDetailModal({ isOpen: false, material: null });
    }
    toast.error('Material Deleted', 'The classroom material was permanently removed.');
  };

  // Columns definition
  const columns = [
    {
      key: 'material',
      header: 'Material',
      render: (row) => (
        <div className="flex items-start gap-3 w-[280px]">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#123B66] flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
            <FiFileText className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div
              onClick={() => setDetailModal({ isOpen: true, material: row })}
              className="text-xs font-semibold text-slate-900 hover:text-[#123B66] hover:underline text-left block truncate cursor-pointer"
              title={row.title}
              role="button"
            >
              {row.title}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <span className="font-mono text-[10px] text-slate-400">{row.id}</span>
              <span>•</span>
              <span>{row.fileSize}</span>
            </div>
          </div>
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
          <div className="flex-1 min-w-0">
            <div
              onClick={() => navigate(`/teachers/${row.teacher.id}`)}
              className="text-xs font-medium text-slate-900 hover:text-[#123B66] hover:underline truncate block text-left cursor-pointer"
              role="button"
            >
              {row.teacher.name}
            </div>
            <span className="text-[10px] text-slate-400 truncate block">
              {row.teacher.qualification}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (row) => (
        <div className="w-[200px]">
          <div className="text-xs font-medium text-slate-900 truncate" title={row.batch.name}>
            {row.batch.name}
          </div>
          <span className="font-mono text-[10px] text-slate-500">{row.batch.code}</span>
        </div>
      ),
    },
    {
      key: 'fileType',
      header: 'File Type',
      className: 'w-24',
      render: (row) => (
        <span
          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
            row.fileType === 'PDF'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : row.fileType === 'ZIP'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : row.fileType === 'DOCX'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {row.fileType}
        </span>
      ),
    },
    {
      key: 'uploadedDate',
      header: 'Uploaded Date',
      className: 'text-xs text-slate-600 whitespace-nowrap',
      render: (row) => row.uploadedDate,
    },
    {
      key: 'downloads',
      header: 'Downloads',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <FiDownload className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.downloads}</span>
          <span className="text-slate-400 font-normal text-[11px]">({row.viewsCount} views)</span>
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
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailModal({ isOpen: true, material: row })}
            className="h-7 text-xs px-2"
          >
            Review
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleVisibility(row)}
            className="h-7 text-xs px-2"
            title={row.status === 'Hidden' ? 'Make Published' : 'Hide Material'}
          >
            {row.status === 'Hidden' ? (
              <FiEye className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <FiEyeOff className="w-3.5 h-3.5 text-slate-600" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteModal({ isOpen: true, material: row })}
            className="h-7 text-xs px-2 text-red-600 hover:bg-red-50 hover:border-red-300"
            title="Delete File"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Study Materials"
        subtitle="Review, audit, and moderate classroom study resources uploaded by teachers."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="navy" size="md" className="gap-1.5 py-1 px-3">
              <FiFolder className="w-3.5 h-3.5 text-[#123B66]" />
              <span>{materials.length} Total Course Files</span>
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

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search by title, teacher, batch, or filename..."
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs text-slate-500">File Type:</span>
            <select
              value={fileTypeFilter}
              onChange={(e) => {
                setFileTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#123B66] cursor-pointer"
            >
              <option value="ALL">All File Types</option>
              <option value="PDF">PDF Documents</option>
              <option value="DOCX">Word Documents</option>
              <option value="ZIP">ZIP Archives</option>
            </select>
          </div>
        </div>

        {/* Applied filters chip */}
        {(searchQuery || fileTypeFilter !== 'ALL' || activeTab !== 'all') && (
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
            {fileTypeFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                Type: {fileTypeFilter}
                <button
                  type="button"
                  onClick={() => setFileTypeFilter('ALL')}
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
                setFileTypeFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[#1D4ED8] hover:underline text-[11px] ml-auto font-medium cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredMaterials.length > 0 ? (
          <>
            <DataTable
              columns={columns}
              data={paginatedMaterials}
              className="border-none"
            />
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredMaterials.length}
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
            icon={FiFolder}
            title="No study materials found"
            description="No files match your current filter parameters or search queries."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab('all');
                  setFileTypeFilter('ALL');
                  setSearchQuery('');
                }}
              >
                Clear all filters
              </Button>
            }
          />
        )}
      </div>

      {/* Detail Inspection Modal */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, material: null })}
        title="Study Material Dossier"
        size="xl"
      >
        {detailModal.material && (
          <div className="space-y-4 text-xs">
            {detailModal.material.status === 'Reported' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-red-900">
                  <FiAlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Reported Material Notice</span>
                </div>
                <p className="text-red-700">{detailModal.material.reportReason}</p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveReport(detailModal.material)}
                    className="h-7 text-xs bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                  >
                    Clear & Resolve Flag
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">{detailModal.material.title}</h3>
              <p className="text-slate-600 leading-relaxed">{detailModal.material.description}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">File Name:</span>
                <span className="font-mono text-slate-800 font-medium">{detailModal.material.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Type & Size:</span>
                <span className="text-slate-800">
                  {detailModal.material.fileType} • {detailModal.material.fileSize}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teacher:</span>
                <span className="font-medium text-slate-800">{detailModal.material.teacher.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch Code:</span>
                <span className="font-mono text-slate-800">{detailModal.material.batch.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Upload Date:</span>
                <span className="text-slate-800">{detailModal.material.uploadedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Engagement:</span>
                <span className="text-slate-800">
                  {detailModal.material.downloads} downloads • {detailModal.material.viewsCount} views
                </span>
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800">Student Access Permissions</h4>
              <div className="grid grid-cols-3 gap-2">
                <div
                  className={`p-2.5 rounded-lg border text-center ${
                    detailModal.material.permissions.viewOnline
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <FiEye className="w-4 h-4 mx-auto mb-1" />
                  <span className="font-semibold block">View Online</span>
                  <span className="text-[10px]">
                    {detailModal.material.permissions.viewOnline ? 'Allowed' : 'Disabled'}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-lg border text-center ${
                    detailModal.material.permissions.downloadPermitted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <FiDownload className="w-4 h-4 mx-auto mb-1" />
                  <span className="font-semibold block">Download PDF</span>
                  <span className="text-[10px]">
                    {detailModal.material.permissions.downloadPermitted ? 'Permitted' : 'Locked'}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-lg border text-center ${
                    detailModal.material.permissions.bookmark
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <FiBookmark className="w-4 h-4 mx-auto mb-1" />
                  <span className="font-semibold block">Bookmark</span>
                  <span className="text-[10px]">
                    {detailModal.material.permissions.bookmark ? 'Enabled' : 'Restricted'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleVisibility(detailModal.material)}
                className="text-xs"
              >
                {detailModal.material.status === 'Hidden' ? 'Make Visible' : 'Hide from Students'}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailModal({ isOpen: false, material: null })}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info('File Download', `Simulated downloading ${detailModal.material.fileName}`);
                  }}
                  leftIcon={<FiDownload className="w-3.5 h-3.5" />}
                >
                  Download File
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, material: null })}
        title="Delete Study Material"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold text-red-900">Are you sure you want to delete this resource?</p>
            <p className="mt-1 text-red-700">
              This action cannot be undone. Any students who bookmarked this material will lose access immediately.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setDeleteModal({ isOpen: false, material: null })}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteMaterial} leftIcon={<FiTrash2 className="w-3.5 h-3.5" />}>
              Delete File
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default StudyMaterials;
