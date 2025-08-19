const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  shoeType: {
    type: String,
    required: true,
    trim: true
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
  quantity: {
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
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String, // Store the image URL/path
    default: null
  },
  status: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
    default: 'in_stock'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Update status based on quantity
itemSchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= 5) {
    this.status = 'low_stock';
  } else {
    this.status = 'in_stock';
  }
  next();
});

// Note: Pre-update hooks don't work reliably with findByIdAndUpdate
// Status updates are now handled manually in the routes

// Instance method to update status based on quantity
itemSchema.methods.updateStatus = function() {
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= 5) {
    this.status = 'low_stock';
  } else {
    this.status = 'in_stock';
  }
  return this.status;
};

// Static method to update status for any item
itemSchema.statics.updateItemStatus = async function(itemId) {
  const item = await this.findById(itemId);
  if (item) {
    item.updateStatus();
    await item.save();
    return item.status;
  }
  return null;
};

module.exports = mongoose.model('Item', itemSchema);
