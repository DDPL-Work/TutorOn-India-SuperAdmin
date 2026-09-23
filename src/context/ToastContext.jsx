import { useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import { ToastContext } from './toast-context';

export { ToastContext };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    show: showToast,
    success: (title, message, duration) => showToast({ title, message, type: 'success', duration }),
    error: (title, message, duration) => showToast({ title, message, type: 'error', duration }),
    warning: (title, message, duration) => showToast({ title, message, type: 'warning', duration }),
    info: (title, message, duration) => showToast({ title, message, type: 'info', duration }),
    dismiss: removeToast,
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-success shrink-0" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-danger shrink-0" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-warning shrink-0" />;
      default:
        return <FiInfo className="w-5 h-5 text-info shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-success';
      case 'error':
        return 'border-l-danger';
      case 'warning':
        return 'border-l-warning';
      default:
        return 'border-l-[#123B66]';
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notifications Viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-white rounded-lg shadow-lg border border-slate-200 border-l-4 ${getBorderColor(
              item.type
            )} animate-slide-up transition-all`}
          >
            {getToastIcon(item.type)}
            <div className="flex-1 min-w-0 pr-2">
              {item.title && (
                <p className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</p>
              )}
              {item.message && (
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1 rounded hover:bg-slate-100 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
