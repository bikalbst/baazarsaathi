const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');
const AdminSetting = require('../models/AdminSetting');
const khaltiService = require('../services/khaltiService');
const escrowService = require('../services/escrowService');
const {
  createOrder,
  getMyOrders,
  getAdminOverview,
  verifyKhaltiPayment,
  approveOrder,
  updateAutoAcceptSetting,
} = require('../controllers/orderController');

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

test('Order calculates 10% commission and 90% seller earning', async () => {
  const order = new Order({
    buyer: new mongoose.Types.ObjectId(),
    seller: new mongoose.Types.ObjectId(),
    listing: new mongoose.Types.ObjectId(),
    amount: 1234.56,
  });

  await order.validate();

  assert.equal(order.commission, 123.46);
  assert.equal(order.sellerEarning, 1111.1);
  assert.equal(order.status, 'pending');
  assert.equal(order.paymentVerified, false);
  assert.equal(order.paymentMethod, 'khalti_wallet');
});

test('createOrder derives amount and seller from the listing', async () => {
  const originalFindById = Listing.findById;
  const originalInitiatePayment = khaltiService.initiatePayment;
  const originalSave = Order.prototype.save;
  const buyerId = new mongoose.Types.ObjectId();
  const sellerId = new mongoose.Types.ObjectId();
  const listingId = new mongoose.Types.ObjectId();

  try {
    Listing.findById = async () => ({
      _id: listingId,
      seller: sellerId,
      title: 'Laptop',
      price: 100000,
      status: 'active',
    });
    khaltiService.initiatePayment = async ({ order }) => {
      assert.equal(order.amount, 100000);
      assert.equal(order.seller.toString(), sellerId.toString());
      return {
        pidx: 'test-pidx',
        payment_url: 'https://test-pay.khalti.com/?pidx=test-pidx',
        expires_in: 1800,
      };
    };
    Order.prototype.save = async function saveOrder() {
      return this;
    };

    const req = {
      user: {
        _id: buyerId,
        role: 'buyer',
        name: 'Buyer',
        email: 'buyer@example.com',
      },
      body: {
        listingId: listingId.toString(),
        paymentMethod: 'card',
        amount: 1,
        seller: buyerId,
      },
    };
    const res = createResponse();

    await createOrder(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.data.order.amount, 100000);
    assert.equal(res.body.data.order.commission, 10000);
    assert.equal(res.body.data.order.sellerEarning, 90000);
    assert.equal(res.body.data.order.paymentId, 'test-pidx');
    assert.equal(res.body.data.order.paymentMethod, 'card');
    assert.equal(res.body.data.order.quantity, 1);
    assert.equal(res.body.data.order.price, 100000);
  } finally {
    Listing.findById = originalFindById;
    khaltiService.initiatePayment = originalInitiatePayment;
    Order.prototype.save = originalSave;
  }
});

test('getMyOrders separates the authenticated account purchases and sales', async () => {
  const originalFind = Order.find;
  const userId = new mongoose.Types.ObjectId();
  const purchase = { _id: new mongoose.Types.ObjectId(), buyer: userId };
  const sale = { _id: new mongoose.Types.ObjectId(), seller: userId };

  try {
    Order.find = (filter) => ({
      populate() { return this; },
      async sort() { return filter.buyer ? [purchase] : [sale]; },
    });
    const res = createResponse();
    await getMyOrders({ user: { _id: userId } }, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body.data.purchases, [purchase]);
    assert.deepEqual(res.body.data.sales, [sale]);
  } finally {
    Order.find = originalFind;
  }
});

test('getAdminOverview returns live marketplace and escrow totals', async () => {
  const originalUserCount = User.countDocuments;
  const originalListingCount = Listing.countDocuments;
  const originalAggregate = Order.aggregate;
  const originalFind = Order.find;
  const orders = [{ _id: new mongoose.Types.ObjectId(), paymentVerified: true, status: 'pending' }];

  try {
    User.countDocuments = async () => 12;
    Listing.countDocuments = async (filter) => (filter.status === 'active' ? 7 : 5);
    Order.aggregate = async () => [{
      paidOrders: 4,
      pendingApprovals: 1,
      totalVolume: 200000,
      commissionEarned: 15000,
    }];
    Order.find = () => ({
      populate() { return this; },
      sort() { return this; },
      async limit() { return orders; },
    });

    const res = createResponse();
    await getAdminOverview({}, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.stats.totalUsers, 12);
    assert.equal(res.body.data.stats.pendingApprovals, 1);
    assert.equal(res.body.data.stats.commissionEarned, 15000);
    assert.deepEqual(res.body.data.orders, orders);
  } finally {
    User.countDocuments = originalUserCount;
    Listing.countDocuments = originalListingCount;
    Order.aggregate = originalAggregate;
    Order.find = originalFind;
  }
});

