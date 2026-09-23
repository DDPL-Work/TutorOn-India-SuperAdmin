import { FiInbox } from 'react-icons/fi';
import { cn } from '../../utils/cn';

export function EmptyState({
  icon,
  title = 'No records found',
  description = 'There are currently no items matching your criteria in this view.',
  action,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center bg-white border border-slate-200 rounded-xl',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
        {icon || <FiInbox className="w-6 h-6 stroke-1.5" />}
      </div>

      <h4 className="text-sm font-semibold text-slate-800 font-geist">
        {title}
      </h4>

      {description && (
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-4.5">{action}</div>}
    </div>
  );
}

export default EmptyState;
