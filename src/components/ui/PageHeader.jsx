import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { cn } from '../../utils/cn';

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  backTo,
  breadcrumbs,
  className = '',
}) {
  const navigate = useNavigate();

  return (
    <div className={cn('mb-6 space-y-2.5', className)}>
      {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          {backTo && (
            <button
              type="button"
              onClick={() => (typeof backTo === 'string' ? navigate(backTo) : navigate(-1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-geist tracking-tight">
                {title}
              </h1>
              {badge}
            </div>

            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
