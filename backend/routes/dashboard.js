const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Auditorium = require('../models/Auditorium');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (req.user.role === 'admin' || req.user.role === 'staff') {
      const [totalBookings, pendingBookings, approvedBookings, totalUsers, totalAuditoriums, upcomingEvents, monthlyBookings] = await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'pending' }),
        Booking.countDocuments({ status: 'approved', startDateTime: { $gte: now } }),
        User.countDocuments({ isActive: true }),
        Auditorium.countDocuments({ isActive: true }),
        Event.countDocuments({ startDateTime: { $gte: now }, status: 'upcoming' }),
        Booking.countDocuments({ createdAt: { $gte: startOfMonth } })
      ]);

      const recentBookings = await Booking.find()
        .populate('auditorium', 'name code')
        .populate('requestedBy', 'name department')
        .sort({ createdAt: -1 }).limit(5);

      const bookingsByStatus = await Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const bookingsByAuditorium = await Booking.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$auditorium', count: { $sum: 1 } } },
        { $lookup: { from: 'auditoriums', localField: '_id', foreignField: '_id', as: 'auditorium' } },
        { $unwind: '$auditorium' },
        { $project: { name: '$auditorium.name', count: 1 } }
      ]);

      const last6Months = await Booking.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      res.json({
        success: true,
        data: { totalBookings, pendingBookings, approvedBookings, totalUsers, totalAuditoriums, upcomingEvents, monthlyBookings, recentBookings, bookingsByStatus, bookingsByAuditorium, last6Months }
      });
    } else {
      const [myBookings, myPendingBookings, myApprovedBookings] = await Promise.all([
        Booking.countDocuments({ requestedBy: req.user._id }),
        Booking.countDocuments({ requestedBy: req.user._id, status: 'pending' }),
        Booking.countDocuments({ requestedBy: req.user._id, status: 'approved', startDateTime: { $gte: now } })
      ]);

      const myRecentBookings = await Booking.find({ requestedBy: req.user._id })
        .populate('auditorium', 'name code location')
        .sort({ createdAt: -1 }).limit(5);

      const upcomingEvents = await Event.find({ startDateTime: { $gte: now }, isPublic: true })
        .populate('auditorium', 'name location')
        .sort({ startDateTime: 1 }).limit(5);

      res.json({
        success: true,
        data: { myBookings, myPendingBookings, myApprovedBookings, myRecentBookings, upcomingEvents }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
