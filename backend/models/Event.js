const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  title: { type: String, required: true },
  description: { type: String },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  auditorium: { type: mongoose.Schema.Types.ObjectId, ref: 'Auditorium' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: true },
  registrationRequired: { type: Boolean, default: false },
  maxRegistrations: { type: Number },
  registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  banner: { type: String },
  tags: [String],
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
