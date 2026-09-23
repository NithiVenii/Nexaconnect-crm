const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    relatedTo: {
      type: { type: String, enum: ['customer', 'lead', 'general'], default: 'general' },
      id: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedModel' },
    },
    relatedModel: { type: String, enum: ['Customer', 'Lead'], default: undefined },
    dueDate: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
