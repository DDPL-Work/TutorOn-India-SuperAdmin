import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    id,
    options = [],
    placeholder,
    className = '',
    containerClassName = '',
    required = false,
    disabled = false,
    children,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full px-3.5 py-2 text-sm bg-white border rounded-lg text-slate-900 transition-all duration-150 appearance-none pr-9 cursor-pointer',
            'focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            error
              ? 'border-danger focus:ring-danger/20 focus:border-danger'
              : 'border-slate-300 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children
            ? children
            : options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
        </select>

        <div className="absolute right-3 pointer-events-none text-slate-400 flex items-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-danger mt-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
