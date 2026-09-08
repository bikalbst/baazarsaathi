const express = require('express');
const { predictPrice } = require('../controllers/pricePredictionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/predict', protect, predictPrice);

module.exports = router;
