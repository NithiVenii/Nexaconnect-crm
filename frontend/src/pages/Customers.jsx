import { useEffect, useState, useCallback } from 'react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdBusiness } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';

const emptyForm = { name: '', email: '', phone: '', company: '', city: '', country: '', status: 'active', source: 'website', notes: '' };

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', {
        params: { search, status: statusFilter, page, limit: 8 },
      });
      setCustomers(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({ ...emptyForm, ...customer });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/customers/${editing._id}`, form);
        toast.success('Customer updated');
      } else {
        await api.post('/customers', form);
        toast.success('Customer added');
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/customers/${deleteTarget._id}`);
      toast.success('Customer deleted');
      setDeleteTarget(null);
      fetchCustomers();
    } catch {
      toast.error('Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">
            {c.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">{c.name}</p>
            <p className="text-xs text-slate-400">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'company', header: 'Company', render: (c) => c.company || '—' },
    { key: 'phone', header: 'Phone', render: (c) => c.phone || '—' },
    { key: 'location', header: 'Location', render: (c) => [c.city, c.country].filter(Boolean).join(', ') || '—' },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    {
      key: 'actions',
      header: '',
      render: (c) => (
        <div className="flex gap-1.5">
          <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-white/10">
            <MdEdit size={17} />
          </button>
          <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
            <MdDelete size={17} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Customers</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your customer relationships in one place</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <MdAdd size={18} /> Add Customer
        </button>
      </div>

      <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            placeholder="Search by name, email, or company..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
        </div>
        <select className="input-field sm:w-44" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable columns={columns} data={customers} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No customers found — add your first one" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text">Full name *</label>
            <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Email *</label>
            <input required type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Phone</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Company</label>
            <div className="relative">
              <MdBusiness className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input className="input-field pl-9" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label-text">City</label>
            <input className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Country</label>
            <input className="input-field" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Status</label>
            <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="label-text">Source</label>
            <select className="input-field" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {['website', 'referral', 'social', 'ads', 'cold-call', 'other'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label-text">Notes</label>
            <textarea rows={3} className="input-field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Customer'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
};

export default Customers;
