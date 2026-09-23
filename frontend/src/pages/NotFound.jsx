import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 text-center">
    <p className="text-7xl font-extrabold text-primary-500">404</p>
    <h1 className="text-xl font-bold text-slate-800 dark:text-white">Page not found</h1>
    <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist or was moved.</p>
    <Link to="/dashboard" className="btn-primary mt-2">Back to Dashboard</Link>
  </div>
);

export default NotFound;
