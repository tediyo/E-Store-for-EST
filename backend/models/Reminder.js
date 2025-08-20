const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  actionType: {
    type: String,
    enum: ['follow_up', 'meeting', 'delivery', 'pickup', 'payment', 'inspection', 'other'],
    required: true,
    default: 'follow_up'
  },
  description: {
    type: String,
    trim: true
  },
  place: {
    type: String,
    trim: true
  },
  actionAt: {
    type: Date,
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  sent: {
    type: Boolean,
    default: false,
    index: true
  },
  sentAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reminder', reminderSchema);


