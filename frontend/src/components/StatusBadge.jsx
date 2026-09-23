const statusStyles = {
  // Lead statuses
  New: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  Contacted: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  Qualified: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  Proposal: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  Won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Lost: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  // Customer statuses
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  inactive: 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  // Task statuses
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'in-progress': 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  // Priority
  low: 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>
);

export default StatusBadge;
