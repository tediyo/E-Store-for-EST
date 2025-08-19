const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  profit: {
    type: Number,
    required: true,
    min: 0
  },
  saleType: {
    type: String,
    enum: ['store', 'out_of_store'],
    required: true
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
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  saleDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total amount and profit before saving
saleSchema.pre('save', function(next) {
  this.totalAmount = this.quantity * this.sellingPrice;
  // Profit calculation will be handled in the controller
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
