import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { cn } from '../../utils/cn';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'xl',
  maxWidth = null,
  showCloseButton = true,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // maxWidth prop takes priority (legacy compat); size is the standard way
  const sizes = {
    sm: 'max-w-xl',
    md: 'max-w-3xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
  };
  const widthClass = maxWidth || sizes[size] || sizes.xl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative w-full bg-white rounded-xl shadow-2xl border border-slate-200 z-10 overflow-hidden animate-scale-in',
          widthClass
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
            <div>
              {title && (
                <h3
                  id="modal-title"
                  className="text-base font-semibold text-slate-900 font-geist leading-tight"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-1.5 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
