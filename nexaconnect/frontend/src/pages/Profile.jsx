import { useState } from 'react';
import { toast } from 'react-toastify';
import { MdSave, MdLock } from 'react-icons/md';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', designation: user?.designation || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPw(true);
    try {
      await api.put('/users/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your personal information</p>
      </div>

      <div className="glass-card flex items-center gap-4 p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xl font-bold text-white">
          {user?.name?.charAt(0)}
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{user?.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <span className="badge mt-1 bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300 capitalize">{user?.role}</span>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Personal Information</h3>
        <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text">Full name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Email (read-only)</label>
            <input className="input-field opacity-60" value={user?.email} disabled />
          </div>
          <div>
            <label className="label-text">Phone</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Designation</label>
            <input className="input-field" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary"><MdSave size={17} /> {saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label-text">Current password</label>
            <input type="password" required className="input-field" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="label-text">New password</label>
            <input type="password" required minLength={6} className="input-field" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Confirm new password</label>
            <input type="password" required className="input-field" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button type="submit" disabled={changingPw} className="btn-primary"><MdLock size={17} /> {changingPw ? 'Updating...' : 'Update Password'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