test('verifyKhaltiPayment holds verified funds when auto-accept is disabled', async () => {
  const originalFindById = Order.findById;
  const originalLookupPayment = khaltiService.lookupPayment;
  const originalFindSetting = AdminSetting.findOneAndUpdate;
  const originalConfirmPayment = escrowService.confirmPayment;
  const buyerId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  const order = {
    _id: orderId,
    buyer: buyerId,
    amount: 500,
    paymentId: 'verified-pidx',
    status: 'pending',
    paymentVerified: false,
    paidAt: null,
    async save() {
      return this;
    },
  };

  try {
    Order.findById = async () => order;
    khaltiService.lookupPayment = async () => ({
      pidx: 'verified-pidx',
      total_amount: 50000,
      status: 'Completed',
      transaction_id: 'khalti-transaction',
    });
    AdminSetting.findOneAndUpdate = async () => ({ autoAccept: false });
    escrowService.confirmPayment = async (receivedOrderId, payment) => {
      assert.equal(receivedOrderId, orderId);
      order.paymentVerified = true;
      order.paymentStatus = 'paid';
      order.paymentTransactionId = payment.transactionId;
      order.paidAt = new Date();
      return order;
    };

    const req = {
      user: { _id: buyerId },
      body: { orderId: orderId.toString(), pidx: 'verified-pidx' },
    };
    const res = createResponse();

    await verifyKhaltiPayment(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(order.paymentVerified, true);
    assert.equal(order.paymentTransactionId, 'khalti-transaction');
    assert.equal(order.status, 'pending');
    assert.equal(res.body.data.autoAccepted, false);
  } finally {
    Order.findById = originalFindById;
    khaltiService.lookupPayment = originalLookupPayment;
    AdminSetting.findOneAndUpdate = originalFindSetting;
    escrowService.confirmPayment = originalConfirmPayment;
  }
});

test('verifyKhaltiPayment auto-releases when auto-accept is enabled', async () => {
  const originalFindById = Order.findById;
  const originalLookupPayment = khaltiService.lookupPayment;
  const originalFindSetting = AdminSetting.findOneAndUpdate;
  const originalReleaseEscrow = escrowService.releaseEscrow;
  const originalConfirmPayment = escrowService.confirmPayment;
  const buyerId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  const order = {
    _id: orderId,
    buyer: buyerId,
    amount: 750,
    paymentId: 'auto-pidx',
    status: 'pending',
    async save() {
      return this;
    },
  };
  const completedOrder = { ...order, status: 'completed' };

  try {
    Order.findById = async () => order;
    khaltiService.lookupPayment = async () => ({
      pidx: 'auto-pidx',
      total_amount: 75000,
      status: 'Completed',
      transaction_id: 'auto-transaction',
    });
    AdminSetting.findOneAndUpdate = async () => ({ autoAccept: true });
    escrowService.confirmPayment = async () => ({
      ...order,
      paymentVerified: true,
      paymentStatus: 'paid',
      paymentTransactionId: 'auto-transaction',
    });
    escrowService.releaseEscrow = async (receivedOrderId) => {
      assert.equal(receivedOrderId, orderId);
      return completedOrder;
    };

    const req = {
      user: { _id: buyerId },
      body: { orderId: orderId.toString(), pidx: 'auto-pidx' },
    };
    const res = createResponse();

    await verifyKhaltiPayment(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.autoAccepted, true);
    assert.equal(res.body.data.order.status, 'completed');
  } finally {
    Order.findById = originalFindById;
    khaltiService.lookupPayment = originalLookupPayment;
    AdminSetting.findOneAndUpdate = originalFindSetting;
    escrowService.releaseEscrow = originalReleaseEscrow;
    escrowService.confirmPayment = originalConfirmPayment;
  }
});

test('verifyKhaltiPayment rejects a mismatched paid amount', async () => {
  const originalFindById = Order.findById;
  const originalLookupPayment = khaltiService.lookupPayment;
  const buyerId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();

  try {
    Order.findById = async () => ({
      _id: orderId,
      buyer: buyerId,
      amount: 500,
      paymentId: 'amount-pidx',
      status: 'pending',
    });
    khaltiService.lookupPayment = async () => ({
      pidx: 'amount-pidx',
      total_amount: 100,
      status: 'Completed',
      transaction_id: 'wrong-amount-transaction',
    });

    const req = {
      user: { _id: buyerId },
      body: { orderId: orderId.toString(), pidx: 'amount-pidx' },
    };
    const res = createResponse();

    await verifyKhaltiPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /do not match/);
  } finally {
    Order.findById = originalFindById;
    khaltiService.lookupPayment = originalLookupPayment;
  }
});

