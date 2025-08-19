const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId (for store sales) or String (for out-of-store sales)
    ref: 'Item',
    required: function() {
      return this.saleType === 'store';
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
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
  fromWhom: {
    type: String,
    trim: true,
    required: function() {
      return this.saleType === 'out_of_store';
    }
  },
  itemName: {
    type: String,
    trim: true,
    required: function() {
      return this.saleType === 'out_of_store';
    }
  },
  itemType: {
    type: String,
    trim: true,
    required: function() {
      return this.saleType === 'out_of_store';
    }
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
