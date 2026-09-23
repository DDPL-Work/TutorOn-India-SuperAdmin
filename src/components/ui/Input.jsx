import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    id,
    type = 'text',
    leftIcon,
    rightIcon,
    className = '',
    containerClassName = '',
    required = false,
    disabled = false,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full px-3.5 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400 transition-all duration-150',
            'focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            error
              ? 'border-danger focus:ring-danger/20 focus:border-danger'
              : 'border-slate-300 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]',
            leftIcon ? 'pl-9' : '',
            rightIcon ? 'pr-9' : '',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-danger mt-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
