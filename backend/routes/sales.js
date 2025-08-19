const express = require('express');
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Item = require('../models/Item');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all sales
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, saleType } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (saleType) query.saleType = saleType;

    const sales = await Sale.find(query)
      .populate('item', 'name shoeType basePrice')
      .populate('soldBy', 'username')
      .sort({ saleDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(query);

    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single sale
router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('item', 'name shoeType basePrice')
      .populate('soldBy', 'username');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new sale
router.post('/', auth, [
  body('itemId').isMongoId(),
  body('quantity').isInt({ min: 1 }),
  body('sellingPrice').isFloat({ min: 0 }),
  body('saleType').isIn(['store', 'out_of_store']),
  body('clientDetails.phone').optional().trim(),
  body('clientDetails.address').optional().trim(),
  body('clientDetails.intentionalBehaviour').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId, quantity, sellingPrice, saleType, clientDetails } = req.body;

    // Check if item exists and has sufficient quantity
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity in stock' });
    }

    // Calculate profit
    const basePrice = item.basePrice;
    const profit = (sellingPrice - basePrice) * quantity;

    // Create sale record
    const sale = new Sale({
      item: itemId,
      quantity,
      sellingPrice,
      totalAmount: quantity * sellingPrice,
      profit,
      saleType,
      clientDetails,
      soldBy: req.user._id
    });

    await sale.save();

    // Update item quantity
    item.quantity -= quantity;
    await item.save();

    // Populate references
    await sale.populate('item', 'name shoeType basePrice');
    await sale.populate('soldBy', 'username');

    res.status(201).json({
      message: 'Sale recorded successfully',
      sale
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update sale
router.put('/:id', auth, [
  body('sellingPrice').optional().isFloat({ min: 0 }),
  body('clientDetails.phone').optional().trim(),
  body('clientDetails.address').optional().trim(),
  body('clientDetails.intentionalBehaviour').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Update fields
    if (req.body.sellingPrice !== undefined) {
      sale.sellingPrice = req.body.sellingPrice;
      sale.totalAmount = sale.quantity * sale.sellingPrice;
      sale.profit = (sale.sellingPrice - sale.item.basePrice) * sale.quantity;
    }

    if (req.body.clientDetails) {
      sale.clientDetails = { ...sale.clientDetails, ...req.body.clientDetails };
    }

    await sale.save();
    await sale.populate('item', 'name shoeType basePrice');
    await sale.populate('soldBy', 'username');

    res.json({
      message: 'Sale updated successfully',
      sale
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete sale (with item quantity restoration)
router.delete('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Restore item quantity
    const item = await Item.findById(sale.item);
    if (item) {
      item.quantity += sale.quantity;
      await item.save();
    }

    await Sale.findByIdAndDelete(req.params.id);

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sales statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const totalSales = await Sale.countDocuments(query);
    const totalRevenue = await Sale.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalProfit = await Sale.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$profit' } } }
    ]);

    const storeSales = await Sale.countDocuments({ ...query, saleType: 'store' });
    const outOfStoreSales = await Sale.countDocuments({ ...query, saleType: 'out_of_store' });

    res.json({
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProfit: totalProfit[0]?.total || 0,
      storeSales,
      outOfStoreSales
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
