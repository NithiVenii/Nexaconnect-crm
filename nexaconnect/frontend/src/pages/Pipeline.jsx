import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
const columnAccent = {
  New: 'border-t-sky-400',
  Contacted: 'border-t-amber-400',
  Qualified: 'border-t-violet-400',
  Proposal: 'border-t-indigo-400',
  Won: 'border-t-emerald-400',
  Lost: 'border-t-rose-400',
};

const Pipeline = () => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads/pipeline');
      setBoard(data.data);
    } catch {
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoard(); }, []);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI update
    const sourceCol = Array.from(board[source.droppableId]);
    const [moved] = sourceCol.splice(source.index, 1);
    const destCol = source.droppableId === destination.droppableId ? sourceCol : Array.from(board[destination.droppableId]);
    moved.status = destination.droppableId;
    destCol.splice(destination.index, 0, moved);

    setBoard({ ...board, [source.droppableId]: sourceCol, [destination.droppableId]: destCol });

    try {
      await api.put(`/leads/${draggableId}/move`, { status: destination.droppableId, position: destination.index });
    } catch {
      toast.error('Failed to move lead');
      fetchBoard();
    }
  };

  if (loading) return <Loader label="Loading pipeline..." />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Sales Pipeline</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Drag leads across stages to update their status</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`glass-panel w-72 flex-shrink-0 border-t-4 ${columnAccent[status]} p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-primary-50/60 dark:bg-white/10' : ''}`}
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{status}</h3>
                    <span className="rounded-full bg-slate-200/70 dark:bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {board[status]?.length || 0}
                    </span>
                  </div>

                  <div className="flex min-h-[100px] flex-col gap-2.5">
                    {board[status]?.map((lead, index) => (
                      <Draggable draggableId={lead._id} index={index} key={lead._id}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`glass-card cursor-grab p-3.5 active:cursor-grabbing ${dragSnapshot.isDragging ? 'rotate-1 shadow-2xl' : ''}`}
                          >
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{lead.title}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{lead.contactName}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm font-bold text-primary-600 dark:text-primary-300">${Number(lead.value || 0).toLocaleString()}</span>
                              <StatusBadge status={lead.priority} />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Pipeline;
