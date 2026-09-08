const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication token is required',
      });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication token is required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'The user for this token no longer exists',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError'
      ? 'Authentication token has expired'
      : 'Authentication token is invalid';

    return res.status(401).json({ success: false, data: null, message });
  }
};

const optionalAuth = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next();
  }

  return protect(req, res, next);
};

const authorizeRoles = (...roles) => async (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'You do not have permission to perform this action',
    });
  }

  return next();
};

module.exports = { protect, optionalAuth, authorizeRoles };
