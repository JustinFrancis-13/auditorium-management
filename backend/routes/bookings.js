const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Auditorium = require('../models/Auditorium');
const { protect, authorize } = require('../middleware/auth');

// GET all bookings (admin/staff) or user's bookings
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student' || req.user.role === 'faculty') {
      query.requestedBy = req.user._id;
    }
    const { status, auditorium, startDate, endDate } = req.query;
    if (status) query.status = status;
    if (auditorium) query.auditorium = auditorium;
    if (startDate || endDate) {
      query.startDateTime = {};
      if (startDate) query.startDateTime.$gte = new Date(startDate);
      if (endDate) query.startDateTime.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate('auditorium', 'name code location capacity')
      .populate('requestedBy', 'name email department role')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('auditorium')
      .populate('requestedBy', 'name email department phone')
      .populate('approvedBy', 'name email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (req.user.role === 'student' && booking.requestedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create booking
router.post('/', protect, async (req, res) => {
  try {
    const { auditorium, startDateTime, endDateTime, expectedAttendees } = req.body;

    // Check auditorium capacity
    const aud = await Auditorium.findById(auditorium);
    if (!aud) return res.status(404).json({ success: false, message: 'Auditorium not found' });
    if (expectedAttendees > aud.capacity) {
      return res.status(400).json({ success: false, message: `Expected attendees (${expectedAttendees}) exceeds capacity (${aud.capacity})` });
    }

    // Check for conflicts
    const conflict = await Booking.findOne({
      auditorium,
      status: { $in: ['approved', 'pending'] },
      $or: [
        { startDateTime: { $lt: new Date(endDateTime), $gte: new Date(startDateTime) } },
        { endDateTime: { $gt: new Date(startDateTime), $lte: new Date(endDateTime) } },
        { startDateTime: { $lte: new Date(startDateTime) }, endDateTime: { $gte: new Date(endDateTime) } }
      ]
    });
    if (conflict) {
      return res.status(409).json({ success: false, message: 'Auditorium already booked for this time slot', conflict });
    }

    const booking = await Booking.create({ ...req.body, requestedBy: req.user._id });
    const populated = await booking.populate(['auditorium', { path: 'requestedBy', select: 'name email' }]);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update booking status (admin/staff)
router.put('/:id/status', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { status, rejectionReason, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = status;
    if (status === 'approved') {
      booking.approvedBy = req.user._id;
      booking.approvedAt = new Date();
    }
    if (status === 'rejected') booking.rejectionReason = rejectionReason;
    if (status === 'cancelled') booking.cancellationReason = cancellationReason;
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('auditorium', 'name code')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name');

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT cancel booking (own booking)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.requestedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST feedback
router.post('/:id/feedback', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    booking.feedback = { rating, comment, submittedAt: new Date() };
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
