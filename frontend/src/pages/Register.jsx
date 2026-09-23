import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdPerson, MdEmail, MdLock } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fadeIn">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-600/30">
            <HiSparkles size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            The first account created becomes the workspace Admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Full name</label>
            <div className="relative">
              <MdPerson className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input required placeholder="Jane Doe" className="input-field pl-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label-text">Email address</label>
            <div className="relative">
              <MdEmail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" required placeholder="you@company.com" className="input-field pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label-text">Password</label>
            <div className="relative">
              <MdLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" required minLength={6} placeholder="At least 6 characters" className="input-field pl-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label-text">Confirm password</label>
            <div className="relative">
              <MdLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" required placeholder="Re-enter password" className="input-field pl-10" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
