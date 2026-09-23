import { FiSearch, FiX } from 'react-icons/fi';
import { cn } from '../../utils/cn';

export function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search by name, ID, phone or email...',
  shortcut,
  className = '',
  size = 'md',
  disabled = false,
  autoFocus = false,
}) {
  const sizes = {
    sm: 'py-1.5 pl-8 pr-7 text-xs',
    md: 'py-2 pl-9 pr-8 text-sm',
    lg: 'py-2.5 pl-10 pr-9 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-2.5',
    md: 'w-4 h-4 left-3',
    lg: 'w-5 h-5 left-3.5',
  };

  return (
    <div className={cn('relative flex items-center w-full max-w-md', className)}>
      <div
        className={cn(
          'absolute text-slate-400 pointer-events-none flex items-center justify-center',
          iconSizes[size] || iconSizes.md
        )}
      >
        <FiSearch />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          'w-full bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]',
          'disabled:bg-slate-50 disabled:text-slate-400',
          sizes[size] || sizes.md
        )}
      />

      <div className="absolute right-2.5 flex items-center gap-1.5">
        {value && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        ) : shortcut ? (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            {shortcut}
          </kbd>
        ) : null}
      </div>
    </div>
  );
}

export default SearchBar;
