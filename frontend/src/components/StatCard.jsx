const colorMap = {
  blue: 'from-primary-600 to-primary-500 shadow-primary-600/30',
  emerald: 'from-emerald-600 to-emerald-500 shadow-emerald-600/30',
  amber: 'from-amber-500 to-amber-400 shadow-amber-500/30',
  violet: 'from-violet-600 to-violet-500 shadow-violet-600/30',
};

const StatCard = ({ icon: Icon, label, value, color = 'blue', trend, loading }) => {
  return (
    <div className="glass-card p-5 animate-fadeIn hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          {loading ? (
            <div className="skeleton mt-2 h-8 w-24 rounded-lg" />
          ) : (
            <p className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">{value}</p>
          )}
          {trend !== undefined && !loading && (
            <p className={`mt-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% this month
            </p>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-lg`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
