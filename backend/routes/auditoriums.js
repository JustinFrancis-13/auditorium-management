const express = require('express');
const router = express.Router();
const Auditorium = require('../models/Auditorium');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// GET all auditoriums
router.get('/', protect, async (req, res) => {
  try {
    const auditoriums = await Auditorium.find({ isActive: true }).populate('manager', 'name email');
    res.json({ success: true, data: auditoriums });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single auditorium
router.get('/:id', protect, async (req, res) => {
  try {
    const auditorium = await Auditorium.findById(req.params.id).populate('manager', 'name email');
    if (!auditorium) return res.status(404).json({ success: false, message: 'Auditorium not found' });
    res.json({ success: true, data: auditorium });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET availability for an auditorium
router.get('/:id/availability', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      auditorium: req.params.id,
      status: { $in: ['approved', 'pending'] },
      startDateTime: { $lte: endOfDay },
      endDateTime: { $gte: startOfDay }
    }).select('startDateTime endDateTime eventName status requestedBy').populate('requestedBy', 'name');

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create auditorium (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const auditorium = await Auditorium.create(req.body);
    res.status(201).json({ success: true, data: auditorium });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update auditorium (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const auditorium = await Auditorium.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!auditorium) return res.status(404).json({ success: false, message: 'Auditorium not found' });
    res.json({ success: true, data: auditorium });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE auditorium (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Auditorium.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Auditorium deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Seed auditoriums
router.post('/seed/data', protect, authorize('admin'), async (req, res) => {
  try {
    const auditoriums = [
      {
        name: 'Dr. B.R. Ambedkar Auditorium',
        code: 'AUD-001',
        location: 'Main Block, Ground Floor',
        capacity: 1500,
        description: 'Main auditorium of Anurag University, used for convocations and major events',
        amenities: ['AC', 'Projector', 'Sound System', 'LED Screen', 'Green Room', 'Stage Lighting', 'Microphones', 'Live Streaming', 'Recording Setup', 'Parking'],
        pricePerHour: 0
      },
      {
        name: 'Vivekananda Mini Auditorium',
        code: 'AUD-002',
        location: 'Academic Block B, First Floor',
        capacity: 500,
        description: 'Ideal for seminars, workshops and departmental events',
        amenities: ['AC', 'Projector', 'Sound System', 'Microphones', 'Stage Lighting'],
        pricePerHour: 0
      },
      {
        name: 'APJ Abdul Kalam Seminar Hall',
        code: 'SH-001',
        location: 'Technology Block, Second Floor',
        capacity: 200,
        description: 'Fully equipped seminar hall for academic talks and conferences',
        amenities: ['AC', 'Projector', 'Sound System', 'LED Screen', 'Microphones'],
        pricePerHour: 0
      }
    ];
    await Auditorium.deleteMany({});
    const created = await Auditorium.insertMany(auditoriums);
    res.json({ success: true, message: `${created.length} auditoriums seeded`, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
