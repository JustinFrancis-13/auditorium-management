const jwt = require('jsonwebtoken');
const db = require('../config/inMemoryDB');

const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'auditorium_secret_key_2024');
    const user = db.users.find(u => u._id === decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = { ...user };
    delete req.user.password;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' not authorized` });
  }
  next();
};

module.exports = { protect, authorize };
