import { cn } from '../../utils/cn';
import Skeleton from './Skeleton';

export function DataTable({
  columns = [],
  data = [],
  className = '',
  onRowClick = null,
  isLoading = false,
  loadingRows = 5,
  emptyState = null,
}) {
  return (
    <div className={cn('overflow-x-auto w-full', className)}>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={cn('py-3 px-4 select-none whitespace-nowrap', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: loadingRows }).map((_, rIdx) => (
              <tr key={`loading-row-${rIdx}`} className="animate-pulse">
                {columns.map((col, cIdx) => (
                  <td key={`loading-cell-${cIdx}`} className="py-3.5 px-4">
                    <Skeleton
                      variant="text"
                      className={cn(
                        'h-3.5 bg-slate-200/70 rounded',
                        cIdx === 0 ? 'w-24' : cIdx === 1 ? 'w-36' : 'w-20'
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'hover:bg-slate-50/80 transition-colors group',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={cn('py-3.5 px-4 text-slate-700 align-middle', col.className)}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : emptyState ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center">
                {emptyState}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
