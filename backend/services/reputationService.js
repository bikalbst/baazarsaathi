const mongoose = require('mongoose');
const Order = require('../models/Order');
const Review = require('../models/Review');
const User = require('../models/User');

const round = (value, digits = 2) => Number(value.toFixed(digits));

const determineTier = ({ score, ratingCount }) => {
  if (score >= 85 && ratingCount >= 10) return 'top-seller';
  if (score >= 70 && ratingCount >= 3) return 'trusted';
  if (score >= 45) return 'developing';
  return 'new';
};

const calculateSellerReputation = async (sellerId) => {
  const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
  const [reviewStats, orderStats] = await Promise.all([
    Review.aggregate([
      { $match: { seller: sellerObjectId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, ratingCount: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { seller: sellerObjectId, paymentVerified: true } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const averageRating = reviewStats[0]?.averageRating || 0;
  const ratingCount = reviewStats[0]?.ratingCount || 0;
  const totalOrders = orderStats[0]?.totalOrders || 0;
  const completedOrders = orderStats[0]?.completedOrders || 0;
  const completionRate = totalOrders > 0 ? completedOrders / totalOrders : 0;

  // Bayesian weighting stops one five-star review from outranking established sellers.
  const ratingPrior = 4;
  const minimumReviewWeight = 5;
  const bayesianRating = ratingCount > 0
    ? ((ratingCount * averageRating) + (minimumReviewWeight * ratingPrior))
      / (ratingCount + minimumReviewWeight)
    : 0;
  const score = ratingCount > 0
    ? Math.min(100, (bayesianRating / 5) * 70 + completionRate * 20 + Math.min(completedOrders / 20, 1) * 10)
    : Math.min(30, completionRate * 20 + Math.min(completedOrders / 20, 1) * 10);

  const reputation = {
    averageRating: round(averageRating),
    ratingCount,
    completionRate: round(completionRate, 4),
    score: round(score),
    tier: determineTier({ score, ratingCount }),
    updatedAt: new Date(),
  };

  return { ...reputation, completedOrders, totalOrders };
};

const refreshSellerReputation = async (sellerId) => {
  const reputation = await calculateSellerReputation(sellerId);
  await User.findByIdAndUpdate(sellerId, {
    $set: {
      reputation: {
        averageRating: reputation.averageRating,
        ratingCount: reputation.ratingCount,
        completionRate: reputation.completionRate,
        score: reputation.score,
        tier: reputation.tier,
        updatedAt: reputation.updatedAt,
      },
    },
  }, { runValidators: true });
  return reputation;
};

module.exports = { calculateSellerReputation, refreshSellerReputation, determineTier };
