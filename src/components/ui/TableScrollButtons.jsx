import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '../../utils/cn';

export function TableScrollButtons({
  targetRef,
  onScrollLeft,
  onScrollRight,
  scrollDistance = 280,
  className = '',
}) {
  const handleScroll = (direction) => {
    if (direction === 'left') {
      if (onScrollLeft) {
        onScrollLeft();
      } else if (targetRef?.current) {
        targetRef.current.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
      }
    } else {
      if (onScrollRight) {
        onScrollRight();
      } else if (targetRef?.current) {
        targetRef.current.scrollBy({ left: scrollDistance, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={cn('flex items-center gap-1 shrink-0', className)}>
      <button
        type="button"
        onClick={() => handleScroll('left')}
        className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
        title="Scroll List Left"
        aria-label="Scroll List Left"
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => handleScroll('right')}
        className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
        title="Scroll List Right"
        aria-label="Scroll List Right"
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default TableScrollButtons;
