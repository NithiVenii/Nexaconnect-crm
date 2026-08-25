import { useEffect, useState } from 'react';
import { MdPeople, MdOutlineFilterAlt, MdAttachMoney, MdTaskAlt } from 'react-icons/md';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const currency = (n) => `$${Number(n || 0).toLocaleString()}`;

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, c, a] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/charts'),
          api.get('/dashboard/recent-activity'),
        ]);
        setSummary(s.data.data);
        setCharts(c.data.data);
        setActivity(a.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const leadStatusData = {
    labels: charts?.leadsByStatus.map((l) => l._id) || [],
    datasets: [
      {
        data: charts?.leadsByStatus.map((l) => l.count) || [],
        backgroundColor: ['#5aa1ff', '#f59e0b', '#8b5cf6', '#6366f1', '#10b981', '#f43f5e'],
        borderWidth: 0,
      },
    ],
  };

  const taskStatusData = {
    labels: charts?.tasksByStatus.map((t) => t._id) || [],
    datasets: [
      {
        label: 'Tasks',
        data: charts?.tasksByStatus.map((t) => t.count) || [],
        backgroundColor: '#2f7dfa',
        borderRadius: 8,
        maxBarThickness: 40,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Here's what's happening with your customers today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={MdPeople} label="Total Customers" value={summary?.totalCustomers ?? 0} color="blue" loading={loading} />
        <StatCard icon={MdOutlineFilterAlt} label="Active Leads" value={summary?.activeLeads ?? 0} color="violet" loading={loading} />
        <StatCard icon={MdAttachMoney} label="Sales Revenue" value={currency(summary?.salesRevenue)} color="emerald" loading={loading} />
        <StatCard icon={MdTaskAlt} label="Completed Tasks" value={`${summary?.completedTasks ?? 0} / ${summary?.totalTasks ?? 0}`} color="amber" loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Tasks by Status</h3>
          <div className="h-64">
            {!loading && <Bar data={taskStatusData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Leads by Status</h3>
          <div className="h-64">
            {!loading && <Pie data={leadStatusData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Recent Activity</h3>
        <div className="space-y-3">
          {activity.length === 0 && !loading && <p className="text-sm text-slate-400">No recent activity yet.</p>}
          {activity.map((a) => (
            <div key={a._id} className="flex items-start gap-3 border-b border-slate-100/70 dark:border-white/5 pb-3 last:border-0 last:pb-0">
              <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-200">{a.message}</p>
                <p className="text-xs text-slate-400">
                  {a.performedBy?.name} · {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
