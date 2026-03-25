const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  auditorium: { type: mongoose.Schema.Types.ObjectId, ref: 'Auditorium', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventName: { type: String, required: true, trim: true },
  eventType: {
    type: String,
    enum: ['academic', 'cultural', 'sports', 'technical', 'seminar', 'conference', 'workshop', 'convocation', 'other'],
    required: true
  },
  description: { type: String },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  expectedAttendees: { type: Number, required: true },
  department: { type: String },
  contactPhone: { type: String },
  requirements: {
    projector: { type: Boolean, default: false },
    microphone: { type: Boolean, default: false },
    livestream: { type: Boolean, default: false },
    recording: { type: Boolean, default: false },
    catering: { type: Boolean, default: false },
    decoration: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  adminNotes: { type: String },
  rejectionReason: { type: String },
  totalCost: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  attachments: [String],
  checkIn: { type: Date },
  checkOut: { type: Date }
}, { timestamps: true });

bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'AU-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
