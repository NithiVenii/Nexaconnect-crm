const Loader = ({ fullScreen = false, size = 'md', label }) => {
  const sizes = { sm: 'h-5 w-5 border-2', md: 'h-9 w-9 border-[3px]', lg: 'h-14 w-14 border-4' };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-primary-200 border-t-primary-600 dark:border-white/10 dark:border-t-primary-400`}
      />
      {label && <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulseSoft">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {spinner}
      </div>
    );
  }
  return spinner;
};

export default Loader;
