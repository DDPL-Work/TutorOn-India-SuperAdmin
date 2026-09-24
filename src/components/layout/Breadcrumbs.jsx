import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { NAVIGATION_ITEMS } from '../../data/navigation';

export function Breadcrumbs({ items, className = '' }) {
  const location = useLocation();

  // Derive automatically from pathname or use explicit items
  const pathnames = location.pathname.split('/').filter(Boolean);

  const breadcrumbsList =
    items && items.length > 0
      ? items
      : (() => {
          const list = [{ label: 'Dashboard', path: '/dashboard' }];
          if (pathnames.length > 0 && pathnames[0] !== 'dashboard') {
            let currentPath = '';
            pathnames.forEach((part, idx) => {
              currentPath += `/${part}`;
              const navItem = NAVIGATION_ITEMS.find((n) => n.path === currentPath);
              let label = navItem ? navItem.label : null;
              if (!label) {
                if (part === 'announcements-promotions') label = 'Announcements';
                else if (part === 'audit-logs') label = 'Audit Logs';
                else if (part === 'materials') label = 'Study Materials';
                else if (part === 'teacher-announcements') label = 'Teacher Announcements';
                else if (part === 'pending') label = 'Pending';
                else if (part === 'verified') label = 'Verified';
                else if (part === 'banners') label = 'Promotional Banners';
                else if (part === 'create') label = 'Create';
                else if (part === 'announcements') label = 'All Announcements';
                else if (part.toUpperCase().startsWith('AUD-') || part.toUpperCase().startsWith('AUD')) {
                  label = part.toUpperCase();
                } else if (part.toUpperCase().startsWith('TXN-') || part.toUpperCase().startsWith('REP-') || part.toUpperCase().startsWith('CON-')) {
                  label = part.toUpperCase();
                } else {
                  label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
                }
              }
              list.push({ label, path: idx === pathnames.length - 1 ? null : currentPath });
            });
          }
          return list;
        })();

  const activeCrumb = breadcrumbsList[breadcrumbsList.length - 1];

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs min-w-0 overflow-hidden ${className}`}>
      {/* Mobile view (< sm): Crisp, single-line current title */}
      <div className="flex sm:hidden items-center gap-1 min-w-0">
        {breadcrumbsList.length > 1 && (
          <span className="text-slate-400 text-[11px] shrink-0 font-medium">/</span>
        )}
        <span className="font-bold text-slate-800 tracking-tight truncate max-w-[130px] text-xs">
          {activeCrumb.label}
        </span>
      </div>

      {/* Tablet / Desktop view (sm+): Full rich breadcrumb trail */}
      <ol className="hidden sm:flex items-center flex-nowrap whitespace-nowrap gap-1.5 text-slate-500 min-w-0 overflow-hidden">
        {breadcrumbsList.map((crumb, index) => {
          const isLast = index === breadcrumbsList.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center gap-1.5 shrink-0 min-w-0">
              {index > 0 && <FiChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
              {isLast || !crumb.path ? (
                <span className="font-semibold text-slate-800 tracking-tight truncate max-w-[170px] lg:max-w-xs">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-[#123B66] transition-colors font-medium text-slate-500 flex items-center gap-1 hover:underline shrink-0"
                >
                  {isFirst && <FiHome className="w-3 h-3 shrink-0" />}
                  <span>{crumb.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
