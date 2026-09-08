const mongoose = require('mongoose');
const Order = require('../models/Order');
const Review = require('../models/Review');
const User = require('../models/User');
const reputationService = require('../services/reputationService');

const parsePagination = (query) => ({
  page: Math.max(1, Number.parseInt(query.page, 10) || 1),
  limit: Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 10)),
});

const sendReviewList = async ({ res, query, filter, message }) => {
  const { page, limit } = parsePagination(query);
  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('reviewer', 'name')
      .populate('seller', 'name reputation')
      .populate('listing', 'title images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: { reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    message,
  });
};

const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment = '' } = req.body || {};
    const numericRating = Number(rating);

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, data: null, message: 'A valid order ID is required' });
    }

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, data: null, message: 'Rating must be a whole number from 1 to 5' });
    }

    if (typeof comment !== 'string' || comment.length > 1000) {
      return res.status(400).json({ success: false, data: null, message: 'Review must be text up to 1000 characters' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, data: null, message: 'Order not found' });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, data: null, message: 'Only the buyer for this order can review it' });
    }

    if (order.status !== 'completed' || !order.paymentVerified) {
      return res.status(409).json({ success: false, data: null, message: 'A review can be submitted after the order is completed' });
    }

    const review = await Review.create({
      order: order._id,
      reviewer: req.user._id,
      seller: order.seller,
      listing: order.listing,
      rating: numericRating,
      comment: comment.trim(),
    });

    const reputation = await reputationService.refreshSellerReputation(order.seller);
    await review.populate('reviewer', 'name');

    return res.status(201).json({
      success: true,
      data: { review, reputation },
      message: 'Review submitted and seller reputation updated',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, data: null, message: 'This order has already been reviewed' });
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((item) => item.message).join(', ');
      return res.status(400).json({ success: false, data: null, message });
    }
    return res.status(500).json({ success: false, data: null, message: 'Unable to submit review' });
  }
};

const getListingReviews = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.listingId)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid listing ID' });
    }
    return sendReviewList({
      res,
      query: req.query,
      filter: { listing: req.params.listingId },
      message: 'Listing reviews retrieved successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: 'Unable to retrieve listing reviews' });
  }
};

const getSellerReviews = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.sellerId)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid seller ID' });
    }

    const seller = await User.findById(req.params.sellerId).select('name reputation');
    if (!seller) {
      return res.status(404).json({ success: false, data: null, message: 'Seller not found' });
    }

    const { page, limit } = parsePagination(req.query);
    const filter = { seller: req.params.sellerId };
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('reviewer', 'name')
        .populate('listing', 'title images')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { seller, reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
      message: 'Seller reviews retrieved successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: 'Unable to retrieve seller reviews' });
  }
};

const getMyReviewActivity = async (req, res) => {
  try {
    const submittedReviews = await Review.find({ reviewer: req.user._id })
      .populate('seller', 'name reputation')
      .populate('listing', 'title images')
      .sort({ createdAt: -1 });
    const reviewedOrderIds = submittedReviews.map((review) => review.order);
    const reviewableOrders = await Order.find({
      buyer: req.user._id,
      status: 'completed',
      paymentVerified: true,
      _id: { $nin: reviewedOrderIds },
    })
      .populate('seller', 'name reputation')
      .populate('listing', 'title images')
      .sort({ releasedAt: -1 });

    return res.status(200).json({
      success: true,
      data: { submittedReviews, reviewableOrders },
      message: 'Review activity retrieved successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: 'Unable to retrieve review activity' });
  }
};

module.exports = { createReview, getListingReviews, getSellerReviews, getMyReviewActivity };
