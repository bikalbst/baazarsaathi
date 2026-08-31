const jwt = require('jsonwebtoken');
const User = require('../models/User');

const selfRegistrableRoles = new Set(['buyer', 'seller']);

const createToken = (userId) => jwt.sign(
  { id: userId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
);

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const validationMessage = (error) => {
  if (error.name !== 'ValidationError') {
    return null;
  }

  return Object.values(error.errors)
    .map((validationError) => validationError.message)
    .join(', ');
};

const register = async (req, res) => {
  try {
    const { name, email, password, role = 'buyer' } = req.body || {};

    if (
      typeof name !== 'string'
      || typeof email !== 'string'
      || typeof password !== 'string'
      || !name.trim()
      || !email.trim()
      || !password
    ) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Name, email, and password are required',
      });
    }

    if (!selfRegistrableRoles.has(role)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Public registration is available for buyer and seller roles only',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    const token = createToken(user._id.toString());

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: publicUser(user),
      },
      message: 'Registration successful',
    });
  } catch (error) {
    const message = validationMessage(error);

    if (message) {
      return res.status(400).json({ success: false, data: null, message });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'An account with this email already exists',
      });
    }

    return res.status(500).json({
      success: false,
      data: null,
      message: 'Unable to register user',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
      });
    }

    const token = createToken(user._id.toString());

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: publicUser(user),
      },
      message: 'Login successful',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Unable to log in',
    });
  }
};

module.exports = { register, login };
