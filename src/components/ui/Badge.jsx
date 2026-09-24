import { cn } from '../../utils/cn';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    navy: 'bg-[#123B66]/10 text-[#123B66] border border-[#123B66]/20 font-medium',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    slate: 'bg-slate-100 text-slate-600 border border-slate-200',
  };

  const dotColors = {
    default: 'bg-slate-400',
    navy: 'bg-[#123B66]',
    success: 'bg-[#16A34A]',
    warning: 'bg-[#D97706]',
    danger: 'bg-[#DC2626]',
    info: 'bg-[#2563EB]',
    slate: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full leading-none select-none whitespace-nowrap',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant] || 'bg-slate-400'
          )}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
