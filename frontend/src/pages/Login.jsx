import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setForm(
      role === 'admin'
        ? { email: 'admin@nexaconnect.com', password: 'Admin@123' }
        : { email: 'employee@nexaconnect.com', password: 'Employee@123' }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl" />
      </div>

      <div className="glass-card relative w-full max-w-md p-8 animate-fadeIn">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-600/30">
            <HiSparkles size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Welcome to NexaConnect</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to manage your customers &amp; sales pipeline</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Email address</label>
            <div className="relative">
              <MdEmail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                placeholder="you@company.com"
                className="input-field pl-10"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Password</label>
            <div className="relative">
              <MdLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="input-field pl-10 pr-10"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          Quick demo access
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => fillDemo('admin')} className="btn-secondary text-xs py-2">Admin demo</button>
          <button onClick={() => fillDemo('employee')} className="btn-secondary text-xs py-2">Employee demo</button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
