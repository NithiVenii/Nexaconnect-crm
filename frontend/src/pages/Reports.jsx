import { useEffect, useState, useRef } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js';
import { MdPictureAsPdf, MdOutlineTableChart } from 'react-icons/md';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../api/axios';
import Loader from '../components/Loader';

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const monthLabel = ({ year, month }) => new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' });

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, c] = await Promise.all([api.get('/dashboard/summary'), api.get('/dashboard/charts')]);
        setSummary(s.data.data);
        setCharts(c.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !charts) return <Loader label="Building your reports..." />;

  const revenueData = {
    labels: charts.revenueByMonth.map((r) => monthLabel(r._id)),
    datasets: [{ label: 'Revenue ($)', data: charts.revenueByMonth.map((r) => r.total), backgroundColor: '#2f7dfa', borderRadius: 8, maxBarThickness: 44 }],
  };

  const customerGrowthData = {
    labels: charts.customersByMonth.map((c) => monthLabel(c._id)),
    datasets: [{ label: 'New Customers', data: charts.customersByMonth.map((c) => c.count), borderColor: '#1a5eef', backgroundColor: 'rgba(47,125,250,0.15)', tension: 0.4, fill: true, pointRadius: 4 }],
  };

  const leadsPieData = {
    labels: charts.leadsByStatus.map((l) => l._id),
    datasets: [{ data: charts.leadsByStatus.map((l) => l.count), backgroundColor: ['#5aa1ff', '#f59e0b', '#8b5cf6', '#6366f1', '#10b981', '#f43f5e'], borderWidth: 0 }],
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('NexaConnect - CRM Report', 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [['Metric', 'Value']],
      body: [
        ['Total Customers', summary?.totalCustomers],
        ['Active Leads', summary?.activeLeads],
        ['Sales Revenue', `$${Number(summary?.salesRevenue || 0).toLocaleString()}`],
        ['Completed Tasks', `${summary?.completedTasks}/${summary?.totalTasks}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [47, 125, 250] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Lead Status', 'Count']],
      body: charts.leadsByStatus.map((l) => [l._id, l.count]),
      theme: 'striped',
      headStyles: { fillColor: [47, 125, 250] },
    });

    doc.save('nexaconnect-report.pdf');
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.json_to_sheet([
      { Metric: 'Total Customers', Value: summary?.totalCustomers },
      { Metric: 'Active Leads', Value: summary?.activeLeads },
      { Metric: 'Sales Revenue', Value: summary?.salesRevenue },
      { Metric: 'Completed Tasks', Value: summary?.completedTasks },
      { Metric: 'Total Tasks', Value: summary?.totalTasks },
    ]);
    const leadsSheet = XLSX.utils.json_to_sheet(charts.leadsByStatus.map((l) => ({ Status: l._id, Count: l.count })));
    const revenueSheet = XLSX.utils.json_to_sheet(charts.revenueByMonth.map((r) => ({ Month: monthLabel(r._id), Revenue: r.total })));

    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(wb, leadsSheet, 'Leads by Status');
    XLSX.utils.book_append_sheet(wb, revenueSheet, 'Revenue by Month');
    XLSX.writeFile(wb, 'nexaconnect-report.xlsx');
  };

  return (
    <div className="space-y-5" ref={reportRef}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Reports &amp; Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Visualize performance and export for offline sharing</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="btn-secondary"><MdPictureAsPdf size={17} /> Export PDF</button>
          <button onClick={exportExcel} className="btn-secondary"><MdOutlineTableChart size={17} /> Export Excel</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Revenue by Month (Bar)</h3>
          <div className="h-72"><Bar data={revenueData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
        </div>
        <div className="glass-card p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Leads by Status (Pie)</h3>
          <div className="h-72"><Pie data={leadsPieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>
        </div>
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Customer Growth (Line)</h3>
          <div className="h-72"><Line data={customerGrowthData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
