import { FiFilter, FiRotateCcw } from 'react-icons/fi';
import Button from './Button';
import { cn } from '../../utils/cn';

export function FilterBar({
  children,
  actions,
  onReset,
  isFiltered = false,
  activeFilterCount = 0,
  className = '',
}) {
  return (
    <div
      className={cn(
        'p-3 bg-white border border-slate-200 rounded-xl shadow-xs mb-4 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap',
        className
      )}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
          <FiFilter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4.5 h-4.5 rounded-full bg-[#123B66] text-white text-[10px] flex items-center justify-center font-mono">
              {activeFilterCount}
            </span>
          )}
        </div>

        {children}
      </div>

      {(actions || (isFiltered && onReset)) && (
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {actions}
          {isFiltered && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              leftIcon={<FiRotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default FilterBar;
