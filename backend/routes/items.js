const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Item = require('../models/Item');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}).single('image');

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Serve uploaded images
router.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

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
router.post('/', [auth, adminAuth], (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, [
  body('name').notEmpty().withMessage('Name is required').trim().escape(),
  body('shoeType').notEmpty().withMessage('Shoe type is required').trim().escape(),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive integer'),
  body('supplier').notEmpty().withMessage('Supplier is required').trim().escape(),
  body('description').optional().trim().escape()
], async (req, res) => {
  try {
    console.log('POST /api/items - Request body:', req.body);
    console.log('User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
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
      image: req.file ? `/api/items/image/${req.file.filename}` : null,
      addedBy: req.user._id
    });

    console.log('Creating item:', item);

    await item.save();
    await item.populate('addedBy', 'username');

    console.log('Item saved successfully:', item);

    res.status(201).json({
      message: 'Item added successfully',
      item
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item
router.put('/:id', [auth, adminAuth], (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, [
  body('name').optional().trim().escape(),
  body('shoeType').optional().trim().escape(),
  body('basePrice').optional().isFloat({ min: 0 }),
  body('sellingPrice').optional().isFloat({ min: 0 }),
  body('quantity').optional().isInt({ min: 0 }),
  body('supplier').optional().trim().escape(),
  body('description').optional().trim().escape()
], async (req, res) => {
  try {
    console.log('PUT /api/items/:id - Request body:', req.body);
    console.log('PUT /api/items/:id - File:', req.file);
    console.log('PUT /api/items/:id - User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Convert string numbers to actual numbers
    if (updateData.basePrice) updateData.basePrice = parseFloat(updateData.basePrice);
    if (updateData.sellingPrice) updateData.sellingPrice = parseFloat(updateData.sellingPrice);
    if (updateData.quantity) updateData.quantity = parseInt(updateData.quantity);
    
    // If a new image is uploaded, update the image path
    if (req.file) {
      updateData.image = `/api/items/image/${req.file.filename}`;
      
      // Delete old image if it exists
      const oldItem = await Item.findById(req.params.id);
      if (oldItem && oldItem.image) {
        const oldImagePath = path.join(__dirname, '../uploads', oldItem.image.split('/').pop());
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    console.log('Updating item with data:', updateData);

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    console.log('Item updated successfully:', item);

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete item
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Delete associated image if it exists
    if (item.image) {
      const imagePath = path.join(__dirname, '../uploads', item.image.split('/').pop());
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Item.findByIdAndDelete(req.params.id);

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
