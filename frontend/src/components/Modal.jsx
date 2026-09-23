import { MdClose } from 'react-icons/md';

const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className={`glass-card relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto p-6 animate-fadeIn`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
            <MdClose size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
