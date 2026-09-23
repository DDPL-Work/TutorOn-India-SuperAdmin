import { cn } from '../../utils/cn';

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}) {
  const baseClasses = 'animate-pulse bg-slate-200/80';

  const variantClasses = {
    text: 'h-3.5 w-full rounded',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-lg w-full',
    card: 'rounded-xl border border-slate-200 p-5 w-full',
  };

  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
      className={cn(
        baseClasses,
        variantClasses[variant] || variantClasses.text,
        className
      )}
    />
  ));

  return count === 1 ? elements[0] : <div className="space-y-2">{elements}</div>;
}

export default Skeleton;
