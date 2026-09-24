import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiLink,
  FiBookOpen,
  FiFolder,
  FiSend,
  FiStar,
  FiCreditCard,
  FiBarChart2,
  FiShield,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiX,
} from 'react-icons/fi';
import { NAVIGATION_ITEMS } from '../../data/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Tooltip from '../ui/Tooltip';
import Avatar from '../ui/Avatar';
import tutorOnFullLogo from '../../assets/tutoron-full-logo.png';
import tutorOnIcon from '../../assets/tutoron-icon.png';

// Icon mapper for navigation config
const ICON_MAP = {
  FiGrid: FiGrid,
  FiUsers: FiUsers,
  FiUserCheck: FiUserCheck,
  FiLink: FiLink,
  FiBookOpen: FiBookOpen,
  FiFolder: FiFolder,
  FiSend: FiSend,
  FiStar: FiStar,
  FiCreditCard: FiCreditCard,
  FiBarChart2: FiBarChart2,
  FiAlertTriangle: FiAlertTriangle,
  FiShield: FiShield,
};

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) {
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToast();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePlaceholderClick = (e, item) => {
    if (!item.isImplemented) {
      e.preventDefault();
      toast.info(
        `${item.label} Module`,
        `This section is designated for ${item.badge || 'a future update'} and will be connected in subsequent phases.`
      );
    }
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none overflow-hidden">
      {/* Brand & Header */}
      <div className="h-16 border-b border-slate-200 flex items-center shrink-0 bg-white px-4.5 overflow-hidden">
        <NavLink
          to="/dashboard"
          className="relative flex items-center h-10 w-full overflow-hidden group focus:outline-none"
          title="TutorOn India Super Admin"
        >
          {/* Collapsed Emblem Icon (Active when sidebar is collapsed) */}
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center transition-all duration-300 ease-in-out ${
              isCollapsed
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-90 pointer-events-none'
            }`}
          >
            <img
              src={tutorOnIcon}
              alt="TutorOn Icon"
              className="w-8.5 h-8.5 object-contain rounded-md group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* Expanded Full Logo (Active when sidebar is expanded - Super Admin removed) */}
          <div
            className={`flex items-center transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
              isCollapsed
                ? 'opacity-0 max-w-0 pointer-events-none -translate-x-2'
                : 'opacity-100 max-w-[190px] translate-x-0'
            }`}
          >
            <img
              src={tutorOnFullLogo}
              alt="TutorOn India"
              className="h-8.5 object-contain object-left group-hover:opacity-90 transition-opacity duration-200"
            />
          </div>
        </NavLink>

        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0 ml-auto"
            aria-label="Close sidebar"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2.5 space-y-1 scrollbar-thin">
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono ${
            isCollapsed ? 'max-h-0 opacity-0 py-0 -translate-x-2' : 'max-h-6 opacity-100 px-2 py-1 translate-x-0'
          }`}
        >
          Platform Operations
        </div>

        {NAVIGATION_ITEMS.map((item) => {
          const IconComponent = ICON_MAP[item.icon] || FiGrid;
          const currentUrl = location.pathname;
          const currentFullUrl = location.pathname + location.search;

          const isActive =
            currentUrl === item.path ||
            (item.path !== '/dashboard' && currentUrl.startsWith(item.path.split('?')[0])) ||
            (item.children &&
              item.children.some(
                (c) =>
                  currentUrl === c.path.split('?')[0] ||
                  (c.path.includes('?') && currentFullUrl === c.path)
              ));
          const hasChildren = item.children && item.children.length > 0;
          const isSectionOpen =
            expandedSections[item.id] !== undefined ? expandedSections[item.id] : isActive;

          const linkElement = (
            <NavLink
              to={item.path}
              onClick={(e) => handlePlaceholderClick(e, item)}
              className={({ isActive: isLinkActive }) =>
                `group relative flex items-center h-10 w-full px-2.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer overflow-hidden ${
                  isActive || isLinkActive
                    ? 'bg-[#123B66]/10 text-[#0B1F3A] font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`
              }
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#123B66] rounded-r-md" />
              )}

              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <IconComponent
                  className={`w-4.5 h-4.5 transition-colors ${
                    isActive
                      ? 'text-[#123B66]'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
              </div>

              {/* Label, badge, chevron with smooth transition */}
              <div
                className={`flex-1 flex items-center justify-between min-w-0 ml-2.5 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                  isCollapsed
                    ? 'opacity-0 -translate-x-2 pointer-events-none w-0'
                    : 'opacity-100 translate-x-0 w-auto'
                }`}
              >
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono font-normal shrink-0 ml-1.5">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSection(item.id);
                    }}
                    className="p-1 -mr-1 hover:text-slate-900 shrink-0 ml-auto"
                  >
                    <FiChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isSectionOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
              </div>
            </NavLink>
          );

          return (
            <div key={item.id} className="space-y-0.5">
              {isCollapsed ? (
                <Tooltip content={item.label} position="right" delay={50}>
                  {linkElement}
                </Tooltip>
              ) : (
                linkElement
              )}

              {/* Nested submenu with smooth height & opacity transition */}
              {hasChildren && (
                <div
                  className={`pl-9 pr-2 space-y-0.5 border-l border-slate-100 ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                    !isCollapsed && isSectionOpen
                      ? 'max-h-48 opacity-100 py-0.5'
                      : 'max-h-0 opacity-0 py-0 pointer-events-none'
                  }`}
                >
                  {item.children.map((sub) => (
                    <NavLink
                      key={sub.id}
                      to={sub.path}
                      onClick={(e) => {
                        if (!item.isImplemented) {
                          e.preventDefault();
                          toast.info(
                            `${sub.label}`,
                            `This section will be activated in a subsequent update.`
                          );
                        } else if (isMobileOpen && onCloseMobile) {
                          onCloseMobile();
                        }
                      }}
                      className={({ isActive: isSubActive }) => {
                        const isQueryMatch = sub.path.includes('?') && currentFullUrl === sub.path;
                        const isSelected = isQueryMatch || (isSubActive && !sub.path.includes('?'));
                        return `block px-2 py-1.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                          isSelected
                            ? 'text-[#0B1F3A] font-semibold bg-[#123B66]/10'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`;
                      }}
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer: Super Admin Profile & Collapse Toggle */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center px-1.5 py-1 rounded-lg gap-2.5 overflow-hidden">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <Avatar
              name={user?.name || 'Sudhir Sharma'}
              size="sm"
              status="online"
            />
          </div>

          <div
            className={`min-w-0 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
              isCollapsed
                ? 'opacity-0 -translate-x-2 pointer-events-none w-0'
                : 'opacity-100 translate-x-0 w-[150px] flex-1'
            }`}
          >
            <p className="text-xs font-semibold text-slate-800 truncate leading-tight font-geist">
              {user?.name || 'Sudhir Sharma'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 truncate">
                Administrator
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-mono text-emerald-600 font-medium">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center h-9 w-full px-2 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer overflow-hidden gap-2.5"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <FiChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                isCollapsed ? 'rotate-180 text-blue-600' : 'text-slate-500'
              }`}
            />
          </div>
          <span
            className={`text-[11px] font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
              isCollapsed
                ? 'opacity-0 -translate-x-2 pointer-events-none w-0'
                : 'opacity-100 translate-x-0 w-auto'
            }`}
          >
            Collapse Sidebar
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sidebar (Fixed) */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-40 transition-[width] duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer (Overlay + Drawer) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-[270px] max-w-[80vw] h-full shadow-2xl z-10 animate-slide-in">
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
