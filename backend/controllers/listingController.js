const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const activityService = require('../services/activityService');

const editableFields = [
  'title',
  'description',
  'price',
  'category',
  'condition',
  'images',
  'status',
];

const sortOptions = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  most_viewed: { views: -1 },
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

  return res.status(500).json({
    success: false,
    data: null,
    message: fallbackMessage,
  });
};

const getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      condition,
      status,
      minPrice,
      maxPrice,
      sort = 'newest',
      order,
    } = req.query;
    const filter = {};

    if (search && search.trim()) {
      const expression = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ title: expression }, { description: expression }];
    }

    if (category) {
      filter.category = category.trim().toLowerCase();
    }

    if (condition) {
      filter.condition = condition.trim().toLowerCase();
    }

    if (status) {
      filter.status = status.trim().toLowerCase();
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const parsedMinPrice = minPrice === undefined ? undefined : Number(minPrice);
      const parsedMaxPrice = maxPrice === undefined ? undefined : Number(maxPrice);

      if (
        (parsedMinPrice !== undefined && (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0))
        || (parsedMaxPrice !== undefined && (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0))
        || (parsedMinPrice !== undefined && parsedMaxPrice !== undefined && parsedMinPrice > parsedMaxPrice)
      ) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Price filters must be valid, non-negative numbers and minPrice cannot exceed maxPrice',
        });
      }

      filter.price = {};
      if (parsedMinPrice !== undefined) filter.price.$gte = parsedMinPrice;
      if (parsedMaxPrice !== undefined) filter.price.$lte = parsedMaxPrice;
    }

    let sortBy = sortOptions[sort];

    if (!sortBy && ['createdAt', 'price', 'views', 'title'].includes(sort)) {
      sortBy = { [sort]: order === 'asc' ? 1 : -1 };
    }

    if (!sortBy) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid sort option',
      });
    }

    const listings = await Listing.find(filter)
      .populate('seller', 'name role reputation')
      .sort(sortBy);

    return res.status(200).json({
      success: true,
      data: listings,
      message: 'Listings retrieved successfully',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to retrieve listings');
  }
};

const getListingById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid listing ID',
      });
    }

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, runValidators: true },
    ).populate('seller', 'name role reputation');

    if (!listing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Listing not found',
      });
    }

    if (req.user) {
      try {
        await activityService.recordListingView(req.user._id, listing._id);
      } catch (error) {
        // Activity tracking must never prevent a buyer from viewing a listing.
      }
    }

    return res.status(200).json({
      success: true,
      data: listing,
      message: 'Listing retrieved successfully',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to retrieve listing');
  }
};

const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .populate('seller', 'name role reputation')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: listings,
      message: 'Account listings retrieved successfully',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to retrieve account listings');
  }
};

const createListing = async (req, res) => {
  try {
    const listingData = {};

    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        listingData[field] = req.body[field];
      }
    }

    listingData.seller = req.user._id;
    const listing = await Listing.create(listingData);
    await listing.populate('seller', 'name role reputation');

    return res.status(201).json({
      success: true,
      data: listing,
      message: 'Listing created successfully',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to create listing');
  }
};

const updateListing = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid listing ID',
      });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Listing not found',
      });
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'You can only update your own listings',
      });
    }

    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        listing[field] = req.body[field];
      }
    }

    await listing.save();
    await listing.populate('seller', 'name role reputation');

    return res.status(200).json({
      success: true,
      data: listing,
      message: 'Listing updated successfully',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to update listing');
  }
};

const deleteListing = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid listing ID',
      });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Listing not found',
      });
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'You can only delete your own listings',
      });
    }

    await listing.deleteOne();

    return res.status(200).json({
      success: true,
      data: { id: listing._id },
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to delete listing');
  }
};

module.exports = {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
