const mongoose = require('mongoose');

const queueAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    unique: true
  },
  totalCustomers: {
    type: Number,
    default: 0
  },
  averageServiceTime: {
    type: Number, // in minutes
    default: 0
  },
  queuePerformance: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Poor'],
    default: 'Excellent'
  }
}, { timestamps: true });

module.exports = mongoose.model('QueueAnalytics', queueAnalyticsSchema);
