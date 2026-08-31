const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true,
    maxlength: [80, 'Category cannot exceed 80 characters'],
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    trim: true,
    lowercase: true,
    maxlength: [50, 'Condition cannot exceed 50 characters'],
  },
  images: {
    type: [{ type: String, trim: true }],
    default: [],
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required'],
    immutable: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'inactive'],
    default: 'active',
    lowercase: true,
  },
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ category: 1, condition: 1, status: 1, price: 1, createdAt: -1 });

module.exports = mongoose.model('Listing', listingSchema);
