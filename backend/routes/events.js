const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    let query = { isPublic: true };
    if (status) query.status = status;
    if (upcoming === 'true') query.startDateTime = { $gte: new Date() };
    const events = await Event.find(query)
      .populate('auditorium', 'name location')
      .populate('organizer', 'name department')
      .sort({ startDateTime: 1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('auditorium')
      .populate('organizer', 'name email department')
      .populate('registrations.user', 'name email rollNumber');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const alreadyRegistered = event.registrations.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyRegistered) return res.status(400).json({ success: false, message: 'Already registered' });
    if (event.maxRegistrations && event.registrations.length >= event.maxRegistrations) {
      return res.status(400).json({ success: false, message: 'Registration full' });
    }
    event.registrations.push({ user: req.user._id });
    await event.save();
    res.json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
