import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviews, updateReviewStatus } from '../../API/thunks/reviewsThunks';
import {
  FiStar,
  FiTrash2,
  FiX,
  FiCheck,
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


export function ReviewsList() {
  const navigate = useNavigate();
  const toast = useToast();

  const tableRef = useRef(null);
  const dispatch = useDispatch();
  const { data: reviews, totalCount, publishedCount, flaggedCount, removedCount, isLoading } = useSelector((state) => state.reviews);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    review: null,
  });

  // Remove Modal
  const [removeModal, setRemoveModal] = useState({
    isOpen: false,
    review: null,
    reason: 'Violates Platform Review Guidelines',
  });

  useEffect(() => {
    let apiStatus = undefined;
    if (activeTab === 'published') apiStatus = 'PUBLISHED';
    if (activeTab === 'flagged') apiStatus = 'FLAGGED';
    if (activeTab === 'removed') apiStatus = 'REMOVED';

    dispatch(fetchReviews({
      page: currentPage,
      page_size: pageSize,
      search: searchQuery,
      rating: ratingFilter === 'ALL' ? undefined : ratingFilter,
      status: apiStatus
    }));
  }, [dispatch, currentPage, pageSize, searchQuery, activeTab, ratingFilter]);

  // Tabs
  const tabs = [
    { key: 'all', label: 'All Reviews', count: totalCount },
    {
      key: 'published',
      label: 'Published',
      count: publishedCount,
    },
    {
      key: 'flagged',
      label: 'Flagged / Reported',
      count: flaggedCount,
    },
    {
      key: 'removed',
      label: 'Removed by Admin',
      count: removedCount,
    },
  ];

  // Filtering and pagination handled by API
  const filteredReviews = reviews || [];
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedReviews = filteredReviews;

  // Actions
  const handleKeepReview = async (item) => {
    try {
      await dispatch(updateReviewStatus({ id: item.id, status: 'PUBLISHED', notes: 'Reviewed & verified by Super Admin' })).unwrap();
      if (detailModal.isOpen && detailModal.review?.id === item.id) {
        setDetailModal({
          ...detailModal,
          review: { ...detailModal.review, status: 'PUBLISHED' },
        });
      }
      toast.success('Review Kept Active', 'Review marked as legitimate and published.');
    } catch (e) {
      toast.error('Error', 'Failed to update review status.');
    }
  };

  const handleOpenRemoveModal = (item) => {
    setRemoveModal({
      isOpen: true,
      review: item,
      reason: 'Violates Platform Review Guidelines',
    });
  };

  const handleConfirmRemove = async () => {
    const { review, reason } = removeModal;
    if (!review) return;

    try {
      await dispatch(updateReviewStatus({ id: review.id, status: 'REMOVED', notes: `Removed by Super Admin: ${reason}` })).unwrap();
      setRemoveModal({ isOpen: false, review: null, reason: '' });
      if (detailModal.isOpen) {
        setDetailModal({ isOpen: false, review: null });
      }
      toast.error('Review Removed', `Review ${review.id} has been hidden from public teacher profile.`);
    } catch (e) {
      toast.error('Error', 'Failed to remove review.');
    }
  };

  // Helper for star rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        <span className="font-bold text-slate-900 text-xs font-mono">{rating.toFixed(1)}</span>
        <div className="flex items-center text-amber-500">
          {[1, 2, 3, 4, 5].map((s) => (
            <FiStar
              key={s}
              className={`w-3 h-3 ${
                s <= Math.round(rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Table Columns
  const columns = [
    {
      key: 'reviewer',
      header: 'Reviewer',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.reviewer?.name || row.student_name || 'N/A'} src={row.reviewer?.photo} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 group-hover:text-[#123B66] transition-colors leading-tight">
              {row.reviewer?.name || row.student_name || 'N/A'}
            </p>
            <span className="text-[11px] text-slate-500 block mt-0.5">{row.reviewer?.grade_level || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.teacher_info?.name || row.teacher_name || 'N/A'} src={row.teacher_info?.photo} size="xs" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">
              {row.teacher_info?.name || row.teacher_name || 'N/A'}
            </p>
            <span className="text-[10px] text-slate-500 block truncate">{row.teacher_info?.subject || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row) => renderStars(row.rating),
    },
    {
      key: 'review',
      header: 'Feedback',
      render: (row) => (
        <div className="max-w-[260px]">
          <p
            onClick={() => setDetailModal({ isOpen: true, review: row })}
            className="text-xs text-slate-800 line-clamp-2 hover:text-[#123B66] cursor-pointer"
            title="Click to view category ratings"
          >
            &quot;{row.comment || row.review || row.feedback || ''}&quot;
          </p>
          <span className="font-mono text-[10px] text-slate-400 mt-0.5 block">{row.batch_code || row.batch_title || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      className: 'text-xs text-slate-500 font-mono whitespace-nowrap',
      render: (row) => row.formatted_date || row.date,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status === 'PUBLISHED' ? 'Published' : row.status === 'FLAGGED' ? 'Flagged' : row.status === 'REMOVED' ? 'Removed' : 'Pending'} />,
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
          {row.status === 'FLAGGED' ? (
            <div className="flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={() => handleKeepReview(row)}
                className="w-7 h-7 rounded-full text-emerald-600 hover:bg-emerald-50 border border-emerald-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Keep Review"
                aria-label="Keep Review"
              >
                <FiCheck className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleOpenRemoveModal(row)}
                className="w-7 h-7 rounded-full text-danger hover:bg-red-50 border border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Remove Review"
                aria-label="Remove Review"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailModal({ isOpen: true, review: row })}
            leftIcon={<FiEye className="w-3.5 h-3.5" />}
            className="h-7 text-xs px-2.5"
          >
            Inspect
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Reviews & Ratings"
        subtitle="Audit, moderate, and inspect student ratings across teaching quality, doubt solving, punctuality, and notes."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="navy" size="md" className="gap-1.5 py-1 px-3">
              <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Platform Avg: 4.8 / 5.0</span>
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

      {/* Filter and Search Bar */}
      <FilterBar
        isFiltered={searchQuery !== '' || ratingFilter !== 'ALL' || activeTab !== 'all'}
        activeFilterCount={
          (searchQuery ? 1 : 0) + (ratingFilter !== 'ALL' ? 1 : 0) + (activeTab !== 'all' ? 1 : 0)
        }
        onReset={() => {
          setSearchQuery('');
          setRatingFilter('ALL');
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
            placeholder="Search reviewer, teacher, batch..."
            size="sm"
          />
        </div>

        <div className="w-36 sm:w-40 shrink-0">
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Star Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </FilterBar>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredReviews.length > 0 ? (
          <>
            <DataTable ref={tableRef} columns={columns} data={paginatedReviews} className="border-none" />
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
            icon={FiStar}
            title="No reviews found"
            description="No reviews match your selected filter criteria."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab('all');
                  setRatingFilter('ALL');
                  setSearchQuery('');
                }}
              >
                Clear all filters
              </Button>
            }
          />
        )}
      </div>

      {/* Category Ratings Breakdown Modal */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, review: null })}
        title="Review & Rating Category Inspection"
        size="xl"
      >
        {detailModal.review && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={detailModal.review.reviewer?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(detailModal.review.reviewer?.name || 'User')}&background=random`}
                  alt={detailModal.review.reviewer?.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {detailModal.review.reviewer?.name || detailModal.review.student_name}
                  </h4>
                  <span className="text-slate-500 text-[11px]">
                    {detailModal.review.reviewer?.grade_level} • Review ID {detailModal.review.id.slice(0,8)}
                  </span>
                </div>
              </div>
              <StatusBadge status={detailModal.review.status} />
            </div>

            {/* Target Teacher & Batch */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Faculty:</span>
                <span className="font-semibold text-slate-800">{detailModal.review.teacher_info?.name || detailModal.review.teacher_name}</span>
                <span className="text-[10px] text-slate-400 block">{detailModal.review.teacher_info?.subject}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Batch Code:</span>
                <span className="font-mono text-slate-800 font-medium">
                  {detailModal.review.batch_code}
                </span>
                <span className="text-[10px] text-slate-400 block">{detailModal.review.formatted_date}</span>
              </div>
            </div>

            {/* 4 Distinct Rating Categories */}
            <div className="space-y-3">
              <h5 className="font-semibold text-slate-800">Category Evaluation Breakdown</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Teaching Quality</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {detailModal.review.teaching_quality || detailModal.review.categoryRatings?.teachingQuality || 0} / 5
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{
                        width: `${((detailModal.review.teaching_quality || detailModal.review.categoryRatings?.teachingQuality || 0) / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Doubt Solving</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {detailModal.review.doubt_solving || detailModal.review.categoryRatings?.doubtSolving || 0} / 5
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{
                        width: `${((detailModal.review.doubt_solving || detailModal.review.categoryRatings?.doubtSolving || 0) / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Punctuality</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {detailModal.review.punctuality || detailModal.review.categoryRatings?.punctuality || 0} / 5
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{
                        width: `${((detailModal.review.punctuality || detailModal.review.categoryRatings?.punctuality || 0) / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Notes Quality</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {detailModal.review.notes_quality || detailModal.review.categoryRatings?.notesQuality || 0} / 5
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{
                        width: `${((detailModal.review.notes_quality || detailModal.review.categoryRatings?.notesQuality || 0) / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Review Text */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed italic">
              &quot;{detailModal.review.comment || detailModal.review.review}&quot;
            </div>

            {detailModal.review.moderationNotes && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                <strong>Moderation Log:</strong> {detailModal.review.moderationNotes}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const rev = detailModal.review;
                  setDetailModal({ isOpen: false, review: null });
                  handleOpenRemoveModal(rev);
                }}
                className="text-red-600 hover:bg-red-50"
              >
                Remove Review
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailModal({ isOpen: false, review: null })}
                >
                  Close
                </Button>
                {detailModal.review.status !== 'Published' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleKeepReview(detailModal.review)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Keep / Approve Review
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={removeModal.isOpen}
        onClose={() => setRemoveModal({ isOpen: false, review: null, reason: '' })}
        title="Remove Student Review"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold text-red-900">Confirm Review Removal</p>
            <p className="mt-1 text-red-700">
              Removing this review will hide it from the educator&apos;s public profile and adjust the teacher&apos;s aggregate rating accordingly.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="review-removal-reason" className="block font-semibold text-slate-700">
              Reason for Removal
            </label>
            <select
              id="review-removal-reason"
              value={removeModal.reason}
              onChange={(e) => setRemoveModal({ ...removeModal, reason: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
            >
              <option value="Violates Platform Review Guidelines">Violates Platform Review Guidelines</option>
              <option value="Inappropriate or Defamatory Language">Inappropriate or Defamatory Language</option>
              <option value="Commercial Solicitation / Conflict of Interest">Commercial Solicitation / Conflict of Interest</option>
              <option value="Off-Topic or Factually Inaccurate Content">Off-Topic or Factually Inaccurate Content</option>
              <option value="Requested by Faculty Disciplinary Hearing">Requested by Faculty Disciplinary Hearing</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRemoveModal({ isOpen: false, review: null, reason: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmRemove}
              leftIcon={<FiTrash2 className="w-3.5 h-3.5" />}
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ReviewsList;
