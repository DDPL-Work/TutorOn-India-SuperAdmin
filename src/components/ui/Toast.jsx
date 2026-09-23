import { FiX } from 'react-icons/fi';

export function ToastItem({ title, message, type = 'info', onDismiss }) {
  const borderColors = {
    success: 'border-l-[#16A34A]',
    error: 'border-l-[#DC2626]',
    warning: 'border-l-[#D97706]',
    info: 'border-l-[#1D4ED8]',
  };

  return (
    <div
      className={`p-3.5 bg-white rounded-lg shadow-md border border-slate-200 border-l-4 flex items-start justify-between gap-3 ${
        borderColors[type] || borderColors.info
      }`}
    >
      <div>
        {title && <h5 className="text-sm font-semibold text-slate-900">{title}</h5>}
        {message && <p className="text-xs text-slate-600 mt-0.5">{message}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
          aria-label="Close"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default ToastItem;
