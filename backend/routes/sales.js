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
    
    const query = { soldBy: req.user._id }; // Filter by authenticated user
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

    // Handle out-of-store sales that don't have item references
    const processedSales = sales.map(sale => {
      if (sale.saleType === 'out_of_store' && !sale.item) {
        // For out-of-store sales, create a virtual item object
        sale.item = {
          _id: null,
          name: sale.itemName || 'Unknown Item',
          shoeType: sale.itemType || 'Unknown Type',
          basePrice: sale.basePrice
        };
      }
      return sale;
    });

    const total = await Sale.countDocuments(query);

    res.json({
      sales: processedSales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single sale
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('item', 'name shoeType basePrice')
      .populate('soldBy', 'username');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Handle out-of-store sales that don't have item references
    if (sale.saleType === 'out_of_store' && !sale.item) {
      sale.item = {
        _id: null,
        name: sale.itemName || 'Unknown Item',
        shoeType: sale.itemType || 'Unknown Type',
        basePrice: sale.basePrice
      };
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new sale
router.post('/', auth, [
  body('itemId').notEmpty().withMessage('Item ID is required'),
  body('quantity').isInt({ min: 1 }),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('sellingPrice').isFloat({ min: 0 }),
  body('saleType').isIn(['store', 'out_of_store']),
  body('fromWhom').optional().trim(),
  body('clientDetails.phone').optional().trim(),
  body('clientDetails.address').optional().trim(),
  body('clientDetails.intentionalBehaviour').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId, quantity, basePrice, sellingPrice, saleType, fromWhom, clientDetails } = req.body;

    let item = null;
    let profit = 0;

    if (saleType === 'store') {
      // For store sales, validate item exists and has sufficient quantity
      item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      if (item.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient quantity in stock' });
      }

      // Calculate profit for store sales using item's base price
      profit = (sellingPrice - item.basePrice) * quantity;
    } else {
      // For out-of-store sales, profit is selling price minus base price
      profit = (sellingPrice - basePrice) * quantity;
      
      // Validate fromWhom is provided
      if (!fromWhom) {
        return res.status(400).json({ message: 'From Whom is required for out-of-store sales' });
      }
    }

    // Create sale record
    const sale = new Sale({
      item: saleType === 'store' ? itemId : null, // Item ID for store sales, null for out-of-store
      itemName: saleType === 'out_of_store' ? itemId : undefined, // Item name for out-of-store sales
      itemType: saleType === 'out_of_store' ? req.body.shoeType : undefined, // Item type for out-of-store sales
      quantity,
      basePrice: saleType === 'store' ? item.basePrice : basePrice,
      sellingPrice,
      totalAmount: quantity * sellingPrice,
      profit,
      saleType,
      fromWhom,
      clientDetails,
      soldBy: req.user._id
    });

    await sale.save();

    // Update item quantity only for store sales
    if (saleType === 'store' && item) {
      item.quantity -= quantity;
      await item.save();
    }

    // Populate references
    if (saleType === 'store') {
      await sale.populate('item', 'name shoeType basePrice');
    }
    await sale.populate('soldBy', 'username');

    // Handle out-of-store sales that don't have item references
    if (saleType === 'out_of_store') {
      sale.item = {
        _id: null,
        name: sale.itemName || 'Unknown Item',
        shoeType: sale.itemType || 'Unknown Type',
        basePrice: sale.basePrice
      };
    }

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
      
      // Calculate profit based on sale type
      if (sale.saleType === 'store' && sale.item && sale.item.basePrice) {
        sale.profit = (sale.sellingPrice - sale.item.basePrice) * sale.quantity;
      } else if (sale.saleType === 'out_of_store') {
        sale.profit = (sale.sellingPrice - sale.basePrice) * sale.quantity;
      }
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

    // Restore item quantity only for store sales
    if (sale.saleType === 'store' && sale.item) {
      const item = await Item.findById(sale.item);
      if (item) {
        item.quantity += sale.quantity;
        await item.save();
      }
    }

    await Sale.findByIdAndDelete(req.params.id);

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sales statistics
router.get('/stats/overview', async (req, res) => {
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
