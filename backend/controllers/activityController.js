const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');
const RecentlyViewed = require('../models/RecentlyViewed');

const listingPopulation = {
  path: 'listing',
  populate: { path: 'seller', select: 'name role reputation' },
};

const isValidListingId = (listingId) => mongoose.isValidObjectId(listingId);

const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate(listingPopulation)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: favorites.filter((favorite) => favorite.listing),
      message: 'Favorites retrieved successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: 'Unable to retrieve favorites' });
  }
};

const getFavoriteStatus = async (req, res) => {
  try {
    if (!isValidListingId(req.params.listingId)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid listing ID' });
    }

    const favorite = await Favorite.findOne({
      user: req.user._id,
      listing: req.params.listingId,
    });

    return res.status(200).json({
      success: true,
      data: { isFavorite: Boolean(favorite), favoriteId: favorite?._id || null },
      message: 'Favorite status retrieved successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: 'Unable to retrieve favorite status' });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { listingId } = req.body || {};

    if (!isValidListingId(listingId)) {
      return res.status(400).json({ success: false, data: null, message: 'A valid listing ID is required' });
    }

    const listingExists = await Listing.exists({ _id: listingId });
    if (!listingExists) {
      return res.status(404).json({ success: false, data: null, message: 'Listing not found' });
    }

    const favorite = await Favorite.findOneAndUpdate(
      { user: req.user._id, listing: listingId },
      { $setOnInsert: { user: req.user._id, listing: listingId, createdAt: new Date() } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).populate(listingPopulation);

    return res.status(200).json({
      success: true,
      data: favorite,
      message: 'Listing added to favorites',
    });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: 'Unable to add favorite' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    if (!isValidListingId(req.params.listingId)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid listing ID' });
    }

    await Favorite.findOneAndDelete({
      user: req.user._id,
      listing: req.params.listingId,
    });

    return res.status(200).json({
      success: true,
      data: { listingId: req.params.listingId },
      message: 'Listing removed from favorites',
    });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: 'Unable to remove favorite' });
  }
};

const getRecentlyViewed = async (req, res) => {
  try {
    const activities = await RecentlyViewed.find({ user: req.user._id })
      .populate(listingPopulation)
      .sort({ lastViewedAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: activities.filter((activity) => activity.listing),
      message: 'Recently viewed listings retrieved successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: 'Unable to retrieve recently viewed listings' });
  }
};

module.exports = {
  getFavorites,
  getFavoriteStatus,
  addFavorite,
  removeFavorite,
  getRecentlyViewed,
};
