const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required'],
    immutable: true,
    unique: true,
    index: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required'],
    immutable: true,
    index: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required'],
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
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least one'],
    max: [5, 'Rating cannot exceed five'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number',
    },
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters'],
    default: '',
  },
}, { timestamps: true });

reviewSchema.index({ seller: 1, createdAt: -1 });
reviewSchema.index({ listing: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
