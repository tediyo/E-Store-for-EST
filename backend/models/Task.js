const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  // Core fields for client registration
  clientStatus: {
    type: String,
    enum: ['unsuccessful', 'annoying', 'blocked'],
    required: true
  },
  clientPhone: {
    type: String,
    trim: true,
    required: true
  },
  behavioralDetails: {
    type: String,
    trim: true,
    required: true
  },
  cause: {
    type: String,
    trim: true,
    required: true
  },
  preferredShoeType: {
    type: String,
    trim: true,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  taxiCost: {
    type: Number,
    min: 0,
    default: 0
  },
  otherCosts: {
    type: Number,
    min: 0,
    default: 0
  },
  totalCost: {
    type: Number,
    min: 0,
    default: 0
  },
  taskDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate total cost before saving
taskSchema.pre('save', function(next) {
  // Ensure cost fields are numbers
  this.taxiCost = Number(this.taxiCost) || 0;
  this.otherCosts = Number(this.otherCosts) || 0;
  
  // Calculate total cost
  this.totalCost = this.taxiCost + this.otherCosts;
  next();
});

module.exports = mongoose.model('Task', taskSchema);
