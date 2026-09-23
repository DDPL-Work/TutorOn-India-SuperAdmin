import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Responsive check for tablet auto-collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter flex flex-col">
      {/* Sidebar (Desktop fixed + Mobile drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ease-in-out ${
          isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        }`}
      >
        {/* Sticky Header */}
        <Header
          onMobileMenuToggle={() => setIsMobileOpen(true)}
          isSidebarCollapsed={isCollapsed}
        />

        {/* Page Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Global Admin Footer */}
        <footer className="py-4 px-6 border-t border-slate-200/80 text-center text-xs text-slate-500 bg-white/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>
              &copy; {new Date().getFullYear()} TutorOn India. Super Admin Operational Control.
            </span>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
              <span>Environment: Staging-Secured</span>
              <span>Encrypted Session</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AdminLayout;
