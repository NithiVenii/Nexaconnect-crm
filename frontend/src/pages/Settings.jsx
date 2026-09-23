import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifPrefs, setNotifPrefs] = useState(user?.notificationPrefs || { email: true, inApp: true });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    api.get('/users')
      .then(({ data }) => setUsers(data.data))
      .catch(() => toast.error('Failed to load team members'))
      .finally(() => setLoadingUsers(false));
  }, [isAdmin]);

  const saveNotifPrefs = async (updated) => {
    setNotifPrefs(updated);
    try {
      await api.put('/users/settings', { notificationPrefs: updated });
      toast.success('Notification preferences updated');
    } catch {
      toast.error('Failed to update preferences');
    }
  };

  const toggleUserStatus = async (u) => {
    try {
      const { data } = await api.put(`/users/${u._id}/status`);
      setUsers((prev) => prev.map((x) => (x._id === u._id ? data.user : x)));
      toast.success(`${u.name} ${data.user.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const changeRole = async (u, role) => {
    try {
      const { data } = await api.put(`/users/${u._id}/role`, { role });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? data.user : x)));
      toast.success(`${u.name}'s role updated to ${role}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const userColumns = [
    { key: 'name', header: 'Name', render: (u) => (
      <div>
        <p className="font-semibold text-slate-800 dark:text-white">{u.name}</p>
        <p className="text-xs text-slate-400">{u.email}</p>
      </div>
    ) },
    { key: 'role', header: 'Role', render: (u) => (
      <select disabled={u._id === user?._id} value={u.role} onChange={(e) => changeRole(u, e.target.value)} className="input-field !py-1.5 !text-xs w-32">
        <option value="admin">Admin</option>
        <option value="employee">Employee</option>
      </select>
    ) },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.isActive ? 'active' : 'inactive'} /> },
    { key: 'actions', header: '', render: (u) => (
      <button disabled={u._id === user?._id} onClick={() => toggleUserStatus(u)} className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-40">
        {u.isActive ? 'Deactivate' : 'Activate'}
      </button>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Customize your NexaConnect experience</p>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Appearance</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-1 items-center gap-2 rounded-xl border-2 p-4 transition-colors ${theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-white/5' : 'border-slate-200 dark:border-white/10'}`}
          >
            <MdLightMode size={20} className="text-amber-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Light Mode</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-1 items-center gap-2 rounded-xl border-2 p-4 transition-colors ${theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-white/5' : 'border-slate-200 dark:border-white/10'}`}
          >
            <MdDarkMode size={20} className="text-indigo-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dark Mode</span>
          </button>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 p-3.5">
            <span className="text-sm text-slate-700 dark:text-slate-200">Email notifications</span>
            <input type="checkbox" checked={notifPrefs.email} onChange={(e) => saveNotifPrefs({ ...notifPrefs, email: e.target.checked })} className="h-5 w-5 accent-primary-600" />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 p-3.5">
            <span className="text-sm text-slate-700 dark:text-slate-200">In-app notifications</span>
            <input type="checkbox" checked={notifPrefs.inApp} onChange={(e) => saveNotifPrefs({ ...notifPrefs, inApp: e.target.checked })} className="h-5 w-5 accent-primary-600" />
          </label>
        </div>
      </div>

      {isAdmin && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Team Management (Admin)</h3>
          <DataTable columns={userColumns} data={users} loading={loadingUsers} emptyMessage="No team members found" />
        </div>
      )}
    </div>
  );
};

export default Settings;
