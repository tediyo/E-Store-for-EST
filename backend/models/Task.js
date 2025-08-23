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
    required: false,
    min: 0,
    default: 0
  },
  profitGained: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  taxiCost: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  otherCosts: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  supplier: {
    type: String,
    required: false,
    trim: true,
    default: 'N/A'
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
  // New fields for unsuccessful/annoying clients
  clientStatus: {
    type: String,
    enum: ['successful', 'unsuccessful', 'annoying', 'blocked'],
    default: 'successful'
  },
  clientPhone: {
    type: String,
    trim: true
  },
  behavioralDetails: {
    type: String,
    trim: true
  },
  cause: {
    type: String,
    trim: true
  },
  preferredShoeType: {
    type: String,
    trim: true
  },
  totalCost: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  netProfit: {
    type: Number,
    required: false,
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
  // Ensure financial fields are numbers
  this.basePrice = Number(this.basePrice) || 0;
  this.profitGained = Number(this.profitGained) || 0;
  this.taxiCost = Number(this.taxiCost) || 0;
  this.otherCosts = Number(this.otherCosts) || 0;
  
  // Calculate totals
  this.totalCost = this.basePrice + this.taxiCost + this.otherCosts;
  this.netProfit = this.profitGained - this.totalCost;
  next();
});

module.exports = mongoose.model('Task', taskSchema);
