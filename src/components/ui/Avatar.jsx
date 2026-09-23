import { useState } from 'react';
import { cn } from '../../utils/cn';

export function Avatar({
  name = 'User',
  src,
  size = 'md',
  status,
  shape = 'circle',
  className = '',
}) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9.5 h-9.5 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  const statusIndicatorSizes = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1.5',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
    xl: 'w-3.5 h-3.5 ring-2',
  };

  const statusColors = {
    online: 'bg-[#16A34A]',
    busy: 'bg-[#DC2626]',
    away: 'bg-[#D97706]',
    offline: 'bg-slate-400',
  };

  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)}>
      <div
        className={cn(
          'flex items-center justify-center font-semibold overflow-hidden border border-slate-200 shadow-2xs',
          'bg-[#123B66]/10 text-[#0B1F3A]',
          sizes[size] || sizes.md,
          rounded
        )}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-geist tracking-wide">{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-white',
            statusIndicatorSizes[size] || statusIndicatorSizes.md,
            statusColors[status] || statusColors.offline
          )}
          aria-label={status}
        />
      )}
    </div>
  );
}

export default Avatar;
