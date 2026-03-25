const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/inMemoryDB');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId, phone } = req.body;
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      _id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      department,
      employeeId,
      phone,
      isActive: true,
      createdAt: new Date()
    };
    db.users.push(user);
    const token = generateToken(user._id);
    const userResponse = { ...user };
    delete userResponse.password;
    res.status(201).json({ success: true, token, user: userResponse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
    user.lastLogin = new Date();
    const token = generateToken(user._id);
    const userResponse = { ...user };
    delete userResponse.password;
    res.json({ success: true, token, user: userResponse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = db.users.find(u => u._id === req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const userResponse = { ...user };
  delete userResponse.password;
  res.json({ success: true, user: userResponse });
});

// @PUT /api/auth/update-profile
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, phone, department } = req.body;
    const user = db.users.find(u => u._id === req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.department = department || user.department;
    const userResponse = { ...user };
    delete userResponse.password;
    res.json({ success: true, user: userResponse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = db.users.find(u => u._id === req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Seed admin user
router.post('/seed-admin', async (req, res) => {
  try {
    const existing = db.users.find(u => u.email === 'admin@anurag.edu.in');
    if (existing) return res.json({ success: true, message: 'Admin already exists', email: 'admin@anurag.edu.in', password: 'admin123' });
    const hashedPassword = await bcrypt.hash('admin123', 12);
    db.users.push({
      _id: 'admin-' + Date.now(),
      name: 'System Administrator',
      email: 'admin@anurag.edu.in',
      password: hashedPassword,
      role: 'admin',
      department: 'Administration',
      isActive: true,
      createdAt: new Date()
    });
    res.json({ success: true, message: 'Admin created', email: 'admin@anurag.edu.in', password: 'admin123' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
