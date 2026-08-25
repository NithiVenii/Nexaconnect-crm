import { useState } from 'react';
import { MdMenu, MdLightMode, MdDarkMode, MdLogout, MdNotifications } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customer Management',
  '/leads': 'Lead Management',
  '/pipeline': 'Sales Pipeline',
  '/tasks': 'Task & Activity Management',
  '/reports': 'Reports & Analytics',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const title = pageTitles[window.location.pathname] || 'NexaConnect';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden">
          <MdMenu size={22} />
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-600 dark:text-amber-300 transition-transform hover:-translate-y-0.5"
          title="Toggle theme"
        >
          {theme === 'light' ? <MdDarkMode size={19} /> : <MdLightMode size={19} />}
        </button>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 transition-transform hover:-translate-y-0.5">
          <MdNotifications size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        <div className="relative">
          <button onClick={() => setShowMenu((s) => !s)} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-2 py-1.5 pr-3 transition-transform hover:-translate-y-0.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-100 sm:block">{user?.name?.split(' ')[0]}</span>
          </button>

          {showMenu && (
            <div className="glass-card absolute right-0 mt-2 w-44 overflow-hidden p-1.5 animate-fadeIn">
              <button
                onClick={() => { setShowMenu(false); navigate('/profile'); }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-white/10"
              >
                My Profile
              </button>
              <button
                onClick={() => { setShowMenu(false); navigate('/settings'); }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-white/10"
              >
                Settings
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <MdLogout size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
