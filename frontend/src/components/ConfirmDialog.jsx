import Modal from './Modal';
import { MdWarningAmber } from 'react-icons/md';

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Are you sure?', message, loading }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
        <MdWarningAmber size={22} />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{message || 'This action cannot be undone.'}</p>
    </div>
    <div className="mt-6 flex justify-end gap-2">
      <button className="btn-secondary" onClick={onClose}>Cancel</button>
      <button className="btn-danger" onClick={onConfirm} disabled={loading}>
        {loading ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
