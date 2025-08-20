const express = require('express');
const { body, validationResult } = require('express-validator');
const Reminder = require('../models/Reminder');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create reminder
router.post('/', auth, [
  body('title').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('actionAt').isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, actionAt } = req.body;
    const reminder = new Reminder({
      title,
      description,
      actionAt,
      createdBy: req.user._id
    });
    await reminder.save();
    res.status(201).json({ message: 'Reminder created', reminder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List reminders (optionally upcoming)
router.get('/', auth, async (req, res) => {
  try {
    const { upcoming } = req.query;
    const filter = { createdBy: req.user._id };
    if (upcoming === 'true') {
      filter.actionAt = { $gte: new Date() };
      filter.sent = false;
    }
    const reminders = await Reminder.find(filter).sort({ actionAt: 1 });
    res.json({ reminders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get due reminders now (within a window) and mark as sent
router.post('/due', auth, async (req, res) => {
  try {
    const windowMinutes = Number(req.body.windowMinutes || 5);
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
    const windowEnd = new Date(now.getTime() + windowMinutes * 60 * 1000);
    const due = await Reminder.find({
      createdBy: req.user._id,
      sent: false,
      actionAt: { $gte: windowStart, $lte: windowEnd }
    }).sort({ actionAt: 1 });

    // Mark as sent
    const ids = due.map(d => d._id);
    if (ids.length > 0) {
      await Reminder.updateMany({ _id: { $in: ids } }, { $set: { sent: true, sentAt: now } });
    }

    res.json({ reminders: due });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update reminder
router.put('/:id', auth, [
  body('title').optional().trim().escape(),
  body('description').optional().trim().escape(),
  body('actionAt').optional().isISO8601().toDate(),
  body('sent').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json({ message: 'Reminder updated', reminder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


