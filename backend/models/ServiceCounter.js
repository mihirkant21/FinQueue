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
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceCounter', serviceCounterSchema);
