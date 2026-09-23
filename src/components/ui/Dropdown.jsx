import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export function Dropdown({
  trigger,
  children,
  items = [],
  align = 'right',
  width = 'w-56',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={toggle} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-scale-in origin-top',
            align === 'right' ? 'right-0' : 'left-0',
            width,
            className
          )}
        >
          {items.length > 0
            ? items.map((item, idx) => {
                if (item.divider) {
                  return <div key={idx} className="h-px bg-slate-100 my-1" />;
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setIsOpen(false);
                    }}
                    disabled={item.disabled}
                    className={cn(
                      'w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors cursor-pointer',
                      item.danger
                        ? 'text-[#DC2626] hover:bg-red-50 hover:text-red-700'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                      item.disabled ? 'opacity-40 cursor-not-allowed' : ''
                    )}
                  >
                    {item.icon && <span className="text-sm shrink-0">{item.icon}</span>}
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })
            : typeof children === 'function'
            ? children(() => setIsOpen(false))
            : children}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
