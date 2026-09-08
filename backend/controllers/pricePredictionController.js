const pricePredictionService = require('../services/pricePredictionService');

const predictPrice = async (req, res) => {
  try {
    const { title, description, category, condition } = req.body || {};
    const fields = [title, description, category, condition];

    if (fields.some((value) => typeof value !== 'string' || !value.trim())) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Title, description, category, and condition are required',
      });
    }

    if (!['new', 'like-new', 'used'].includes(condition.trim().toLowerCase())) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid listing condition' });
    }

    const prediction = await pricePredictionService.predictPrice({
      title: title.trim(),
      description: description.trim(),
      category: category.trim().toLowerCase(),
      condition: condition.trim().toLowerCase(),
    });

    return res.status(200).json({
      success: true,
      data: prediction,
      message: 'Price estimate generated successfully',
    });
  } catch (error) {
    if (error instanceof pricePredictionService.PricePredictionError) {
      return res.status(error.statusCode).json({ success: false, data: null, message: error.message });
    }
    return res.status(500).json({ success: false, data: null, message: 'Unable to generate a price estimate' });
  }
};

module.exports = { predictPrice };
