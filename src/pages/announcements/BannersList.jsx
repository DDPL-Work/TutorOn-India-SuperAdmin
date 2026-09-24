import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiSmartphone,
} from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import TableScrollButtons from '../../components/ui/TableScrollButtons';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { INITIAL_BANNERS } from '../../data/banners';

export function BannersList() {
  const navigate = useNavigate();
  const toast = useToast();

  const tableRef = useRef(null);
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [selectedBanner, setSelectedBanner] = useState(INITIAL_BANNERS[0]);

  // Create/Edit Modal State
  const [editModal, setEditModal] = useState({
    isOpen: false,
    isNew: false,
    banner: null,
  });

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    banner: null,
  });

  const handleOpenEdit = (banner = null) => {
    if (banner) {
      setEditModal({
        isOpen: true,
        isNew: false,
        banner: { ...banner },
      });
    } else {
      setEditModal({
        isOpen: true,
        isNew: true,
        banner: {
          id: `BAN-${Date.now().toString().slice(-5)}`,
          title: 'New Promotional Campaign',
          subtitle: 'Exclusive mentorship cohorts starting this weekend.',
          image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
          ctaText: 'Enroll Now',
          ctaDestination: '/enrollments',
          audience: 'Students',
          startDate: '2026-09-24',
          endDate: '2026-10-31',
          displayOrder: banners.length + 1,
          status: 'Active',
          accentColor: 'from-[#0B1F3A] to-[#1D4ED8]',
        },
      });
    }
  };

  const handleSaveBanner = () => {
    const { banner, isNew } = editModal;
    if (!banner.title.trim()) {
      toast.error('Title Required', 'Please enter a title for the banner.');
      return;
    }

    if (isNew) {
      setBanners([banner, ...banners]);
      setSelectedBanner(banner);
      toast.success('Banner Created', `"${banner.title}" created successfully.`);
    } else {
      const updated = banners.map((b) => (b.id === banner.id ? banner : b));
      setBanners(updated);
      setSelectedBanner(banner);
      toast.success('Banner Updated', `"${banner.title}" updated.`);
    }

    setEditModal({ isOpen: false, isNew: false, banner: null });
  };

  const handleToggleActive = (banner) => {
    const nextStatus = banner.status === 'Active' ? 'Disabled' : 'Active';
    const updated = banners.map((b) => (b.id === banner.id ? { ...b, status: nextStatus } : b));
    setBanners(updated);
    if (selectedBanner?.id === banner.id) {
      setSelectedBanner({ ...selectedBanner, status: nextStatus });
    }
    toast.info('Status Updated', `Banner is now ${nextStatus}.`);
  };

  const handleDeleteBanner = () => {
    if (!deleteModal.banner) return;
    const updated = banners.filter((b) => b.id !== deleteModal.banner.id);
    setBanners(updated);
    if (selectedBanner?.id === deleteModal.banner.id) {
      setSelectedBanner(updated[0] || null);
    }
    setDeleteModal({ isOpen: false, banner: null });
    toast.error('Banner Deleted', 'The promotional banner has been removed.');
  };

  const columns = [
    {
      key: 'banner',
      header: 'Banner Campaign',
      render: (row) => (
        <div className="flex items-center gap-3 w-[280px]">
          <img
            src={row.image}
            alt={row.title}
            className="w-14 h-9 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs"
          />
          <div className="flex-1 min-w-0">
            <div
              onClick={() => setSelectedBanner(row)}
              className="text-xs font-semibold text-slate-900 hover:text-[#123B66] hover:underline truncate block text-left cursor-pointer"
              title={row.title}
              role="button"
            >
              {row.title}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
              <span>{row.id}</span>
              <span>•</span>
              <span>Slot #{row.displayOrder}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'cta',
      header: 'CTA Action',
      render: (row) => (
        <div className="text-xs w-[160px]">
          <span className="font-semibold text-slate-800 block">{row.ctaText}</span>
          <span className="text-[10px] text-slate-400 font-mono block truncate" title={row.ctaDestination}>{row.ctaDestination}</span>
        </div>
      ),
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
      className: 'text-xs text-slate-600 whitespace-nowrap',
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
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
          <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedBanner(row)}
            className="h-7 text-xs px-2"
            title="Preview Banner"
          >
            <FiEye className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="h-7 text-xs px-2"
            title="Edit Banner"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleActive(row)}
            className={`h-7 text-xs px-2 ${
              row.status === 'Active'
                ? 'text-amber-700 hover:bg-amber-50'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
            title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
          >
            {row.status === 'Active' ? 'Off' : 'On'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteModal({ isOpen: true, banner: row })}
            className="h-7 text-xs px-2 text-red-600 hover:bg-red-50 hover:border-red-300"
            title="Delete"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Promotional Banners"
        subtitle="Manage and preview in-app promotional hero cards displayed to mobile and web learners."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/announcements-promotions/announcements')}
            >
              All Announcements
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleOpenEdit()}
              leftIcon={<FiPlus className="w-4 h-4" />}
            >
              + Create Banner
            </Button>
          </div>
        }
      />

      {/* Main Split Grid: Table (Left 7 Cols) + Live Mobile Preview (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Banners Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Active Banners Rotation ({banners.length})
              </h2>
              <p className="text-[11px] text-slate-500">
                Click any row or preview icon to inspect live mobile rendering.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="navy" size="sm">
                {banners.filter((b) => b.status === 'Active').length} Active
              </Badge>
              <TableScrollButtons targetRef={tableRef} />
            </div>
          </div>

          <DataTable
            ref={tableRef}
            columns={columns}
            data={banners}
            onRowClick={(row) => setSelectedBanner(row)}
            className="border-none"
          />
        </div>

        {/* Right Column: High-Fidelity Mobile App Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-geist">
                <FiSmartphone className="w-4 h-4 text-[#123B66]" />
                <span>In-App Mobile Screen Preview</span>
              </div>
              {selectedBanner && <StatusBadge status={selectedBanner.status} />}
            </div>

            {selectedBanner ? (
              <div className="space-y-4">
                {/* Mobile Device Mockup Frame */}
                <div className="w-full max-w-sm mx-auto bg-slate-950 p-3 rounded-3xl shadow-xl border-4 border-slate-800">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-2 pt-1 pb-2 text-[10px] text-slate-400 font-mono">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1.5">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* App Mini Header */}
                  <div className="bg-slate-900 px-3 py-2 rounded-t-xl flex items-center justify-between text-white border-b border-slate-800">
                    <span className="font-geist font-bold text-xs tracking-tight">
                      TutorOn <span className="text-[#1D4ED8]">INDIA</span>
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {selectedBanner.audience}
                    </span>
                  </div>

                  {/* Live Banner Card */}
                  <div className="relative rounded-b-xl overflow-hidden shadow-lg group">
                    <img
                      src={selectedBanner.image}
                      alt={selectedBanner.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-linear-to-t ${selectedBanner.accentColor} opacity-90 mix-blend-multiply`}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                          Featured
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">
                          Slot #{selectedBanner.displayOrder}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold font-geist leading-tight drop-shadow-xs">
                        {selectedBanner.title}
                      </h3>
                      <p className="text-[11px] text-slate-200 mt-1 line-clamp-2 leading-relaxed drop-shadow-xs">
                        {selectedBanner.subtitle}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 bg-white text-[#0B1F3A] font-bold text-xs px-3 py-1.5 rounded-full shadow-md cursor-pointer hover:bg-slate-100 transition-colors">
                          <span>{selectedBanner.ctaText}</span>
                          <span>→</span>
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">
                          Ends {selectedBanner.endDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated App Navigation Footer */}
                  <div className="mt-3 p-2 bg-slate-900 rounded-xl flex justify-around text-[10px] text-slate-400">
                    <span className="text-white font-semibold">Home</span>
                    <span>Batches</span>
                    <span>Live Class</span>
                    <span>Account</span>
                  </div>
                </div>

                {/* Banner Performance & Analytics Telemetry */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Impressions Delivered:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedBanner.impressionsCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Clicks:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedBanner.clicksCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Click-Through Rate (CTR):</span>
                    <span className="font-bold text-emerald-700">
                      {selectedBanner.impressionsCount > 0
                        ? `${((selectedBanner.clicksCount / selectedBanner.impressionsCount) * 100).toFixed(2)}%`
                        : '0.00%'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Target Route:</span>
                    <span className="font-mono text-slate-700">{selectedBanner.ctaDestination}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">Select a banner to preview.</p>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Banner Modal with Live Updating Preview */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, isNew: false, banner: null })}
        title={editModal.isNew ? 'Create Promotional Banner' : 'Edit Promotional Banner'}
        size="xl"
      >
        {editModal.banner && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Form Inputs */}
            <div className="space-y-3.5">
              <div>
                <label htmlFor="banner-title" className="block font-semibold text-slate-700 mb-1">
                  Banner Title *
                </label>
                <input
                  id="banner-title"
                  type="text"
                  value={editModal.banner.title}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      banner: { ...editModal.banner, title: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                />
              </div>

              <div>
                <label htmlFor="banner-subtitle" className="block font-semibold text-slate-700 mb-1">
                  Subtitle / Subtext
                </label>
                <input
                  id="banner-subtitle"
                  type="text"
                  value={editModal.banner.subtitle}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      banner: { ...editModal.banner, subtitle: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="banner-cta-text" className="block font-semibold text-slate-700 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    id="banner-cta-text"
                    type="text"
                    value={editModal.banner.ctaText}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        banner: { ...editModal.banner, ctaText: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                  />
                </div>

                <div>
                  <label htmlFor="banner-cta-dest" className="block font-semibold text-slate-700 mb-1">
                    Destination URL
                  </label>
                  <input
                    id="banner-cta-dest"
                    type="text"
                    value={editModal.banner.ctaDestination}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        banner: { ...editModal.banner, ctaDestination: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="banner-image-url" className="block font-semibold text-slate-700 mb-1">
                  Background Image URL
                </label>
                <input
                  id="banner-image-url"
                  type="text"
                  value={editModal.banner.image}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      banner: { ...editModal.banner, image: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="banner-audience-select" className="block font-semibold text-slate-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    id="banner-audience-select"
                    value={editModal.banner.audience}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        banner: { ...editModal.banner, audience: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                  >
                    <option value="All Users">All Users</option>
                    <option value="Students">Students Only</option>
                    <option value="Teachers">Teachers Only</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="banner-display-order" className="block font-semibold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    id="banner-display-order"
                    type="number"
                    min={1}
                    max={20}
                    value={editModal.banner.displayOrder}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        banner: { ...editModal.banner, displayOrder: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                  />
                </div>
              </div>
            </div>

            {/* Real-time Live Preview Card inside Modal */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-700 block">Instant Live Preview</span>
              <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-700">
                <img
                  src={editModal.banner.image}
                  alt={editModal.banner.title}
                  className="w-full h-52 object-cover"
                />
                <div
                  className={`absolute inset-0 bg-linear-to-t ${editModal.banner.accentColor} opacity-90 mix-blend-multiply`}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 w-fit mb-1">
                    {editModal.banner.audience}
                  </span>
                  <h3 className="text-sm font-bold font-geist leading-tight">
                    {editModal.banner.title || 'Untitled Banner'}
                  </h3>
                  <p className="text-[11px] text-slate-200 mt-1 line-clamp-2">
                    {editModal.banner.subtitle || 'Banner subtitle text preview...'}
                  </p>
                  <div className="mt-3">
                    <span className="inline-block bg-white text-[#0B1F3A] font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                      {editModal.banner.ctaText || 'Learn More'} →
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModal({ isOpen: false, isNew: false, banner: null })}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveBanner}>
                  Save Banner
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, banner: null })}
        title="Delete Promotional Banner"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold text-red-900">Are you sure you want to delete this banner?</p>
            <p className="mt-1 text-red-700">
              The banner campaign will be immediately removed from all student mobile and web feeds.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setDeleteModal({ isOpen: false, banner: null })}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteBanner} leftIcon={<FiTrash2 className="w-3.5 h-3.5" />}>
              Delete Banner
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default BannersList;
