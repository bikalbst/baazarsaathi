const mongoose = require('mongoose');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');
const AdminSetting = require('../models/AdminSetting');
const khaltiService = require('../services/khaltiService');
const escrowService = require('../services/escrowService');

const terminalFailedStatuses = new Set([
  'Expired',
  'Refunded',
  'Partially Refunded',
  'User canceled',
  'Canceled',
  'Failed',
]);

const getEscrowSetting = async () => AdminSetting.findOneAndUpdate(
  { key: 'escrow' },
  { $setOnInsert: { key: 'escrow', autoAccept: false } },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

const validationMessage = (error) => {
  if (error.name !== 'ValidationError') {
    return null;
  }

  return Object.values(error.errors)
    .map((validationError) => validationError.message)
    .join(', ');
};

const sendError = (res, error, fallbackMessage) => {
  const message = validationMessage(error);

  if (message) {
    return res.status(400).json({ success: false, data: null, message });
  }

  if (error instanceof khaltiService.KhaltiError || error instanceof escrowService.EscrowError) {
    return res.status(error.statusCode).json({
      success: false,
      data: null,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    data: null,
    message: fallbackMessage,
  });
};

const createOrder = async (req, res) => {
  try {
    const { listingId, paymentMethod = 'khalti_wallet' } = req.body || {};

    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'A valid listing ID is required',
      });
    }

    if (!['khalti_wallet', 'card'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Payment method must be khalti_wallet or card',
      });
    }

    const listing = await Listing.findById(listingId);

    if (!listing || listing.status !== 'active') {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Listing is not available for purchase',
      });
    }

    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'You cannot purchase your own listing',
      });
    }

    const order = new Order({
      buyer: req.user._id,
      seller: listing.seller,
      listing: listing._id,
      amount: listing.price,
      price: listing.price,
      quantity: 1,
      paymentMethod,
    });

    await order.validate();

    const payment = await khaltiService.initiatePayment({
      order,
      buyer: req.user,
      listing,
    });

    if (!payment.pidx || !payment.payment_url) {
      throw new khaltiService.KhaltiError('Khalti did not return a payment link');
    }

    order.paymentId = payment.pidx;
    await order.save();

    return res.status(201).json({
      success: true,
      data: {
        order,
        payment: {
          pidx: payment.pidx,
          paymentUrl: payment.payment_url,
          expiresAt: payment.expires_at,
          expiresIn: payment.expires_in,
        },
      },
      message: 'Order created and Khalti payment initiated',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to create order');
  }
};

const verifyKhaltiPayment = async (req, res) => {
  try {
    const { orderId, pidx } = req.body || {};

    if (!mongoose.isValidObjectId(orderId) || typeof pidx !== 'string' || !pidx.trim()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'A valid order ID and Khalti pidx are required',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Order not found',
      });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'You can only verify payment for your own orders',
      });
    }

    if (order.status === 'completed') {
      return res.status(200).json({
        success: true,
        data: { order, autoAccepted: true },
        message: 'Payment was already verified and escrow released',
      });
    }

    if (order.status === 'cancelled') {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Cancelled orders cannot be verified',
      });
    }

    if (order.paymentId !== pidx.trim()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Khalti pidx does not match this order',
      });
    }

    const payment = await khaltiService.lookupPayment(pidx.trim());

    if (payment.status !== 'Completed') {
      if (terminalFailedStatuses.has(payment.status)) {
        order.status = 'cancelled';
        order.paymentStatus = payment.status === 'Refunded' || payment.status === 'Partially Refunded'
          ? 'refunded'
          : 'failed';
        await order.save();
      }

      return res.status(409).json({
        success: false,
        data: { paymentStatus: payment.status },
        message: 'Khalti payment is not completed',
      });
    }

    const expectedAmountInPaisa = Math.round(order.amount * 100);

    if (payment.pidx !== order.paymentId || payment.total_amount !== expectedAmountInPaisa) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Khalti payment details do not match this order',
      });
    }

    const paidOrder = await escrowService.confirmPayment(order._id, {
      transactionId: payment.transaction_id,
    });

    const setting = await getEscrowSetting();
    let verifiedOrder = paidOrder;

    if (setting.autoAccept) {
      verifiedOrder = await escrowService.releaseEscrow(order._id);
    }

    return res.status(200).json({
      success: true,
      data: {
        order: verifiedOrder,
        autoAccepted: setting.autoAccept,
      },
      message: setting.autoAccept
        ? 'Payment verified and escrow released automatically'
        : 'Payment verified and awaiting admin approval',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to verify Khalti payment');
  }
};

const getMyOrders = async (req, res) => {
  try {
    const populate = [
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email' },
      { path: 'listing', select: 'title images status' },
    ];
    const [purchases, sales] = await Promise.all([
      Order.find({ buyer: req.user._id }).populate(populate).sort({ createdAt: -1 }),
      Order.find({ seller: req.user._id }).populate(populate).sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      data: { purchases, sales },
      message: 'Account orders retrieved',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to retrieve account orders');
  }
};

const approveOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid order ID',
      });
    }

    const order = await escrowService.releaseEscrow(req.params.id);

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Order approved and seller earnings released',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to approve order');
  }
};

const getAdminOverview = async (req, res) => {
  try {
    const [users, activeListings, soldListings, financialStats, orders] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments({ status: 'active' }),
      Listing.countDocuments({ status: 'sold' }),
      Order.aggregate([{
        $group: {
          _id: null,
          paidOrders: { $sum: { $cond: [{ $eq: ['$paymentVerified', true] }, 1, 0] } },
          pendingApprovals: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$paymentVerified', true] }, { $eq: ['$status', 'pending'] }] }, 1, 0],
            },
          },
          totalVolume: { $sum: { $cond: [{ $eq: ['$paymentVerified', true] }, '$amount', 0] } },
          commissionEarned: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$commission', 0] } },
        },
      }]),
      Order.find()
        .populate('buyer', 'name email')
        .populate('seller', 'name email')
        .populate('listing', 'title images status')
        .sort({ createdAt: -1 })
        .limit(100),
    ]);

    const totals = financialStats[0] || {};

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers: users,
          activeListings,
          soldListings,
          paidOrders: totals.paidOrders || 0,
          pendingApprovals: totals.pendingApprovals || 0,
          totalVolume: totals.totalVolume || 0,
          commissionEarned: totals.commissionEarned || 0,
        },
        orders,
      },
      message: 'Admin marketplace overview retrieved',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to retrieve admin overview');
  }
};

const getAutoAcceptSetting = async (req, res) => {
  try {
    const setting = await getEscrowSetting();

    return res.status(200).json({
      success: true,
      data: { autoAccept: setting.autoAccept },
      message: 'Auto-accept setting retrieved',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to retrieve auto-accept setting');
  }
};

const updateAutoAcceptSetting = async (req, res) => {
  try {
    const { autoAccept } = req.body || {};

    if (typeof autoAccept !== 'boolean') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'autoAccept must be a boolean',
      });
    }

    const setting = await AdminSetting.findOneAndUpdate(
      { key: 'escrow' },
      { $set: { autoAccept }, $setOnInsert: { key: 'escrow' } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    return res.status(200).json({
      success: true,
      data: { autoAccept: setting.autoAccept },
      message: `Automatic escrow approval ${setting.autoAccept ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    return sendError(res, error, 'Unable to update auto-accept setting');
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  verifyKhaltiPayment,
  approveOrder,
  getAdminOverview,
  getAutoAcceptSetting,
  updateAutoAcceptSetting,
};
