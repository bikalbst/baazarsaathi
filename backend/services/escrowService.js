const mongoose = require('mongoose');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');

class EscrowError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'EscrowError';
    this.statusCode = statusCode;
  }
}

const confirmPayment = async (orderId, { transactionId } = {}) => {
  const session = await mongoose.startSession();
  let verifiedOrder;

  try {
    await session.withTransaction(async () => {
      const currentOrder = await Order.findById(orderId).session(session);

      if (!currentOrder) {
        throw new EscrowError('Order not found', 404);
      }

      if (currentOrder.paymentVerified) {
        verifiedOrder = currentOrder;
        return;
      }

      if (currentOrder.status !== 'pending') {
        throw new EscrowError('Only pending orders can receive payment', 409);
      }

      const listing = await Listing.findOneAndUpdate(
        { _id: currentOrder.listing, status: 'active' },
        { $set: { status: 'sold' } },
        { new: true, session },
      );

      if (!listing) {
        throw new EscrowError('Listing is no longer available', 409);
      }

      currentOrder.paymentVerified = true;
      currentOrder.paymentStatus = 'paid';
      currentOrder.paymentTransactionId = transactionId;
      currentOrder.paidAt = currentOrder.paidAt || new Date();
      verifiedOrder = await currentOrder.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return verifiedOrder;
};

const releaseEscrow = async (orderId) => {
  const session = await mongoose.startSession();
  let releasedOrder;

  try {
    await session.withTransaction(async () => {
      const currentOrder = await Order.findById(orderId).session(session);

      if (!currentOrder) {
        throw new EscrowError('Order not found', 404);
      }

      if (currentOrder.status === 'completed') {
        releasedOrder = currentOrder;
        return;
      }

      if (currentOrder.status !== 'pending') {
        throw new EscrowError('Only pending orders can be approved', 409);
      }

      if (!currentOrder.paymentVerified) {
        throw new EscrowError('Khalti payment must be verified before approval', 400);
      }

      const listing = await Listing.findOneAndUpdate(
        { _id: currentOrder.listing, status: { $in: ['active', 'sold'] } },
        { $set: { status: 'sold' } },
        { new: true, session },
      );

      if (!listing) {
        throw new EscrowError('Listing is no longer available', 409);
      }

      const seller = await User.findOneAndUpdate(
        { _id: currentOrder.seller },
        { $inc: { walletBalance: currentOrder.sellerEarning } },
        { new: true, session, runValidators: true },
      );

      if (!seller) {
        throw new EscrowError('Seller account not found', 404);
      }

      currentOrder.status = 'completed';
      currentOrder.releasedAt = new Date();
      releasedOrder = await currentOrder.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return releasedOrder;
};

module.exports = { EscrowError, confirmPayment, releaseEscrow };
