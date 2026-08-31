const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

process.env.JWT_SECRET = 'test-only-jwt-secret-that-is-not-used-in-production';
process.env.JWT_EXPIRES_IN = '1h';

const User = require('../models/User');
const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test('register returns a JWT and a public user payload', async () => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  const userId = new mongoose.Types.ObjectId();

  try {
    User.findOne = async () => null;
    User.create = async (userData) => ({
      ...userData,
      _id: userId,
      createdAt: new Date(),
    });

    const req = {
      body: {
        name: 'Asha Rai',
        email: 'ASHA@example.com',
        password: 'strong-password',
        role: 'seller',
      },
    };
    const res = createResponse();

    await register(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, 'asha@example.com');
    assert.equal(res.body.data.user.password, undefined);
    assert.equal(jwt.verify(res.body.data.token, process.env.JWT_SECRET).id, userId.toString());
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  }
});

test('register prevents public admin account creation', async () => {
  const req = {
    body: {
      name: 'Untrusted Admin',
      email: 'admin@example.com',
      password: 'strong-password',
      role: 'admin',
    },
  };
  const res = createResponse();

  await register(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /buyer and seller/);
});

test('login verifies a bcrypt password and returns a JWT', async () => {
  const originalFindOne = User.findOne;
  const userId = new mongoose.Types.ObjectId();
  const passwordHash = await bcrypt.hash('strong-password', 4);
  const user = {
    _id: userId,
    name: 'Asha Rai',
    email: 'asha@example.com',
    password: passwordHash,
    role: 'buyer',
    createdAt: new Date(),
    comparePassword: async (candidatePassword) => bcrypt.compare(candidatePassword, passwordHash),
  };

  try {
    User.findOne = () => ({ select: async () => user });
    const req = { body: { email: user.email, password: 'strong-password' } };
    const res = createResponse();

    await login(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(jwt.verify(res.body.data.token, process.env.JWT_SECRET).id, userId.toString());
  } finally {
    User.findOne = originalFindOne;
  }
});

test('protect attaches the authenticated user to the request', async () => {
  const originalFindById = User.findById;
  const userId = new mongoose.Types.ObjectId();
  const user = { _id: userId, role: 'buyer' };

  try {
    User.findById = async () => user;
    const token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createResponse();
    let nextCalled = false;

    await protect(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user, user);
  } finally {
    User.findById = originalFindById;
  }
});

test('protect rejects a request without a bearer token', async () => {
  const req = { headers: {} };
  const res = createResponse();

  await protect(req, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.deepEqual(Object.keys(res.body).sort(), ['data', 'message', 'success']);
});
