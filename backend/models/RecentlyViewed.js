const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    immutable: true,
    index: true,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Listing is required'],
    immutable: true,
    index: true,
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastViewedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

recentlyViewedSchema.index({ user: 1, listing: 1 }, { unique: true });
recentlyViewedSchema.index({ user: 1, lastViewedAt: -1 });

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema);
