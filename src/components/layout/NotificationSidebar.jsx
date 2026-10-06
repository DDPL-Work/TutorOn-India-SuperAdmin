import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiX,
  FiBell,
  FiCheckCircle,
  FiCheck,
  FiSearch,
  FiFilter,
  FiExternalLink,
  FiRefreshCw,
  FiShield,
  FiMessageSquare,
  FiUserCheck,
  FiFileText,
  FiAlertCircle,
  FiDollarSign,
} from 'react-icons/fi';
import {
  fetchAllNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../API/thunks/notificationsThunks';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

export function NotificationSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { allNotifications = [], allUnreadCount = 0, isLoadingAll } = useSelector(
    (state) => state.notifications || {}
  );

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'SYSTEM' | 'REQUESTS' | 'MESSAGES'
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle smooth enter/exit animation and completely remove background window scrollbar
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });

      // Lock both HTML and BODY to ensure native browser scrollbar is completely removed
      document.documentElement.classList.add('sidebar-open');
      document.body.classList.add('sidebar-open');
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      return () => cancelAnimationFrame(frame);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        document.documentElement.classList.remove('sidebar-open');
        document.body.classList.remove('sidebar-open');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }, 300);

      return () => {
        clearTimeout(timer);
        document.documentElement.classList.remove('sidebar-open');
        document.body.classList.remove('sidebar-open');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // When drawer opens, fetch fresh notifications if not loaded
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllNotifications());
    }
  }, [isOpen, dispatch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchAllNotifications()).unwrap();
      toast.success('Alerts Refreshed', 'Latest platform notifications synchronized.');
    } catch {
      toast.error('Sync Error', 'Could not refresh platform notifications.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllNotificationsRead()).unwrap();
      toast.success('All Alerts Read', 'All platform notifications marked as read.');
    } catch {
      toast.error('Action Failed', 'Could not mark all notifications as read.');
    }
  };

  const handleItemClick = async (item) => {
    if (!item.is_read) {
      dispatch(markNotificationRead(item.id));
    }
    const targetRoute = getTargetRoute(item);
    onClose();
    navigate(targetRoute);
  };

  const handleMarkSingleRead = (e, item) => {
    e.stopPropagation();
    dispatch(markNotificationRead(item.id));
    toast.info('Marked Read', `Alert "${item.title}" marked as read.`);
  };

  const getTargetRoute = (item) => {
    const type = (item.notification_type || '').toUpperCase();
    const title = (item.title || '').toLowerCase();

    if (type.includes('CONNECTION') || title.includes('connection')) {
      return '/connections?tab=pending_admin';
    }
    if (type.includes('ENROLLMENT') || title.includes('enrollment')) {
      return '/enrollments?tab=awaiting_confirmation';
    }
    if (type.includes('TEACHER') || type.includes('VERIF') || title.includes('teacher') || title.includes('verified')) {
      return '/teachers?tab=pending';
    }
    if (type.includes('MESSAGE') || title.includes('message')) {
      return '/dashboard';
    }
    if (type.includes('PAYMENT') || type.includes('FEE') || title.includes('fee') || title.includes('payment')) {
      return '/payments';
    }
    if (type.includes('REPORT') || title.includes('report') || title.includes('abuse')) {
      return '/reports';
    }
    if (type.includes('ANNOUNCEMENT') || title.includes('announcement')) {
      return '/announcements-promotions/announcements';
    }
    return '/audit-logs';
  };

  const getTypeMeta = (item) => {
    const type = (item.notification_type || '').toUpperCase();
    const title = (item.title || '').toLowerCase();

    if (type.includes('CONNECTION') || title.includes('connection')) {
      return {
        label: 'Connection',
        variant: 'info',
        icon: <FiUserCheck className="w-3.5 h-3.5" />,
      };
    }
    if (type.includes('ENROLLMENT') || title.includes('enrollment')) {
      return {
        label: 'Enrollment',
        variant: 'success',
        icon: <FiFileText className="w-3.5 h-3.5" />,
      };
    }
    if (type.includes('TEACHER') || type.includes('VERIF') || title.includes('verified')) {
      return {
        label: 'Verification',
        variant: 'success',
        icon: <FiShield className="w-3.5 h-3.5" />,
      };
    }
    if (type.includes('MESSAGE') || title.includes('message')) {
      return {
        label: 'Message',
        variant: 'purple',
        icon: <FiMessageSquare className="w-3.5 h-3.5" />,
      };
    }
    if (type.includes('FEE') || type.includes('PAYMENT') || title.includes('fee')) {
      return {
        label: 'Finance',
        variant: 'warning',
        icon: <FiDollarSign className="w-3.5 h-3.5" />,
      };
    }
    if (type.includes('REPORT') || title.includes('abuse')) {
      return {
        label: 'Grievance',
        variant: 'danger',
        icon: <FiAlertCircle className="w-3.5 h-3.5" />,
      };
    }
    return {
      label: 'System',
      variant: 'default',
      icon: <FiBell className="w-3.5 h-3.5" />,
    };
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Recent';
    try {
      const now = new Date();
      const date = new Date(timestamp);
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay === 1) return 'Yesterday';
      if (diffDay < 7) return `${diffDay}d ago`;
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((item) => {
      // Filter tab
      if (activeFilter === 'UNREAD' && item.is_read) return false;
      if (activeFilter === 'SYSTEM' && item.notification_type !== 'SYSTEM') return false;
      if (
        activeFilter === 'REQUESTS' &&
        !item.notification_type?.includes('REQUEST') &&
        !(item.title || '').toLowerCase().includes('request')
      ) {
        return false;
      }
      if (
        activeFilter === 'MESSAGES' &&
        item.notification_type !== 'NEW_MESSAGE' &&
        !(item.title || '').toLowerCase().includes('message')
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = (item.title || '').toLowerCase().includes(query);
        const matchesMsg = (item.message || '').toLowerCase().includes(query);
        const matchesType = (item.notification_type || '').toLowerCase().includes(query);
        return matchesTitle || matchesMsg || matchesType;
      }

      return true;
    });
  }, [allNotifications, activeFilter, searchQuery]);

  if (!isRendered) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div
          className={`w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 pointer-events-auto transform transition-transform duration-300 ease-out ${
            isVisible ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#123B66]/10 text-[#123B66] flex items-center justify-center shrink-0">
                  <FiBell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 font-geist">
                      All Notifications
                    </h2>
                    {allUnreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                        {allUnreadCount} new
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live platform audit stream & notifications
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isLoadingAll}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                  title="Refresh Notifications"
                >
                  <FiRefreshCw
                    className={`w-4 h-4 ${isRefreshing || isLoadingAll ? 'animate-spin' : ''}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                  title="Close Drawer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/80 text-xs">
              <span className="text-slate-500">
                Total Logs: <strong className="text-slate-800 font-mono">{allNotifications.length}</strong>
              </span>

              {allUnreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-[#123B66] hover:text-[#0B1F3A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative mt-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts by title or content..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123B66]/20 focus:border-[#123B66]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-none pb-0.5">
              {[
                { id: 'ALL', label: 'All', count: allNotifications.length },
                { id: 'UNREAD', label: 'Unread', count: allUnreadCount },
                { id: 'REQUESTS', label: 'Requests' },
                { id: 'SYSTEM', label: 'System' },
                { id: 'MESSAGES', label: 'Messages' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === tab.id
                      ? 'bg-[#123B66] text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        activeFilter === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
            {isLoadingAll && allNotifications.length === 0 ? (
              <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#123B66] mx-auto"></div>
                <p className="text-xs text-slate-500 mt-3 font-medium">Loading platform alerts...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <FiBell className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 font-geist">No Alerts Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  {searchQuery || activeFilter !== 'ALL'
                    ? 'No platform notifications match the current search filters.'
                    : 'All notifications are up to date. Platform events will appear here in real-time.'}
                </p>
                {(searchQuery || activeFilter !== 'ALL') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilter('ALL');
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const meta = getTypeMeta(item);
                const isUnread = !item.is_read;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-4 transition-colors flex items-start gap-3 cursor-pointer group ${
                      isUnread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Unread indicator / Type Icon */}
                    <div className="relative mt-0.5 shrink-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isUnread
                            ? 'bg-[#123B66] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {meta.icon}
                      </div>
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-slate-900 leading-snug group-hover:text-[#123B66] transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                            {meta.label}
                          </span>
                          {item.related_object_id && (
                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                              ID: {item.related_object_id}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkSingleRead(e, item)}
                              className="text-[11px] font-medium text-slate-500 hover:text-[#123B66] hover:underline px-1.5 py-0.5 rounded cursor-pointer"
                              title="Mark as read"
                            >
                              Mark read
                            </button>
                          )}
                          <span className="text-slate-400 group-hover:text-[#123B66] transition-colors">
                            <FiExternalLink className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/audit-logs');
              }}
              className="text-[#123B66] hover:text-[#0B1F3A] font-semibold flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <FiShield className="w-4 h-4" />
              Open Full Audit Inspection Logs
            </button>

            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default NotificationSidebar;
