import { FiFilter, FiRotateCcw } from 'react-icons/fi';
import Button from './Button';
import { cn } from '../../utils/cn';

export function FilterBar({
  children,
  onReset,
  isFiltered = false,
  activeFilterCount = 0,
  className = '',
}) {
  return (
    <div
      className={cn(
        'p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs mb-4 flex flex-wrap items-center justify-between gap-3',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
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
  );
}

export default FilterBar;
