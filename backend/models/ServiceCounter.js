const mongoose = require('mongoose');

const serviceCounterSchema = new mongoose.Schema({
  counterName: {
    type: String,
    required: true,
    unique: true
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  serviceType: {
    type: String,
    enum: ['Account Services', 'Loan Services', 'Foreign Exchange', 'General Inquiry', 'Card Services', 'Fixed Deposits', 'All'],
    default: 'All'
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceCounter', serviceCounterSchema);
