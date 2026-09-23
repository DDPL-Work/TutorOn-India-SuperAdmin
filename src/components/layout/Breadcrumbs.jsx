import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { NAVIGATION_ITEMS } from '../../data/navigation';

export function Breadcrumbs({ items, className = '' }) {
  const location = useLocation();

  // If explicit items provided, use them
  if (items && items.length > 0) {
    return (
      <nav aria-label="Breadcrumb" className={`flex items-center text-xs ${className}`}>
        <ol className="flex items-center flex-wrap gap-1.5 text-slate-500">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && <FiChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
                {isLast || !item.path ? (
                  <span className="font-semibold text-slate-800 tracking-tight">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="hover:text-[#123B66] hover:underline transition-colors font-medium text-slate-500"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Derive automatically from pathname
  const pathnames = location.pathname.split('/').filter(Boolean);

  const breadcrumbsList = [
    { label: 'Dashboard', path: '/dashboard' },
  ];

  if (pathnames.length > 0 && pathnames[0] !== 'dashboard') {
    let currentPath = '';
    pathnames.forEach((part, idx) => {
      currentPath += `/${part}`;
      // Find friendly name from navigation if available
      const navItem = NAVIGATION_ITEMS.find((n) => n.path === currentPath);
      let label = navItem ? navItem.label : null;
      if (!label) {
        if (part === 'announcements-promotions') label = 'Announcements & Promotions';
        else if (part === 'audit-logs') label = 'Audit Logs';
        else if (part === 'materials') label = 'Study Materials';
        else if (part === 'teacher-announcements') label = 'Teacher Announcements';
        else if (part === 'pending') label = 'Pending Verification';
        else if (part === 'verified') label = 'Verified Teachers';
        else if (part === 'banners') label = 'Promotional Banners';
        else if (part === 'create') label = 'Create Announcement';
        else if (part === 'announcements') label = 'All Announcements';
        else label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      }
      breadcrumbsList.push({ label, path: idx === pathnames.length - 1 ? null : currentPath });
    });
  }

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 text-slate-500">
        {breadcrumbsList.map((crumb, index) => {
          const isLast = index === breadcrumbsList.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && <FiChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
              {isLast || !crumb.path ? (
                <span className="font-semibold text-slate-800 tracking-tight">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-[#123B66] transition-colors font-medium text-slate-500 flex items-center gap-1"
                >
                  {index === 0 && <FiHome className="w-3 h-3" />}
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
