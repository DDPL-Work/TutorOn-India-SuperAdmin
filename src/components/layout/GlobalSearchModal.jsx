import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiX,
  FiUsers,
  FiUserCheck,
  FiLink,
  FiBookOpen,
  FiSend,
  FiStar,
  FiAlertTriangle,
  FiArrowRight,
  FiCornerDownLeft,
  FiShield,
  FiCreditCard,
} from 'react-icons/fi';
import { INITIAL_STUDENTS } from '../../data/students';
import { INITIAL_TEACHERS } from '../../data/teachers';
import { INITIAL_CONNECTIONS } from '../../data/connections';
import { INITIAL_ENROLLMENTS } from '../../data/enrollments';
import { INITIAL_ANNOUNCEMENTS } from '../../data/announcements';
import { INITIAL_REVIEWS } from '../../data/reviews';
import { INITIAL_REPORTS } from '../../data/reports';

export function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  };

  // Compute grouped search results across all 7 entities
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const results = {
      students: [],
      teachers: [],
      connections: [],
      enrollments: [],
      announcements: [],
      reviews: [],
      reports: [],
    };

    // 1. Students
    INITIAL_STUDENTS.forEach((item) => {
      const match =
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.grade && item.grade.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.school && item.school.toLowerCase().includes(q));
      if (match) {
        results.students.push({
          id: item.id,
          title: item.name,
          subtitle: `${item.grade} • ${item.board}`,
          extra: item.id,
          url: `/students/${item.id}`,
          type: 'student',
        });
      }
    });

    // 2. Teachers
    INITIAL_TEACHERS.forEach((item) => {
      const subjectsStr = Array.isArray(item.subjects) ? item.subjects.join(' ') : '';
      const match =
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        subjectsStr.toLowerCase().includes(q) ||
        (item.qualification && item.qualification.toLowerCase().includes(q));
      if (match) {
        results.teachers.push({
          id: item.id,
          title: item.name,
          subtitle: subjectsStr || item.qualification,
          extra: item.verificationStatus,
          url: `/teachers/${item.id}`,
          type: 'teacher',
        });
      }
    });

    // 3. Connections
    INITIAL_CONNECTIONS.forEach((item) => {
      const studentName = item.student?.name || '';
      const teacherName = item.teacher?.name || '';
      const subject = item.teacher?.subject || '';
      const match =
        item.id.toLowerCase().includes(q) ||
        studentName.toLowerCase().includes(q) ||
        teacherName.toLowerCase().includes(q) ||
        subject.toLowerCase().includes(q);
      if (match) {
        results.connections.push({
          id: item.id,
          title: `${studentName} ↔ ${teacherName}`,
          subtitle: `${subject} • ${item.status}`,
          extra: item.id,
          url: `/connections/${item.id}`,
          type: 'connection',
        });
      }
    });

    // 4. Enrollments
    INITIAL_ENROLLMENTS.forEach((item) => {
      const studentName = item.student?.name || '';
      const teacherName = item.teacher?.name || '';
      const batchTitle = item.batch?.title || '';
      const match =
        item.id.toLowerCase().includes(q) ||
        studentName.toLowerCase().includes(q) ||
        teacherName.toLowerCase().includes(q) ||
        batchTitle.toLowerCase().includes(q);
      if (match) {
        results.enrollments.push({
          id: item.id,
          title: `${studentName} in ${batchTitle}`,
          subtitle: `Faculty: ${teacherName} • ${item.status}`,
          extra: item.id,
          url: `/enrollments/${item.id}`,
          type: 'enrollment',
        });
      }
    });

    // 5. Announcements
    INITIAL_ANNOUNCEMENTS.forEach((item) => {
      const match =
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        (item.message && item.message.toLowerCase().includes(q)) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.audience && item.audience.toLowerCase().includes(q));
      if (match) {
        results.announcements.push({
          id: item.id,
          title: item.title,
          subtitle: `${item.type} • Audience: ${item.audience}`,
          extra: item.status,
          url: '/announcements-promotions/announcements',
          type: 'announcement',
        });
      }
    });

    // 6. Reviews
    INITIAL_REVIEWS.forEach((item) => {
      const studentName = item.student?.name || '';
      const teacherName = item.teacher?.name || '';
      const batchName = item.batch?.name || '';
      const match =
        item.id.toLowerCase().includes(q) ||
        studentName.toLowerCase().includes(q) ||
        teacherName.toLowerCase().includes(q) ||
        batchName.toLowerCase().includes(q) ||
        (item.comment && item.comment.toLowerCase().includes(q));
      if (match) {
        results.reviews.push({
          id: item.id,
          title: `${studentName}'s review on ${teacherName}`,
          subtitle: `${item.rating} ★ • ${batchName}`,
          extra: item.status,
          url: '/reviews',
          type: 'review',
        });
      }
    });

    // 7. Reports
    INITIAL_REPORTS.forEach((item) => {
      const reportedBy = item.reportedBy?.name || '';
      const reportedUser = item.reportedUser?.name || '';
      const match =
        item.id.toLowerCase().includes(q) ||
        reportedBy.toLowerCase().includes(q) ||
        reportedUser.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));
      if (match) {
        results.reports.push({
          id: item.id,
          title: `Report: ${item.category} (${item.id})`,
          subtitle: `Filed by ${reportedBy} against ${reportedUser}`,
          extra: item.priority,
          url: `/reports/${item.id}`,
          type: 'report',
        });
      }
    });

    return results;
  }, [query]);

  // Flattened array of all search matches for keyboard navigation
  const flatResults = useMemo(() => {
    if (!searchResults) return [];
    return [
      ...searchResults.students,
      ...searchResults.teachers,
      ...searchResults.connections,
      ...searchResults.enrollments,
      ...searchResults.announcements,
      ...searchResults.reviews,
      ...searchResults.reports,
    ];
  }, [searchResults]);

  const totalMatchCount = flatResults.length;

  // Handle keyboard events (Up, Down, Enter, Esc)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (flatResults.length === 0 ? 0 : (prev + 1) % flatResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        flatResults.length === 0 ? 0 : (prev - 1 + flatResults.length) % flatResults.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        navigate(flatResults[selectedIndex].url);
        handleClose();
      }
    }
  };

  const handleSelectResult = (result) => {
    navigate(result.url);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Search Modal Panel */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-in flex flex-col max-h-[82vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <FiSearch className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search students, faculty, batches, announcements, reviews, reports..."
            className="w-full text-sm bg-transparent border-0 outline-none text-slate-900 placeholder-slate-400 font-inter"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Clear search query"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          <kbd
            onClick={handleClose}
            className="px-2 py-0.5 text-xs text-slate-500 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-100 transition-colors"
          >
            ESC
          </kbd>
        </div>

        {/* Content Body: Scrollable Results or Quick Shortcuts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Case 1: Empty Query - Show Quick Module Navigation */}
          {!query.trim() && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                <span>Quick Module Shortcuts</span>
                <span>Press ↵ to open</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    label: 'Super Admin Dashboard',
                    path: '/dashboard',
                    icon: FiShield,
                    badge: 'Overview',
                  },
                  {
                    label: 'Students Directory',
                    path: '/students',
                    icon: FiUsers,
                    badge: '8,452',
                  },
                  {
                    label: 'Teacher Verification',
                    path: '/teachers/pending',
                    icon: FiUserCheck,
                    badge: '37 Pending',
                  },
                  {
                    label: 'Pending Connections',
                    path: '/connections?tab=pending_admin',
                    icon: FiLink,
                    badge: '24 Reviews',
                  },
                  {
                    label: 'Batch Enrollments',
                    path: '/enrollments?tab=awaiting_confirmation',
                    icon: FiBookOpen,
                    badge: '18 Awaiting',
                  },
                  {
                    label: 'Announcements & Promos',
                    path: '/announcements-promotions/announcements',
                    icon: FiSend,
                    badge: '6 Active',
                  },
                  {
                    label: 'Payments Escrow',
                    path: '/payments',
                    icon: FiCreditCard,
                    badge: '',
                  },
                  {
                    label: 'Safety Grievance Desk',
                    path: '/reports',
                    icon: FiAlertTriangle,
                    badge: '4 Tickets',
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        handleClose();
                      }}
                      className="p-3 text-left rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 text-slate-800 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#123B66]/10 text-[#123B66] group-hover:bg-[#123B66] group-hover:text-white transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Case 2: Query active with Results */}
          {query.trim() && totalMatchCount > 0 && (
            <div className="space-y-4">
              <div className="text-[11px] font-semibold text-slate-500">
                Found <strong className="text-slate-900 font-mono">{totalMatchCount}</strong>{' '}
                matching records across TutorOn platform:
              </div>

              {/* Group: Students */}
              {searchResults.students.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pb-1 border-b border-slate-100">
                    <FiUsers className="w-3.5 h-3.5 text-[#123B66]" />
                    <span>Students ({searchResults.students.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.students.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResult(res)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 truncate">
                              {res.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                              {res.extra}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{res.subtitle}</p>
                        </div>
                        <FiArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Teachers */}
              {searchResults.teachers.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pb-1 border-b border-slate-100">
                    <FiUserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Faculty & Teachers ({searchResults.teachers.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.teachers.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResult(res)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 truncate">
                              {res.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                              {res.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{res.subtitle}</p>
                        </div>
                        <FiArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Connections */}
              {searchResults.connections.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pb-1 border-b border-slate-100">
                    <FiLink className="w-3.5 h-3.5 text-purple-600" />
                    <span>Protected Connections ({searchResults.connections.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.connections.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResult(res)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 truncate">
                              {res.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                              {res.extra}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{res.subtitle}</p>
                        </div>
                        <FiArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Enrollments */}
              {searchResults.enrollments.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pb-1 border-b border-slate-100">
                    <FiBookOpen className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>Batch Enrollments ({searchResults.enrollments.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.enrollments.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResult(res)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 truncate">
                              {res.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                              {res.extra}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{res.subtitle}</p>
                        </div>
                        <FiArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Announcements */}
              {searchResults.announcements.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pb-1 border-b border-slate-100">
                    <FiSend className="w-3.5 h-3.5 text-blue-600" />
                    <span>Platform Announcements ({searchResults.announcements.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.announcements.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResult(res)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 truncate">
                              {res.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                              {res.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{res.subtitle}</p>
                        </div>
                        <FiArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Reviews */}
              {searchResults.reviews.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pb-1 border-b border-slate-100">
                    <FiStar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Reviews & Ratings ({searchResults.reviews.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.reviews.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResult(res)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 truncate">
                              {res.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                              {res.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{res.subtitle}</p>
                        </div>
                        <FiArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Reports */}
              {searchResults.reports.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pb-1 border-b border-slate-100">
                    <FiAlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Abuse Reports & Grievances ({searchResults.reports.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.reports.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResult(res)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 truncate">
                              {res.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-red-100 text-red-700 rounded">
                              {res.extra}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{res.subtitle}</p>
                        </div>
                        <FiArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Case 3: Query active with ZERO matches */}
          {query.trim() && totalMatchCount === 0 && (
            <div className="py-10 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FiSearch className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">No matching records found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No results found matching &quot;{query}&quot;. Try searching with a student name,
                faculty name, or reference ID (e.g. STU-10021, TCH-10248, ENR-50031).
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer with Keyboard navigation tips */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FiCornerDownLeft className="w-3 h-3 text-slate-400" />
            <span>Instant Client Index</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchModal;
