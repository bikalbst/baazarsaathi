const express = require('express');
const {
  getFavorites,
  getFavoriteStatus,
  addFavorite,
  removeFavorite,
  getRecentlyViewed,
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/favorites', getFavorites);
router.get('/favorites/:listingId', getFavoriteStatus);
router.post('/favorites', addFavorite);
router.delete('/favorites/:listingId', removeFavorite);
router.get('/recently-viewed', getRecentlyViewed);

module.exports = router;
