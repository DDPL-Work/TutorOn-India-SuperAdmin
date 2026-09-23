import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiHelpCircle,
  FiLogOut,
  FiUser,
  FiSettings,
  FiShield,
  FiExternalLink,
  FiCheckCircle,
  FiCheck,
} from 'react-icons/fi';
import Breadcrumbs from './Breadcrumbs';
import GlobalSearchModal from './GlobalSearchModal';
import Avatar from '../ui/Avatar';
import Dropdown from '../ui/Dropdown';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export function Header({ onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 6 Specified Platform Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New teacher verification request',
      message: 'Dr. Ramesh Chandra Gupta submitted credentials for Physics (Class XII).',
      time: '10m ago',
      unread: true,
      path: '/teachers?tab=pending',
    },
    {
      id: 'notif-2',
      title: 'New connection approval request',
      message: 'Aarav Sharma requested teacher contact disclosure for Batch B-102.',
      time: '28m ago',
      unread: true,
      path: '/connections?tab=pending_admin',
    },
    {
      id: 'notif-3',
      title: 'New enrollment request',
      message: 'Aarav Sharma applied for Advanced Electromagnetism & Modern Physics.',
      time: '45m ago',
      unread: true,
      path: '/enrollments?tab=awaiting_confirmation',
    },
    {
      id: 'notif-4',
      title: 'New abuse report',
      message: 'Urgent grievance filed: Privacy violation report REP-70011 requires audit.',
      time: '1h ago',
      unread: true,
      path: '/reports/REP-70011',
    },
    {
      id: 'notif-5',
      title: 'Announcement published',
      message: 'Diwali Academic Prep Flash Discount announcement is now live across app.',
      time: '2h ago',
      unread: false,
      path: '/announcements-promotions/announcements',
    },
    {
      id: 'notif-6',
      title: 'Payment received',
      message: '₹14,500 tuition fee received for enrollment ENR-50031 via UPI escrow.',
      time: '3h ago',
      unread: false,
      path: '/payments/TXN-9928172635',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.info('Notifications Updated', 'All platform notifications marked as read.');
  };

  const handleNotificationClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    navigate(item.path);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    toast.success('Signed Out', 'You have been safely signed out of Super Admin.');
    navigate('/login');
  };

  // Keyboard shortcut listener for Global Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Open mobile navigation drawer"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <Breadcrumbs />
        </div>

        {/* Center: Global Search Shell Trigger */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-lg transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <FiSearch className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              <span className="font-normal text-slate-500">
                Search students, teachers, batches, audits...
              </span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Section: Help, Notifications & Profile */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Open search"
          >
            <FiSearch className="w-4 h-4" />
          </button>

          {/* Quick Help Popover */}
          <Dropdown
            align="right"
            width="w-64"
            trigger={
              <button
                type="button"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Super Admin Help & Documentation"
                aria-label="Help"
              >
                <FiHelpCircle className="w-4.5 h-4.5" />
              </button>
            }
          >
            {() => (
              <div className="p-3 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-900 font-geist">Super Admin Desk</span>
                  <span className="text-[10px] bg-blue-50 text-[#123B66] px-1.5 py-0.5 rounded font-medium">
                    v1.0-alpha
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <p className="text-[11px] leading-relaxed">
                    TutorOn India Central Administrative Portal for student lifecycle, teacher approvals, and batch audits.
                  </p>
                  <div className="pt-2 flex flex-col gap-1 border-t border-slate-100">
                    <a
                      href="#help-docs"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info('Documentation', 'Enterprise compliance manual is available in the admin resource center.');
                      }}
                      className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      <span>Verification SOP Guidelines</span>
                      <FiExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </Dropdown>

          {/* Notifications Dropdown */}
          <Dropdown
            align="right"
            width="w-80 sm:w-96"
            trigger={
              <button
                type="button"
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Platform Notifications"
                aria-label="Notifications"
              >
                <FiBell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
                )}
              </button>
            }
          >
            {() => (
              <div className="text-xs">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 font-geist">Platform Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-700 font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-[#123B66] hover:underline font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3 hover:bg-slate-50/80 transition-colors flex items-start gap-2.5 cursor-pointer ${
                        item.unread ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          item.unread ? 'bg-[#1D4ED8]' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 leading-snug">{item.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-100 text-center bg-slate-50/30">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/audit-logs');
                    }}
                    className="text-xs text-[#123B66] font-medium hover:underline cursor-pointer"
                  >
                    View audit trail alerts
                  </button>
                </div>
              </div>
            )}
          </Dropdown>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Profile Dropdown */}
          <Dropdown
            align="right"
            width="w-60"
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
                aria-label="User menu"
              >
                <Avatar
                  name={user?.name || 'Sudhir Sharma'}
                  size="sm"
                  status="online"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 leading-tight">
                    Super Admin
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Administrator
                  </span>
                </div>
              </button>
            }
            items={[
              {
                label: user?.email || 'admin@tutoron.in',
                icon: <FiShield className="text-[#123B66]" />,
                disabled: true,
              },
              { divider: true },
              {
                label: 'My Profile',
                icon: <FiUser />,
                onClick: () => setShowProfileModal(true),
              },
              {
                label: 'Account',
                icon: <FiSettings />,
                onClick: () => setShowAccountModal(true),
              },
              { divider: true },
              {
                label: 'Logout',
                icon: <FiLogOut />,
                danger: true,
                onClick: () => setShowLogoutConfirm(true),
              },
            ]}
          />
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* My Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Super Admin Profile"
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Left: Identity Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#0B1F3A]/5 to-[#123B66]/5 rounded-xl border border-[#123B66]/20">
              <Avatar name="Sudhir Sharma" size="lg" status="online" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sudhir Sharma</h3>
                <p className="text-xs text-[#123B66] font-medium">Chief Operations Officer</p>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  ID: ADM-00109 • Central Hub
                </span>
                <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  <FiCheckCircle className="w-3 h-3" />
                  Active Session
                </span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 rounded-xl border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-700 text-[11px] uppercase tracking-wide mb-2">Identity Details</h4>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-medium text-slate-800">admin@tutoron.in</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Platform Role:</span>
                <span className="font-semibold text-[#123B66]">Super Administrator</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-800">Operations & Compliance</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Account Created:</span>
                <span className="font-mono text-slate-700">Jan 12, 2024</span>
              </div>
            </div>
          </div>

          {/* Right: Security & Session */}
          <div className="space-y-4">
            <div className="space-y-2 bg-slate-50 rounded-xl border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-700 text-[11px] uppercase tracking-wide mb-2">Security Posture</h4>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Security Clearance:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  Level 1 Root
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">2-Factor Auth:</span>
                <span className="font-medium text-emerald-700 flex items-center gap-1">
                  <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Hardware Key
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Originating IP:</span>
                <span className="font-mono text-slate-700">103.21.244.18</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-700">New Delhi HQ</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 rounded-xl border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-700 text-[11px] uppercase tracking-wide mb-2">Active Session</h4>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Login Time:</span>
                <span className="font-mono text-slate-700">Today, 10:45 AM IST</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Session Duration:</span>
                <span className="font-mono text-slate-700">~3h 20m</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Session Token:</span>
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">jwt.sa.ADM00109.xxx</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button variant="primary" size="sm" onClick={() => setShowProfileModal(false)}>
            Close Profile
          </Button>
        </div>
      </Modal>

      {/* Account Settings Modal */}
      <Modal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="Super Admin Account & Security"
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Left: Security Info */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <FiShield className="w-4 h-4 text-[#123B66]" />
                Super Admin Security Posture
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Security settings, session idle timeout, and supervisory encryption parameters are governed centrally.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800 block">Idle Session Timeout</span>
                  <span className="text-[11px] text-slate-500">Automatically logout after 30 minutes</span>
                </div>
                <span className="font-mono font-bold text-xs text-[#123B66]">30m</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800 block">Audit Log Forwarding</span>
                  <span className="text-[11px] text-slate-500">Real-time syslog sync to SOC compliance lake</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                  ENABLED
                </span>
              </div>
            </div>
          </div>

          {/* Right: Permissions & Access */}
          <div className="space-y-4">
            <div className="space-y-2 bg-slate-50 rounded-xl border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-700 text-[11px] uppercase tracking-wide mb-2">Access Permissions</h4>
              {[
                { label: 'Platform Configuration', status: true },
                { label: 'User & Teacher Moderation', status: true },
                { label: 'Financial Reconciliation', status: true },
                { label: 'Audit Log Access', status: true },
                { label: 'API Gateway Management', status: true },
                { label: 'Data Export / GDPR', status: true },
              ].map((perm) => (
                <div key={perm.label} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <span className="text-slate-600">{perm.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    perm.status ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {perm.status ? 'GRANTED' : 'DENIED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setShowAccountModal(false);
              toast.success('Settings Up to Date', 'Account security posture confirmed.');
            }}
            leftIcon={<FiCheck className="w-3.5 h-3.5" />}
          >
            Confirm
          </Button>
        </div>
      </Modal>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out of Super Admin?"
        message="Your active administrative session will be terminated and you will need to re-authenticate."
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        variant="danger"
      />
    </>
  );
}

export default Header;
