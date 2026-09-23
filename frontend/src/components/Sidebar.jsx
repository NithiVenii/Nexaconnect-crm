import { NavLink } from 'react-router-dom';
import {
  MdDashboard, MdPeople, MdOutlineFilterAlt, MdViewKanban,
  MdChecklist, MdBarChart, MdPerson, MdSettings, MdClose,
} from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: MdDashboard },
  { to: '/customers', label: 'Customers', icon: MdPeople },
  { to: '/leads', label: 'Leads', icon: MdOutlineFilterAlt },
  { to: '/pipeline', label: 'Sales Pipeline', icon: MdViewKanban },
  { to: '/tasks', label: 'Tasks', icon: MdChecklist },
  { to: '/reports', label: 'Reports', icon: MdBarChart },
  { to: '/profile', label: 'Profile', icon: MdPerson },
  { to: '/settings', label: 'Settings', icon: MdSettings },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed z-40 flex h-full w-64 flex-col gap-1 border-r border-white/40 dark:border-white/10
        bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl p-4 transition-transform duration-300 lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-600/30">
              <HiSparkles size={18} />
            </div>
            <div>
              <p className="text-base font-extrabold leading-tight text-slate-800 dark:text-white">NexaConnect</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-primary-500">CRM Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden">
            <MdClose size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="glass-panel mt-2 flex items-center gap-3 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-100">{user?.name}</p>
            <p className="truncate text-xs capitalize text-primary-600 dark:text-primary-300">{user?.role}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
