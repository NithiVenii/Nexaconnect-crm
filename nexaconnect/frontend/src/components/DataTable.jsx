import { MdChevronLeft, MdChevronRight, MdInbox } from 'react-icons/md';

/**
 * columns: [{ key, header, render?(row) }]
 * pagination: { page, pages, total, limit } + onPageChange(page)
 */
const DataTable = ({ columns, data, loading, pagination, onPageChange, emptyMessage = 'No records found' }) => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="table-container">
        <table className="min-w-full divide-y divide-slate-200/70 dark:divide-white/10">
          <thead className="bg-slate-50/60 dark:bg-white/[0.03]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/70 dark:divide-white/5">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3.5">
                      <div className="skeleton h-4 w-full max-w-[140px] rounded" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-slate-400">
                  <MdInbox size={32} className="mx-auto mb-2 opacity-60" />
                  <p className="text-sm">{emptyMessage}</p>
                </td>
              </tr>
            )}

            {!loading &&
              data.map((row, idx) => (
                <tr key={row._id || idx} className="transition-colors hover:bg-primary-50/50 dark:hover:bg-white/[0.04] animate-fadeIn">
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-700 dark:text-slate-200">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-white/40 dark:border-white/10 px-4 py-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page {pagination.page} of {pagination.pages} · {pagination.total} total
          </p>
          <div className="flex gap-1.5">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/10"
            >
              <MdChevronLeft size={18} />
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/10"
            >
              <MdChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
