const express = require('express');
const {
  createReview,
  getListingReviews,
  getSellerReviews,
  getMyReviewActivity,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/listing/:listingId', getListingReviews);
router.get('/seller/:sellerId', getSellerReviews);
router.get('/mine', protect, getMyReviewActivity);
router.post('/', protect, createReview);

module.exports = router;
