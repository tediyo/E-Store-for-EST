const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, saleLocation, shoeType } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.taskDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (saleLocation) query.saleLocation = saleLocation;
    if (shoeType) query.shoeType = shoeType;

    const tasks = await Task.find(query)
      .populate('createdBy', 'username')
      .sort({ taskDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('createdBy', 'username');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new task
router.post('/', auth, [
  body('shoeType').notEmpty().trim().escape(),
  body('saleLocation').isIn(['store', 'out_of_store']),
  body('basePrice').optional().isFloat({ min: 0 }),
  body('profitGained').optional().isFloat({ min: 0 }),
  body('taxiCost').optional().isFloat({ min: 0 }),
  body('otherCosts').optional().isFloat({ min: 0 }),
  body('supplier').optional().trim().escape(),
  body('clientDetails.phone').optional().trim(),
  body('clientDetails.address').optional().trim(),
  body('clientDetails.intentionalBehaviour').optional().trim(),
  body('clientStatus').optional().isIn(['successful', 'unsuccessful', 'annoying', 'blocked']),
  body('clientPhone').optional().trim(),
  body('behavioralDetails').optional().trim(),
  body('cause').optional().trim(),
  body('preferredShoeType').optional().trim(),
  body('notes').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      shoeType,
      saleLocation,
      basePrice,
      profitGained,
      taxiCost,
      otherCosts,
      supplier,
      clientDetails,
      clientStatus,
      clientPhone,
      behavioralDetails,
      cause,
      preferredShoeType,
      notes
    } = req.body;

    const task = new Task({
      shoeType,
      saleLocation,
      basePrice,
      profitGained,
      taxiCost,
      otherCosts,
      supplier,
      clientDetails,
      clientStatus,
      clientPhone,
      behavioralDetails,
      cause,
      preferredShoeType,
      notes,
      createdBy: req.user._id
    });

    await task.save();
    await task.populate('createdBy', 'username');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task
router.put('/:id', auth, [
  body('shoeType').optional().trim().escape(),
  body('saleLocation').optional().isIn(['store', 'out_of_store']),
  body('basePrice').optional().isFloat({ min: 0 }),
  body('profitGained').optional().isFloat({ min: 0 }),
  body('taxiCost').optional().isFloat({ min: 0 }),
  body('otherCosts').optional().isFloat({ min: 0 }),
  body('supplier').optional().trim().escape(),
  body('clientDetails.phone').optional().trim(),
  body('clientDetails.address').optional().trim(),
  body('clientDetails.intentionalBehaviour').optional().trim(),
  body('clientStatus').optional().isIn(['successful', 'unsuccessful', 'annoying', 'blocked']),
  body('clientPhone').optional().trim(),
  body('behavioralDetails').optional().trim(),
  body('cause').optional().trim(),
  body('preferredShoeType').optional().trim(),
  body('notes').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get task statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.taskDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const totalTasks = await Task.countDocuments(query);
    const totalProfit = await Task.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$netProfit' } } }
    ]);
    const totalCosts = await Task.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);

    const storeTasks = await Task.countDocuments({ ...query, saleLocation: 'store' });
    const outOfStoreTasks = await Task.countDocuments({ ...query, saleLocation: 'out_of_store' });

    // Get unique shoe types
    const shoeTypes = await Task.distinct('shoeType', query);

    res.json({
      totalTasks,
      totalProfit: totalProfit[0]?.total || 0,
      totalCosts: totalCosts[0]?.total || 0,
      storeTasks,
      outOfStoreTasks,
      shoeTypes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
