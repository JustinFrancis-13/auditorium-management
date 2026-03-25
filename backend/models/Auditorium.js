const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  row: String,
  number: Number,
  type: { type: String, enum: ['regular', 'vip', 'disabled'], default: 'regular' },
  isActive: { type: Boolean, default: true }
});

const auditoriumSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  vipCapacity: { type: Number, default: 0 },
  seats: [seatSchema],
  amenities: [{
    type: String,
    enum: ['projector', 'microphone', 'ac', 'wifi', 'livestream', 'recording', 'greenroom', 'parking', 'wheelchair', 'cafeteria']
  }],
  images: [String],
  status: { type: String, enum: ['active', 'maintenance', 'closed'], default: 'active' },
  pricePerHour: { type: Number, default: 0 },
  rules: { type: String },
  managerContact: { type: String },
  floorPlanImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Auditorium', auditoriumSchema);
