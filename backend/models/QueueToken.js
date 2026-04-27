const mongoose = require('mongoose');

const queueTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tokenNumber: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Account Services', 'Loan Services', 'Foreign Exchange', 'General Inquiry', 'Card Services', 'Fixed Deposits'],
    required: true
  },
  queuePosition: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Waiting', 'Called', 'Completed', 'Cancelled'],
    default: 'Waiting'
  },
  serviceCounterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCounter'
  }
}, { timestamps: true });

module.exports = mongoose.model('QueueToken', queueTokenSchema);
