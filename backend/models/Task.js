const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  shoeType: {
    type: String,
    required: true,
    trim: true
  },
  saleLocation: {
    type: String,
    enum: ['store', 'out_of_store'],
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  profitGained: {
    type: Number,
    required: true,
    min: 0
  },
  taxiCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  otherCosts: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  clientDetails: {
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    intentionalBehaviour: {
      type: String,
      trim: true
    }
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  netProfit: {
    type: Number,
    required: true,
    min: 0
  },
  taskDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate total cost and net profit before saving
taskSchema.pre('save', function(next) {
  this.totalCost = this.basePrice + this.taxiCost + this.otherCosts;
  this.netProfit = this.profitGained - this.totalCost;
  next();
});

module.exports = mongoose.model('Task', taskSchema);
