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
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand & Header */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0 bg-white">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg bg-[#0B1F3A] text-white flex items-center justify-center font-geist font-bold text-base shadow-xs shrink-0">
            T
          </div>

          {!isCollapsed && (
            <div className="flex flex-col truncate animate-fade-in">
              <span className="font-geist font-bold text-sm tracking-tight text-slate-900 leading-tight">
                TutorOn <span className="text-[#1D4ED8] font-semibold text-xs">INDIA</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                Super Admin
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Close sidebar"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-1 scrollbar-thin">
        {!isCollapsed && (
          <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Platform Operations
          </div>
        )}

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
                `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive || isLinkActive
                    ? 'bg-[#123B66]/10 text-[#0B1F3A] font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#123B66] rounded-r-md" />
              )}

              <IconComponent
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-[#123B66]'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono font-normal">
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
                      className="p-1 -mr-1 hover:text-slate-900"
                    >
                      <FiChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSectionOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
              )}
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

              {/* Nested submenu (for expanded sidebar) */}
              {!isCollapsed && hasChildren && isSectionOpen && (
                <div className="pl-9 pr-2 py-0.5 space-y-0.5 border-l border-slate-100 ml-4">
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
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex flex-col gap-2">
        <div
          className={`flex items-center gap-2.5 p-1 rounded-lg ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <Avatar
            name={user?.name || 'Sudhir Sharma'}
            size={isCollapsed ? 'sm' : 'md'}
            status="online"
          />

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
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
          )}
        </div>

        {/* Desktop Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`hidden lg:flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer w-full ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <FiChevronRight className="w-4 h-4" />
          ) : (
            <>
              <FiChevronLeft className="w-4 h-4" />
              <span className="text-[11px] font-medium">Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sidebar (Fixed) */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-40 transition-all duration-200 ease-in-out ${
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
