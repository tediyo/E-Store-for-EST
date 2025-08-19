const express = require('express');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all items
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, shoeType } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shoeType: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (shoeType) query.shoeType = shoeType;

    const items = await Item.find(query)
      .populate('addedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('addedBy', 'username');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new item
router.post('/', [auth, adminAuth], [
  body('name').notEmpty().trim().escape(),
  body('shoeType').notEmpty().trim().escape(),
  body('basePrice').isFloat({ min: 0 }),
  body('sellingPrice').isFloat({ min: 0 }),
  body('quantity').isInt({ min: 0 }),
  body('supplier').notEmpty().trim().escape(),
  body('description').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, shoeType, basePrice, sellingPrice, quantity, supplier, description } = req.body;

    const item = new Item({
      name,
      shoeType,
      basePrice,
      sellingPrice,
      quantity,
      supplier,
      description,
      addedBy: req.user._id
    });

    await item.save();
    await item.populate('addedBy', 'username');

    res.status(201).json({
      message: 'Item added successfully',
      item
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item
router.put('/:id', [auth, adminAuth], [
  body('name').optional().trim().escape(),
  body('shoeType').optional().trim().escape(),
  body('basePrice').optional().isFloat({ min: 0 }),
  body('sellingPrice').optional().isFloat({ min: 0 }),
  body('quantity').optional().isInt({ min: 0 }),
  body('supplier').optional().trim().escape(),
  body('description').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete item
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get item statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const inStockItems = await Item.countDocuments({ status: 'in_stock' });
    const lowStockItems = await Item.countDocuments({ status: 'low_stock' });
    const outOfStockItems = await Item.countDocuments({ status: 'out_of_stock' });
    
    const totalValue = await Item.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$basePrice', '$quantity'] } } } }
    ]);

    res.json({
      totalItems,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      totalValue: totalValue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
