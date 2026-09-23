const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    contactName: { type: String, required: true },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    company: { type: String, default: '' },
    value: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'],
      default: 'New',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    source: { type: String, default: 'other' },
    expectedCloseDate: { type: Date },
    notes: { type: String, default: '' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: Number, default: 0 }, // for kanban ordering within a column
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
