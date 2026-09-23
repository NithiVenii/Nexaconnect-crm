import { useEffect, useState, useCallback } from 'react';
import { MdAdd, MdEdit, MdDelete, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';

const emptyForm = { title: '', description: '', priority: 'medium', status: 'pending', dueDate: '' };

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks', { params: { status: statusFilter, page, limit: 8 } });
      setTasks(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (task) => {
    setEditing(task);
    setForm({ ...emptyForm, ...task, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/tasks/${editing._id}`, form);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', form);
        toast.success('Task created');
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      await api.put(`/tasks/${task._id}`, { status: nextStatus });
      fetchTasks();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tasks/${deleteTarget._id}`);
      toast.success('Task deleted');
      setDeleteTarget(null);
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'title', header: 'Task', render: (t) => (
      <div className="flex items-center gap-2.5">
        <button onClick={() => toggleComplete(t)} className="text-primary-600">
          {t.status === 'completed' ? <MdCheckCircle size={20} /> : <MdRadioButtonUnchecked size={20} className="text-slate-300 dark:text-slate-600" />}
        </button>
        <div>
          <p className={`font-semibold ${t.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>{t.title}</p>
          {t.description && <p className="max-w-xs truncate text-xs text-slate-400">{t.description}</p>}
        </div>
      </div>
    ) },
    { key: 'priority', header: 'Priority', render: (t) => <StatusBadge status={t.priority} /> },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'dueDate', header: 'Due Date', render: (t) => t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—' },
    { key: 'assignedTo', header: 'Assigned To', render: (t) => t.assignedTo?.name || 'Unassigned' },
    { key: 'actions', header: '', render: (t) => (
      <div className="flex gap-1.5">
        <button onClick={() => openEdit(t)} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-white/10"><MdEdit size={17} /></button>
        <button onClick={() => setDeleteTarget(t)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><MdDelete size={17} /></button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Tasks</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Stay on top of follow-ups and to-dos</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><MdAdd size={18} /> Add Task</button>
      </div>

      <div className="glass-card flex flex-wrap gap-2 p-3">
        {['', 'pending', 'in-progress', 'completed'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setPage(1); setStatusFilter(s); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={tasks} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No tasks found — create your first one" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Task' : 'Add Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Title *</label>
            <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea rows={3} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-text">Due date</label>
            <input type="date" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={`Delete task "${deleteTarget?.title}"?`} />
    </div>
  );
};

export default Tasks;
