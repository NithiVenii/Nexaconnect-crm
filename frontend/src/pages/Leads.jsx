import { useEffect, useState, useCallback } from 'react';
import { MdAdd, MdSearch, MdEdit, MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
const emptyForm = { title: '', contactName: '', contactEmail: '', contactPhone: '', company: '', value: 0, status: 'New', priority: 'medium', notes: '' };

const Leads = () => {
  const [leads, setLeads] = useState([]);
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

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads', { params: { search, status: statusFilter, page, limit: 8 } });
      setLeads(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(fetchLeads, 300);
    return () => clearTimeout(t);
  }, [fetchLeads]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (lead) => { setEditing(lead); setForm({ ...emptyForm, ...lead }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/leads/${editing._id}`, form);
        toast.success('Lead updated');
      } else {
        await api.post('/leads', form);
        toast.success('Lead created');
      }
      setModalOpen(false);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/leads/${deleteTarget._id}`);
      toast.success('Lead deleted');
      setDeleteTarget(null);
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'title', header: 'Lead', render: (l) => (
      <div>
        <p className="font-semibold text-slate-800 dark:text-white">{l.title}</p>
        <p className="text-xs text-slate-400">{l.contactName}{l.company ? ` · ${l.company}` : ''}</p>
      </div>
    ) },
    { key: 'value', header: 'Value', render: (l) => `$${Number(l.value || 0).toLocaleString()}` },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    { key: 'priority', header: 'Priority', render: (l) => <StatusBadge status={l.priority} /> },
    { key: 'assignedTo', header: 'Assigned To', render: (l) => l.assignedTo?.name || 'Unassigned' },
    { key: 'actions', header: '', render: (l) => (
      <div className="flex gap-1.5">
        <button onClick={() => openEdit(l)} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-white/10"><MdEdit size={17} /></button>
        <button onClick={() => setDeleteTarget(l)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><MdDelete size={17} /></button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Leads</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track and convert opportunities through your pipeline</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><MdAdd size={18} /> Add Lead</button>
      </div>

      <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input placeholder="Search leads by title, contact, or company..." className="input-field pl-10" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
        </div>
        <select className="input-field sm:w-44" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={leads} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No leads found — add your first one" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Lead' : 'Add Lead'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label-text">Lead title *</label>
            <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Contact name *</label>
            <input required className="input-field" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Company</label>
            <input className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Contact email</label>
            <input type="email" className="input-field" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Contact phone</label>
            <input className="input-field" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Deal value ($)</label>
            <input type="number" min="0" className="input-field" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Priority</label>
            <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="label-text">Status</label>
            <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label-text">Notes</label>
            <textarea rows={3} className="input-field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Lead'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={`Delete lead "${deleteTarget?.title}"?`} />
    </div>
  );
};

export default Leads;