test('releaseEscrow marks listing sold and credits seller earning once', async () => {
  const originalStartSession = mongoose.startSession;
  const originalFindById = Order.findById;
  const originalListingUpdate = Listing.findOneAndUpdate;
  const originalUserUpdate = User.findOneAndUpdate;
  const orderId = new mongoose.Types.ObjectId();
  const sellerId = new mongoose.Types.ObjectId();
  const listingId = new mongoose.Types.ObjectId();
  const session = {
    async withTransaction(work) {
      await work();
    },
    async endSession() {},
  };
  const order = {
    _id: orderId,
    seller: sellerId,
    listing: listingId,
    sellerEarning: 900,
    status: 'pending',
    paymentVerified: true,
    async save(options) {
      assert.equal(options.session, session);
      return this;
    },
  };
  let listingUpdate;
  let walletUpdate;

  try {
    mongoose.startSession = async () => session;
    Order.findById = () => ({
      async session(receivedSession) {
        assert.equal(receivedSession, session);
        return order;
      },
    });
    Listing.findOneAndUpdate = async (filter, update) => {
      listingUpdate = { filter, update };
      return { _id: listingId, status: 'sold' };
    };
    User.findOneAndUpdate = async (filter, update) => {
      walletUpdate = { filter, update };
      return { _id: sellerId, walletBalance: 900 };
    };

    const result = await escrowService.releaseEscrow(orderId);

    assert.equal(result.status, 'completed');
    assert.deepEqual(listingUpdate.update, { $set: { status: 'sold' } });
    assert.deepEqual(walletUpdate.update, { $inc: { walletBalance: 900 } });
    assert.ok(order.releasedAt instanceof Date);
  } finally {
    mongoose.startSession = originalStartSession;
    Order.findById = originalFindById;
    Listing.findOneAndUpdate = originalListingUpdate;
    User.findOneAndUpdate = originalUserUpdate;
  }
});

test('confirmPayment atomically persists payment and marks the listing sold', async () => {
  const originalStartSession = mongoose.startSession;
  const originalFindById = Order.findById;
  const originalListingUpdate = Listing.findOneAndUpdate;
  const orderId = new mongoose.Types.ObjectId();
  const listingId = new mongoose.Types.ObjectId();
  const session = { async withTransaction(work) { await work(); }, async endSession() {} };
  const order = {
    _id: orderId,
    listing: listingId,
    status: 'pending',
    paymentVerified: false,
    paidAt: null,
    async save(options) { assert.equal(options.session, session); return this; },
  };

  try {
    mongoose.startSession = async () => session;
    Order.findById = () => ({ async session() { return order; } });
    Listing.findOneAndUpdate = async (filter, update, options) => {
      assert.deepEqual(filter, { _id: listingId, status: 'active' });
      assert.deepEqual(update, { $set: { status: 'sold' } });
      assert.equal(options.session, session);
      return { _id: listingId, status: 'sold' };
    };

    const result = await escrowService.confirmPayment(orderId, { transactionId: 'txn-123' });
    assert.equal(result.paymentVerified, true);
    assert.equal(result.paymentStatus, 'paid');
    assert.equal(result.paymentTransactionId, 'txn-123');
    assert.ok(result.paidAt instanceof Date);
  } finally {
    mongoose.startSession = originalStartSession;
    Order.findById = originalFindById;
    Listing.findOneAndUpdate = originalListingUpdate;
  }
});

test('approveOrder delegates verified escrow release', async () => {
  const originalReleaseEscrow = escrowService.releaseEscrow;
  const orderId = new mongoose.Types.ObjectId();

  try {
    escrowService.releaseEscrow = async () => ({ _id: orderId, status: 'completed' });
    const req = { params: { id: orderId.toString() } };
    const res = createResponse();

    await approveOrder(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.status, 'completed');
  } finally {
    escrowService.releaseEscrow = originalReleaseEscrow;
  }
});

test('updateAutoAcceptSetting requires a boolean', async () => {
  const req = { body: { autoAccept: 'true' } };
  const res = createResponse();

  await updateAutoAcceptSetting(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});
